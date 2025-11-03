const AssignmentSubmission = require('../models/AssignmentSubmission.model');
const Assignment = require('../models/Assignment.model');
const User = require('../models/User.model');
const DbUtils = require('../utils/db.utils');
const { uploadToGridFS, deleteFileFromGridFS } = require('../middleware/upload.middleware');

class SubmissionService {
  static async submitAssignment(assignmentId, studentId, file) {
    try {
      // Verify assignment exists
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        throw {
          status: 404,
          message: 'Assignment not found'
        };
      }

      // Verify student exists and is assigned to this assignment
      const student = await User.findById(studentId);
      if (!student) {
        throw {
          status: 404,
          message: 'Student not found'
        };
      }

      if (student.role !== 'student') {
        throw {
          status: 403,
          message: 'Only students can submit assignments'
        };
      }

      const isAssigned = assignment.assignedTo.some(
        id => id.toString() === studentId.toString()
      );

      if (!isAssigned) {
        throw {
          status: 403,
          message: 'You are not assigned to this assignment'
        };
      }

      // Check if due date has passed
      if (new Date(assignment.dueDate) < new Date()) {
        throw {
          status: 400,
          message: 'Cannot submit assignment. Due date has passed.'
        };
      }

      if (!file) {
        throw {
          status: 400,
          message: 'File is required for submission'
        };
      }

      // Upload file to GridFS
      const filename = `submission-${Date.now()}-${file.originalname}`;
      const fileId = await uploadToGridFS(file, filename, {
        studentId: studentId.toString(),
        assignmentId: assignmentId.toString(),
        submissionType: 'submission'
      });

      // Check if submission already exists
      let submission = await AssignmentSubmission.findOne({
        assignment: assignmentId,
        student: studentId
      });

      if (submission) {
        // Delete old file if exists
        if (submission.submittedDocument) {
          try {
            await deleteFileFromGridFS(submission.submittedDocument);
          } catch (error) {
            console.error('Error deleting old submission file:', error);
          }
        }

        // Update existing submission
        submission.submittedDocument = fileId.toString();
        submission.submittedDocumentName = file.originalname;
        submission.submittedDocumentType = file.mimetype;
        submission.isSubmitted = true;
        submission.submittedAt = new Date();
        await submission.save();
      } else {
        // Create new submission
        submission = await AssignmentSubmission.create({
          assignment: assignmentId,
          student: studentId,
          submittedDocument: fileId.toString(),
          submittedDocumentName: file.originalname,
          submittedDocumentType: file.mimetype,
          isSubmitted: true,
          submittedAt: new Date()
        });
      }

      const populatedSubmission = await AssignmentSubmission.findById(submission._id)
        .populate('assignment', 'title description dueDate')
        .populate('student', 'firstName lastName email username');

      return populatedSubmission;
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to submit assignment'
      };
    }
  }

  static async unsubmitAssignment(assignmentId, studentId) {
    try {
      const submission = await AssignmentSubmission.findOne({
        assignment: assignmentId,
        student: studentId
      });

      if (!submission) {
        throw {
          status: 404,
          message: 'Submission not found'
        };
      }

      if (!submission.isSubmitted) {
        throw {
          status: 400,
          message: 'Assignment is not submitted'
        };
      }

      // Prevent unsubmit if already graded
      if (submission.grade !== null || submission.gradedAt !== null) {
        throw {
          status: 400,
          message: 'Cannot unsubmit assignment. It has already been graded by your teacher.'
        };
      }

      // Verify assignment due date hasn't passed
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        throw {
          status: 404,
          message: 'Assignment not found'
        };
      }

      if (new Date(assignment.dueDate) < new Date()) {
        throw {
          status: 400,
          message: 'Cannot unsubmit assignment. Due date has passed.'
        };
      }

      // Delete file from GridFS
      if (submission.submittedDocument) {
        try {
          await deleteFileFromGridFS(submission.submittedDocument);
        } catch (error) {
          console.error('Error deleting submission file:', error);
        }
      }

      // Reset submission
      submission.submittedDocument = null;
      submission.submittedDocumentName = null;
      submission.submittedDocumentType = null;
      submission.isSubmitted = false;
      submission.submittedAt = null;
      await submission.save();

      return submission;
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to unsubmit assignment'
      };
    }
  }

  static async replaceSubmission(assignmentId, studentId, file) {
    try {
      // Verify assignment exists and is not past due date
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        throw {
          status: 404,
          message: 'Assignment not found'
        };
      }

      if (new Date(assignment.dueDate) < new Date()) {
        throw {
          status: 400,
          message: 'Cannot replace submission. Due date has passed.'
        };
      }

      const submission = await AssignmentSubmission.findOne({
        assignment: assignmentId,
        student: studentId
      });

      if (!submission) {
        throw {
          status: 404,
          message: 'Submission not found'
        };
      }

      if (!submission.isSubmitted) {
        throw {
          status: 400,
          message: 'Assignment is not submitted. Use submit endpoint instead.'
        };
      }

      // Prevent replace if already graded
      if (submission.grade !== null || submission.gradedAt !== null) {
        throw {
          status: 400,
          message: 'Cannot replace submission. It has already been graded by your teacher.'
        };
      }

      if (!file) {
        throw {
          status: 400,
          message: 'File is required'
        };
      }

      // Delete old file from GridFS
      if (submission.submittedDocument) {
        try {
          await deleteFileFromGridFS(submission.submittedDocument);
        } catch (error) {
          console.error('Error deleting old submission file:', error);
        }
      }

      // Upload new file to GridFS
      const filename = `submission-${Date.now()}-${file.originalname}`;
      const fileId = await uploadToGridFS(file, filename, {
        studentId: studentId.toString(),
        assignmentId: assignmentId.toString(),
        submissionType: 'submission'
      });

      // Update submission with new file
      submission.submittedDocument = fileId.toString();
      submission.submittedDocumentName = file.originalname;
      submission.submittedDocumentType = file.mimetype;
      submission.submittedAt = new Date();
      await submission.save();

      const populatedSubmission = await AssignmentSubmission.findById(submission._id)
        .populate('assignment', 'title description dueDate')
        .populate('student', 'firstName lastName email username');

      return populatedSubmission;
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to replace submission'
      };
    }
  }

  static async getSubmission(assignmentId, studentId) {
    try {
      const submission = await AssignmentSubmission.findOne({
        assignment: assignmentId,
        student: studentId
      })
        .populate('assignment', 'title description dueDate assignedBy')
        .populate('student', 'firstName lastName email username')
        .populate('assignment.assignedBy', 'firstName lastName');

      return submission;
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to get submission'
      };
    }
  }

  static async getSubmissionsByAssignment(assignmentId, teacherId, page = 1, limit = 10) {
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

      // Verify assignment exists and belongs to teacher
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        throw {
          status: 404,
          message: 'Assignment not found'
        };
      }

      if (assignment.assignedBy.toString() !== teacherId.toString()) {
        throw {
          status: 403,
          message: 'Access denied. You can only view submissions for your own assignments.'
        };
      }

      const skip = (pageNum - 1) * limitNum;

      const [submissions, total] = await Promise.all([
        AssignmentSubmission.find({ assignment: assignmentId })
          .populate('student', 'firstName lastName email username')
          .sort({ submittedAt: -1 })
          .skip(skip)
          .limit(limitNum),
        AssignmentSubmission.countDocuments({ assignment: assignmentId })
      ]);

      const totalPages = Math.ceil(total / limitNum);

      return {
        submissions,
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
        message: dbError.message || 'Failed to get submissions'
      };
    }
  }

  static async gradeSubmission(submissionId, teacherId, grade, feedback) {
    try {
      if (grade !== null && (grade < 0 || grade > 100)) {
        throw {
          status: 400,
          message: 'Grade must be between 0 and 100'
        };
      }

      const submission = await AssignmentSubmission.findById(submissionId)
        .populate('assignment');

      if (!submission) {
        throw {
          status: 404,
          message: 'Submission not found'
        };
      }

      // Verify teacher owns this assignment
      if (submission.assignment.assignedBy.toString() !== teacherId.toString()) {
        throw {
          status: 403,
          message: 'Access denied. You can only grade submissions for your own assignments.'
        };
      }

      // Verify submission is submitted
      if (!submission.isSubmitted) {
        throw {
          status: 400,
          message: 'Cannot grade submission. Assignment has not been submitted yet.'
        };
      }

      submission.grade = grade;
      submission.feedback = feedback || null;
      submission.gradedAt = new Date();
      await submission.save();

      const populatedSubmission = await AssignmentSubmission.findById(submissionId)
        .populate('assignment', 'title description dueDate')
        .populate('student', 'firstName lastName email username');

      return populatedSubmission;
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to grade submission'
      };
    }
  }

  static async getAllSubmissions(page = 1, limit = 10) {
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

      const [submissions, total] = await Promise.all([
        AssignmentSubmission.find({ isSubmitted: true })
          .populate('assignment', 'title description dueDate assignedBy')
          .populate('student', 'firstName lastName email username')
          .populate('assignment.assignedBy', 'firstName lastName email username')
          .sort({ submittedAt: -1 })
          .skip(skip)
          .limit(limitNum),
        AssignmentSubmission.countDocuments({ isSubmitted: true })
      ]);

      const totalPages = Math.ceil(total / limitNum);

      return {
        submissions,
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
        message: dbError.message || 'Failed to get submissions'
      };
    }
  }
}

module.exports = SubmissionService;

