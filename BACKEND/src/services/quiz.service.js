const Quiz = require('../models/Quiz.model');
const User = require('../models/User.model');
const DbUtils = require('../utils/db.utils');
const { deleteFileFromGridFS } = require('../middleware/upload.middleware');

class QuizService {
  static async createQuiz(teacherId, quizData) {
    try {
      const { title, description, quizLink, dueDate, studentIds, document, documentName, documentType } = quizData;

      if (!title || !description) {
        throw {
          status: 400,
          message: 'Title and description are required'
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
          message: 'Only teachers can create quizzes'
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

      const quiz = await Quiz.create({
        title,
        description,
        quizLink: quizLink || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedBy: teacherId,
        assignedTo: studentIds,
        document: document || null,
        documentName: documentName || null,
        documentType: documentType || null,
        status: 'active'
      });

      const populatedQuiz = await Quiz.findById(quiz._id)
        .populate('assignedBy', 'firstName lastName email username')
        .populate('assignedTo', 'firstName lastName email username');

      return populatedQuiz;
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to create quiz'
      };
    }
  }

  static async getQuizzesByTeacher(teacherId, page = 1, limit = 10) {
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

      const [quizzes, total] = await Promise.all([
        Quiz.find({ assignedBy: teacherId })
          .populate('assignedBy', 'firstName lastName email username')
          .populate('assignedTo', 'firstName lastName email username')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        Quiz.countDocuments({ assignedBy: teacherId })
      ]);

      const totalPages = Math.ceil(total / limitNum);

      return {
        quizzes,
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
        message: dbError.message || 'Failed to get quizzes'
      };
    }
  }

  static async getQuizzesByStudent(studentId, page = 1, limit = 10) {
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

      const [quizzes, total] = await Promise.all([
        Quiz.find({ assignedTo: studentId })
          .populate('assignedBy', 'firstName lastName email username')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        Quiz.countDocuments({ assignedTo: studentId })
      ]);

      const totalPages = Math.ceil(total / limitNum);

      return {
        quizzes,
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
        message: dbError.message || 'Failed to get quizzes'
      };
    }
  }

  static async getQuizById(quizId, userId, userRole) {
    try {
      const quiz = await Quiz.findById(quizId)
        .populate('assignedBy', 'firstName lastName email username')
        .populate('assignedTo', 'firstName lastName email username');

      if (!quiz) {
        throw {
          status: 404,
          message: 'Quiz not found'
        };
      }

      // Verify access: teacher can only see their own quizzes, student can only see quizzes assigned to them
      if (userRole === 'teacher') {
        if (quiz.assignedBy._id.toString() !== userId.toString()) {
          throw {
            status: 403,
            message: 'Access denied. You can only view your own quizzes.'
          };
        }
      } else if (userRole === 'student') {
        const isAssigned = quiz.assignedTo.some(
          student => student._id.toString() === userId.toString()
        );
        if (!isAssigned) {
          throw {
            status: 403,
            message: 'Access denied. This quiz is not assigned to you.'
          };
        }
      }

      return quiz;
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to get quiz'
      };
    }
  }

  static async updateQuiz(quizId, teacherId, updateData) {
    try {
      const { title, description, quizLink, dueDate, studentIds, document, documentName, documentType } = updateData;

      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        throw {
          status: 404,
          message: 'Quiz not found'
        };
      }

      // Verify teacher owns this quiz
      if (quiz.assignedBy.toString() !== teacherId.toString()) {
        throw {
          status: 403,
          message: 'Access denied. You can only update your own quizzes.'
        };
      }

      if (title !== undefined) {
        if (!title.trim()) {
          throw {
            status: 400,
            message: 'Title cannot be empty'
          };
        }
        quiz.title = title.trim();
      }

      if (description !== undefined) {
        if (!description.trim()) {
          throw {
            status: 400,
            message: 'Description cannot be empty'
          };
        }
        quiz.description = description.trim();
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

        quiz.assignedTo = studentIds;
      }

      if (quizLink !== undefined) {
        quiz.quizLink = quizLink;
      }

      if (dueDate !== undefined) {
        quiz.dueDate = dueDate ? new Date(dueDate) : null;
      }

      if (document !== undefined) {
        quiz.document = document;
      }

      if (documentName !== undefined) {
        quiz.documentName = documentName;
      }

      if (documentType !== undefined) {
        quiz.documentType = documentType;
      }

      await quiz.save();

      const updatedQuiz = await Quiz.findById(quizId)
        .populate('assignedBy', 'firstName lastName email username')
        .populate('assignedTo', 'firstName lastName email username');

      return updatedQuiz;
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to update quiz'
      };
    }
  }

  static async deleteQuiz(quizId, teacherId) {
    try {
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        throw {
          status: 404,
          message: 'Quiz not found'
        };
      }

      // Verify teacher owns this quiz
      if (quiz.assignedBy.toString() !== teacherId.toString()) {
        throw {
          status: 403,
          message: 'Access denied. You can only delete your own quizzes.'
        };
      }

      // Delete associated file from GridFS if exists
      if (quiz.document) {
        try {
          await deleteFileFromGridFS(quiz.document);
        } catch (error) {
          console.error('Error deleting file from GridFS:', error);
          // Continue with quiz deletion even if file deletion fails
        }
      }

      await Quiz.findByIdAndDelete(quizId);

      return { message: 'Quiz deleted successfully' };
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to delete quiz'
      };
    }
  }

  static async getAllQuizzes(page = 1, limit = 10) {
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

      const [quizzes, total] = await Promise.all([
        Quiz.find({})
          .populate('assignedBy', 'firstName lastName email username')
          .populate('assignedTo', 'firstName lastName email username')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        Quiz.countDocuments({})
      ]);

      const totalPages = Math.ceil(total / limitNum);

      return {
        quizzes,
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
        message: dbError.message || 'Failed to get quizzes'
      };
    }
  }
}

module.exports = QuizService;

