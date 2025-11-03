const ExamSubmissionService = require('../services/exam-submission.service');

class ExamSubmissionController {
  static async submitExam(req, res, next) {
    try {
      const { examId } = req.params;
      const studentId = req.user.id;
      if (!req.file) {
        return res.status(400).json({ error: 'Validation Error', message: 'Screenshot/image file is required for submission' });
      }
      const result = await ExamSubmissionService.submitExam(examId, studentId, req.file);
      res.status(200).json({ success: true, message: 'Exam submitted successfully', data: result });
    } catch (error) { next(error); }
  }

  static async getSubmissionsByExam(req, res, next) {
    try {
      const { examId } = req.params;
      const teacherId = req.user.id;
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const result = await ExamSubmissionService.getSubmissionsByExam(examId, teacherId, page, limit);
      res.status(200).json({ success: true, data: result.submissions, pagination: result.pagination });
    } catch (error) { next(error); }
  }

  static async gradeSubmission(req, res, next) {
    try {
      const { submissionId } = req.params;
      const teacherId = req.user.id;
      const { grade, feedback } = req.body;
      const result = await ExamSubmissionService.gradeSubmission(submissionId, teacherId, grade, feedback);
      res.status(200).json({ success: true, message: 'Submission graded successfully', data: result });
    } catch (error) { next(error); }
  }

  static async getMySubmission(req, res, next) {
    try {
      const { examId } = req.params;
      const studentId = req.user.id;
      const result = await ExamSubmissionService.getMySubmission(examId, studentId);
      if (!result) {
        return res.status(200).json({ success: true, data: null });
      }
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  static async unsubmitExam(req, res, next) {
    try {
      const { examId } = req.params;
      const studentId = req.user.id;
      const result = await ExamSubmissionService.unsubmitExam(examId, studentId);
      res.status(200).json({ success: true, message: 'Exam unsubmitted successfully', data: result });
    } catch (error) { next(error); }
  }
}

module.exports = ExamSubmissionController;


