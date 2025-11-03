const Assignment = require('../models/Assignment.model');
const AssignmentSubmission = require('../models/AssignmentSubmission.model');
const User = require('../models/User.model');
const DbUtils = require('../utils/db.utils');
const { deleteFileFromGridFS } = require('../middleware/upload.middleware');

class AssignmentTaskService {
  static async createAssignment(teacherId, assignmentData) {
    try {
      const { title, description, dueDate, studentIds, document, documentName, documentType } = assignmentData;

      if (!title || !description || !dueDate) {
        throw {
          status: 400,
          message: 'Title, description, and due date are required'
        };
      }

      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        throw {
          status: 400,
          message: 'At least one student must be selected'
        };
      }

      // Verify teacher exists
      const teacher = await User.findById(teacherId);
      if (!teacher) {
        throw {
          status: 404,
          message: 'Teacher not found'
        };
      }

      if (teacher.role !== 'teacher') {
        throw {
          status: 403,
          message: 'Only teachers can create assignments'
        };
      }

      // Verify all students exist and are assigned to this teacher
      const students = await User.find({
        _id: { $in: studentIds },
        role: 'student'
      });

      if (students.length !== studentIds.length) {
        throw {
          status: 400,
          message: 'One or more students not found'
        };
      }

      // Verify all students are assigned to this teacher
      const invalidStudents = students.filter(
        student => student.assignedTeacher?.toString() !== teacherId.toString()
      );

      if (invalidStudents.length > 0) {
        throw {
          status: 403,
          message: 'Cannot assign to students not assigned to you'
        };
      }

      // Verify due date is in the future
      const due = new Date(dueDate);
      if (due <= new Date()) {
        throw {
          status: 400,
          message: 'Due date must be in the future'
        };
      }

      const assignment = await Assignment.create({
        title,
        description,
        dueDate: due,
        assignedBy: teacherId,
        assignedTo: studentIds,
        document: document || null,
        documentName: documentName || null,
        documentType: documentType || null,
        status: 'pending'
      });

      const populatedAssignment = await Assignment.findById(assignment._id)
        .populate('assignedBy', 'firstName lastName email username')
        .populate('assignedTo', 'firstName lastName email username');

      return populatedAssignment;
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to create assignment'
      };
    }
  }

  static async getAssignmentsByTeacher(teacherId, page = 1, limit = 10) {
    try {
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      if (pageNum < 1) {
        throw {
          status: 400,
          message: 'Page must be greater than 0'
        };
      }

      if (limitNum < 1 || limitNum > 100) {
        throw {
          status: 400,
          message: 'Limit must be between 1 and 100'
        };
      }

      const skip = (pageNum - 1) * limitNum;

      const [assignments, total] = await Promise.all([
        Assignment.find({ assignedBy: teacherId })
          .populate('assignedBy', 'firstName lastName email username')
          .populate('assignedTo', 'firstName lastName email username')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        Assignment.countDocuments({ assignedBy: teacherId })
      ]);

      const totalPages = Math.ceil(total / limitNum);

      return {
        assignments,
        pagination: {
          currentPage: pageNum,
          limit: limitNum,
          totalItems: total,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      };
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to get assignments'
      };
    }
  }

  static async getAssignmentsByStudent(studentId, page = 1, limit = 10) {
    try {
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      if (pageNum < 1) {
        throw {
          status: 400,
          message: 'Page must be greater than 0'
        };
      }

      if (limitNum < 1 || limitNum > 100) {
        throw {
          status: 400,
          message: 'Limit must be between 1 and 100'
        };
      }

      const skip = (pageNum - 1) * limitNum;

      const [assignments, total] = await Promise.all([
        Assignment.find({ assignedTo: studentId })
          .populate('assignedBy', 'firstName lastName email username')
          .sort({ dueDate: 1 })
          .skip(skip)
          .limit(limitNum),
        Assignment.countDocuments({ assignedTo: studentId })
      ]);

      // Fetch submission status for each assignment
      const assignmentIds = assignments.map(a => a._id);
      const submissions = await AssignmentSubmission.find({
        assignment: { $in: assignmentIds },
        student: studentId
      });

      // Create a map of assignment ID to submission
      const submissionMap = new Map();
      submissions.forEach(sub => {
        submissionMap.set(sub.assignment.toString(), sub);
      });

      // Add submission info to each assignment and calculate dynamic status
      const assignmentsWithSubmission = assignments.map(assignment => {
        const assignmentObj = assignment.toObject();
        const submission = submissionMap.get(assignment._id.toString());
        const now = new Date();
        const dueDate = new Date(assignment.dueDate);
        
        // Calculate status based on submission state and due date
        let status = 'pending';
        if (submission && submission.isSubmitted) {
          if (submission.grade !== null && submission.gradedAt !== null) {
            status = 'graded';
          } else {
            status = 'submitted';
          }
        } else if (now > dueDate) {
          status = 'late';
        }
        
        return {
          ...assignmentObj,
          status, // Override with calculated status
          submission: submission ? {
            _id: submission._id,
            isSubmitted: submission.isSubmitted,
            submittedAt: submission.submittedAt,
            grade: submission.grade,
            feedback: submission.feedback,
            gradedAt: submission.gradedAt,
            submittedDocument: submission.submittedDocument,
            submittedDocumentName: submission.submittedDocumentName
          } : null
        };
      });

      const totalPages = Math.ceil(total / limitNum);

      return {
        assignments: assignmentsWithSubmission,
        pagination: {
          currentPage: pageNum,
          limit: limitNum,
          totalItems: total,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      };
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to get assignments'
      };
    }
  }

  static async getAssignmentById(assignmentId, userId, userRole) {
    try {
      const assignment = await Assignment.findById(assignmentId)
        .populate('assignedBy', 'firstName lastName email username')
        .populate('assignedTo', 'firstName lastName email username');

      if (!assignment) {
        throw {
          status: 404,
          message: 'Assignment not found'
        };
      }

      // Verify access: teacher can only see their own assignments, student can only see assignments assigned to them
      if (userRole === 'teacher') {
        if (assignment.assignedBy._id.toString() !== userId.toString()) {
          throw {
            status: 403,
            message: 'Access denied. You can only view your own assignments.'
          };
        }
      } else if (userRole === 'student') {
        const isAssigned = assignment.assignedTo.some(
          student => student._id.toString() === userId.toString()
        );
        if (!isAssigned) {
          throw {
            status: 403,
            message: 'Access denied. This assignment is not assigned to you.'
          };
        }
      }

      return assignment;
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to get assignment'
      };
    }
  }

  static async updateAssignment(assignmentId, teacherId, updateData) {
    try {
      const { title, description, dueDate, studentIds, document, documentName, documentType } = updateData;

      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        throw {
          status: 404,
          message: 'Assignment not found'
        };
      }

      // Verify teacher owns this assignment
      if (assignment.assignedBy.toString() !== teacherId.toString()) {
        throw {
          status: 403,
          message: 'Access denied. You can only update your own assignments.'
        };
      }

      if (title !== undefined) {
        if (!title.trim()) {
          throw {
            status: 400,
            message: 'Title cannot be empty'
          };
        }
        assignment.title = title.trim();
      }

      if (description !== undefined) {
        if (!description.trim()) {
          throw {
            status: 400,
            message: 'Description cannot be empty'
          };
        }
        assignment.description = description.trim();
      }

      if (dueDate !== undefined) {
        const due = new Date(dueDate);
        if (due <= new Date()) {
          throw {
            status: 400,
            message: 'Due date must be in the future'
          };
        }
        assignment.dueDate = due;
      }

      if (studentIds !== undefined) {
        if (!Array.isArray(studentIds) || studentIds.length === 0) {
          throw {
            status: 400,
            message: 'At least one student must be selected'
          };
        }

        // Verify all students are assigned to this teacher
        const students = await User.find({
          _id: { $in: studentIds },
          role: 'student',
          assignedTeacher: teacherId
        });

        if (students.length !== studentIds.length) {
          throw {
            status: 400,
            message: 'One or more students are not assigned to you'
          };
        }

        assignment.assignedTo = studentIds;
      }

      if (document !== undefined) {
        assignment.document = document;
      }

      if (documentName !== undefined) {
        assignment.documentName = documentName;
      }

      if (documentType !== undefined) {
        assignment.documentType = documentType;
      }

      await assignment.save();

      const updatedAssignment = await Assignment.findById(assignmentId)
        .populate('assignedBy', 'firstName lastName email username')
        .populate('assignedTo', 'firstName lastName email username');

      return updatedAssignment;
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to update assignment'
      };
    }
  }

  static async deleteAssignment(assignmentId, teacherId) {
    try {
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        throw {
          status: 404,
          message: 'Assignment not found'
        };
      }

      // Verify teacher owns this assignment
      if (assignment.assignedBy.toString() !== teacherId.toString()) {
        throw {
          status: 403,
          message: 'Access denied. You can only delete your own assignments.'
        };
      }

      // Delete associated file from GridFS if exists
      if (assignment.document) {
        try {
          await deleteFileFromGridFS(assignment.document);
        } catch (error) {
          console.error('Error deleting file from GridFS:', error);
          // Continue with assignment deletion even if file deletion fails
        }
      }

      await Assignment.findByIdAndDelete(assignmentId);

      return { message: 'Assignment deleted successfully' };
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to delete assignment'
      };
    }
  }

  static async getAllAssignments(page = 1, limit = 10) {
    try {
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      if (pageNum < 1) {
        throw {
          status: 400,
          message: 'Page must be greater than 0'
        };
      }

      if (limitNum < 1 || limitNum > 100) {
        throw {
          status: 400,
          message: 'Limit must be between 1 and 100'
        };
      }

      const skip = (pageNum - 1) * limitNum;

      const [assignments, total] = await Promise.all([
        Assignment.find({})
          .populate('assignedBy', 'firstName lastName email username')
          .populate('assignedTo', 'firstName lastName email username')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        Assignment.countDocuments({})
      ]);

      const totalPages = Math.ceil(total / limitNum);

      return {
        assignments,
        pagination: {
          currentPage: pageNum,
          limit: limitNum,
          totalItems: total,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      };
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to get assignments'
      };
    }
  }
}

module.exports = AssignmentTaskService;

