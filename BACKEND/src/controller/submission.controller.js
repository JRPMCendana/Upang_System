const SubmissionService = require('../services/submission.service');

class SubmissionController {
  static async submitAssignment(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const studentId = req.user.id;

      if (!assignmentId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Assignment ID is required'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'File is required for submission'
        });
      }

      const result = await SubmissionService.submitAssignment(assignmentId, studentId, req.file);

      res.status(200).json({
        success: true,
        message: 'Assignment submitted successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async unsubmitAssignment(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const studentId = req.user.id;

      if (!assignmentId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Assignment ID is required'
        });
      }

      const result = await SubmissionService.unsubmitAssignment(assignmentId, studentId);

      res.status(200).json({
        success: true,
        message: 'Assignment unsubmitted successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async replaceSubmission(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const studentId = req.user.id;

      if (!assignmentId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Assignment ID is required'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'File is required to replace submission'
        });
      }

      const result = await SubmissionService.replaceSubmission(assignmentId, studentId, req.file);

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
      const { assignmentId } = req.params;
      const studentId = req.user.id;

      if (!assignmentId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Assignment ID is required'
        });
      }

      const result = await SubmissionService.getSubmission(assignmentId, studentId);

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

  static async getSubmissionsByAssignment(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const teacherId = req.user.id;
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;

      const result = await SubmissionService.getSubmissionsByAssignment(assignmentId, teacherId, page, limit);

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

      const result = await SubmissionService.gradeSubmission(submissionId, teacherId, grade, feedback);

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

module.exports = SubmissionController;

