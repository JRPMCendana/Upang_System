const QuizSubmissionService = require('../services/quiz-submission.service');

class QuizSubmissionController {
  static async submitQuiz(req, res, next) {
    try {
      const { quizId } = req.params;
      const studentId = req.user.id;

      if (!quizId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Quiz ID is required'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Screenshot/image file is required for submission'
        });
      }

      const result = await QuizSubmissionService.submitQuiz(quizId, studentId, req.file);

      res.status(200).json({
        success: true,
        message: 'Quiz submitted successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async unsubmitQuiz(req, res, next) {
    try {
      const { quizId } = req.params;
      const studentId = req.user.id;

      if (!quizId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Quiz ID is required'
        });
      }

      const result = await QuizSubmissionService.unsubmitQuiz(quizId, studentId);

      res.status(200).json({
        success: true,
        message: 'Quiz unsubmitted successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async replaceSubmission(req, res, next) {
    try {
      const { quizId } = req.params;
      const studentId = req.user.id;

      if (!quizId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Quiz ID is required'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'File is required to replace submission'
        });
      }

      const result = await QuizSubmissionService.replaceSubmission(quizId, studentId, req.file);

      res.status(200).json({
        success: true,
        message: 'Submission replaced successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSubmission(req, res, next) {
    try {
      const { quizId } = req.params;
      const studentId = req.user.id;

      if (!quizId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Quiz ID is required'
        });
      }

      const result = await QuizSubmissionService.getSubmission(quizId, studentId);

      if (!result) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Submission not found'
        });
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSubmissionsByQuiz(req, res, next) {
    try {
      const { quizId } = req.params;
      const teacherId = req.user.id;
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;

      const result = await QuizSubmissionService.getSubmissionsByQuiz(quizId, teacherId, page, limit);

      res.status(200).json({
        success: true,
        data: result.submissions,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async gradeSubmission(req, res, next) {
    try {
      const { submissionId } = req.params;
      const teacherId = req.user.id;
      const { grade, feedback } = req.body;

      if (!submissionId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Submission ID is required'
        });
      }

      const result = await QuizSubmissionService.gradeSubmission(submissionId, teacherId, grade, feedback);

      res.status(200).json({
        success: true,
        message: 'Submission graded successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = QuizSubmissionController;

