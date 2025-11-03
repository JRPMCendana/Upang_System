const QuizSubmission = require('../models/QuizSubmission.model');
const Quiz = require('../models/Quiz.model');
const User = require('../models/User.model');
const DbUtils = require('../utils/db.utils');
const { uploadToGridFS, deleteFileFromGridFS } = require('../middleware/upload.middleware');

class QuizSubmissionService {
  static async submitQuiz(quizId, studentId, file) {
    try {
      // Verify quiz exists
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        throw {
          status: 404,
          message: 'Quiz not found'
        };
      }

      // Verify student exists and is assigned to this quiz
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
          message: 'Only students can submit quizzes'
        };
      }

      const isAssigned = quiz.assignedTo.some(
        id => id.toString() === studentId.toString()
      );

      if (!isAssigned) {
        throw {
          status: 403,
          message: 'You are not assigned to this quiz'
        };
      }

      if (!file) {
        throw {
          status: 400,
          message: 'Screenshot/image file is required for submission'
        };
      }

      // Verify file is an image (for screenshot)
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedImageTypes.includes(file.mimetype)) {
        throw {
          status: 400,
          message: 'Only image files (JPEG, PNG, GIF, WEBP) are allowed for quiz submissions'
        };
      }

      // Upload file to GridFS
      const filename = `quiz-submission-${Date.now()}-${file.originalname}`;
      const fileId = await uploadToGridFS(file, filename, {
        studentId: studentId.toString(),
        quizId: quizId.toString(),
        submissionType: 'quiz_submission'
      });

      // Check if submission already exists
      let submission = await QuizSubmission.findOne({
        quiz: quizId,
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
        submission = await QuizSubmission.create({
          quiz: quizId,
          student: studentId,
          submittedDocument: fileId.toString(),
          submittedDocumentName: file.originalname,
          submittedDocumentType: file.mimetype,
          isSubmitted: true,
          submittedAt: new Date()
        });
      }

      const populatedSubmission = await QuizSubmission.findById(submission._id)
        .populate('quiz', 'title description')
        .populate('student', 'firstName lastName email username');

      return populatedSubmission;
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to submit quiz'
      };
    }
  }

  static async unsubmitQuiz(quizId, studentId) {
    try {
      const submission = await QuizSubmission.findOne({
        quiz: quizId,
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
          message: 'Quiz is not submitted'
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
        message: dbError.message || 'Failed to unsubmit quiz'
      };
    }
  }

  static async replaceSubmission(quizId, studentId, file) {
    try {
      // Verify quiz exists
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        throw {
          status: 404,
          message: 'Quiz not found'
        };
      }

      const submission = await QuizSubmission.findOne({
        quiz: quizId,
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
          message: 'Quiz is not submitted. Use submit endpoint instead.'
        };
      }

      if (!file) {
        throw {
          status: 400,
          message: 'File is required'
        };
      }

      // Verify file is an image
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedImageTypes.includes(file.mimetype)) {
        throw {
          status: 400,
          message: 'Only image files (JPEG, PNG, GIF, WEBP) are allowed'
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
      const filename = `quiz-submission-${Date.now()}-${file.originalname}`;
      const fileId = await uploadToGridFS(file, filename, {
        studentId: studentId.toString(),
        quizId: quizId.toString(),
        submissionType: 'quiz_submission'
      });

      // Update submission with new file
      submission.submittedDocument = fileId.toString();
      submission.submittedDocumentName = file.originalname;
      submission.submittedDocumentType = file.mimetype;
      submission.submittedAt = new Date();
      await submission.save();

      const populatedSubmission = await QuizSubmission.findById(submission._id)
        .populate('quiz', 'title description')
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

  static async getSubmission(quizId, studentId) {
    try {
      const submission = await QuizSubmission.findOne({
        quiz: quizId,
        student: studentId
      })
        .populate('quiz', 'title description assignedBy')
        .populate('student', 'firstName lastName email username')
        .populate('quiz.assignedBy', 'firstName lastName');

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

  static async getSubmissionsByQuiz(quizId, teacherId, page = 1, limit = 10) {
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

      // Verify quiz exists and belongs to teacher
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        throw {
          status: 404,
          message: 'Quiz not found'
        };
      }

      if (quiz.assignedBy.toString() !== teacherId.toString()) {
        throw {
          status: 403,
          message: 'Access denied. You can only view submissions for your own quizzes.'
        };
      }

      const skip = (pageNum - 1) * limitNum;

      const [submissions, total] = await Promise.all([
        QuizSubmission.find({ quiz: quizId })
          .populate('student', 'firstName lastName email username')
          .sort({ submittedAt: -1 })
          .skip(skip)
          .limit(limitNum),
        QuizSubmission.countDocuments({ quiz: quizId })
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

      const submission = await QuizSubmission.findById(submissionId)
        .populate('quiz');

      if (!submission) {
        throw {
          status: 404,
          message: 'Submission not found'
        };
      }

      // Verify teacher owns this quiz
      if (submission.quiz.assignedBy.toString() !== teacherId.toString()) {
        throw {
          status: 403,
          message: 'Access denied. You can only grade submissions for your own quizzes.'
        };
      }

      // Verify submission is submitted
      if (!submission.isSubmitted) {
        throw {
          status: 400,
          message: 'Cannot grade submission. Quiz has not been submitted yet.'
        };
      }

      submission.grade = grade;
      submission.feedback = feedback || null;
      submission.gradedAt = new Date();
      await submission.save();

      const populatedSubmission = await QuizSubmission.findById(submissionId)
        .populate('quiz', 'title description')
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
        QuizSubmission.find({ isSubmitted: true })
          .populate('quiz', 'title description assignedBy')
          .populate('student', 'firstName lastName email username')
          .populate('quiz.assignedBy', 'firstName lastName email username')
          .sort({ submittedAt: -1 })
          .skip(skip)
          .limit(limitNum),
        QuizSubmission.countDocuments({ isSubmitted: true })
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

module.exports = QuizSubmissionService;

