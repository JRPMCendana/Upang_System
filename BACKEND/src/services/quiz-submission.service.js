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
        submission.status = 'submitted';
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
          submittedAt: new Date(),
          status: 'submitted'
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
    console.log('=== UNSUBMIT QUIZ START ===');
    console.log('Quiz ID:', quizId);
    console.log('Student ID:', studentId);
    
    try {
      console.log('Step 1: Finding submission...');
      const submission = await QuizSubmission.findOne({
        quiz: quizId,
        student: studentId
      });

      if (!submission) {
        console.error('Step 1 FAILED: Submission not found');
        throw {
          status: 404,
          message: 'Submission not found'
        };
      }
      console.log('Step 1 SUCCESS: Submission found:', submission._id);

      if (!submission.isSubmitted) {
        console.error('Step 1 FAILED: Quiz is not submitted');
        throw {
          status: 400,
          message: 'Quiz is not submitted'
        };
      }

      // Store the submission ID before any operations
      const submissionId = submission._id;
      const fileId = submission.submittedDocument;
      console.log('Submission ID:', submissionId);
      console.log('File ID:', fileId);

      // Delete file from GridFS (non-blocking)
      if (fileId) {
        console.log('Step 2: Starting file deletion (non-blocking)...');
        console.log(`Attempting to delete file: ${fileId}`);
        deleteFileFromGridFS(fileId)
          .then(() => {
            console.log('File deleted successfully (or already deleted)');
          })
          .catch((error) => {
            console.error('Error deleting submission file (non-critical):', error.message);
          });
        console.log('Step 2: File deletion initiated');
      } else {
        console.log('Step 2: No file to delete');
      }

      // Delete the entire submission document immediately (don't wait for file deletion)
      console.log('Step 3: Deleting submission document from database...');
      console.log(`Deleting submission document ${submissionId} for quiz ${quizId}, student ${studentId}`);
      
      const deleteResult = await QuizSubmission.findByIdAndDelete(submissionId);
      
      if (!deleteResult) {
        console.error('Step 3 FAILED: Submission document was not found when attempting to delete');
        throw {
          status: 404,
          message: 'Submission not found or already deleted'
        };
      }
      
      console.log('Step 3 SUCCESS: Submission document deleted successfully:', submissionId);
      console.log('Deleted document:', deleteResult);
      console.log('=== UNSUBMIT QUIZ COMPLETE ===');

      return {
        _id: submissionId,
        message: 'Quiz unsubmitted successfully'
      };
    } catch (error) {
      console.error('=== UNSUBMIT QUIZ ERROR ===');
      console.error('Error details:', error);
      
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
      const submission = await QuizSubmission.findById(submissionId)
        .populate('quiz');

      if (!submission) {
        throw {
          status: 404,
          message: 'Submission not found'
        };
      }

      // Get totalPoints from quiz
      const totalPoints = submission.quiz.totalPoints || 100;

      // Validate grade against quiz's totalPoints
      if (grade !== null && (grade < 0 || grade > totalPoints)) {
        throw {
          status: 400,
          message: `Grade must be between 0 and ${totalPoints}`
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
      submission.status = 'graded';
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

