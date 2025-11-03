const Exam = require('../models/Exam.model');
const ExamSubmission = require('../models/ExamSubmission.model');
const { uploadToGridFS } = require('../middleware/upload.middleware');
const DbUtils = require('../utils/db.utils');

class ExamSubmissionService {
  static async submitExam(examId, studentId, file) {
    try {
      const exam = await Exam.findById(examId);
      if (!exam) {
        throw { status: 404, message: 'Exam not found' };
      }

      if (!exam.assignedTo.map((id) => id.toString()).includes(studentId.toString())) {
        throw { status: 403, message: 'You are not assigned to this exam' };
      }

      const filename = `${Date.now()}-${file.originalname}`;
      const fileId = await uploadToGridFS(file, filename, {
        examId: examId.toString(),
        type: 'exam_submission'
      });

      const submission = await ExamSubmission.findOneAndUpdate(
        { exam: examId, student: studentId },
        {
          isSubmitted: true,
          submittedAt: new Date(),
          submittedDocument: fileId.toString(),
          submittedDocumentName: file.originalname,
          submittedDocumentType: file.mimetype,
        },
        { new: true, upsert: true }
      );

      return submission;
    } catch (error) {
      const dbError = DbUtils.handleError(error);
      throw { status: dbError.status, message: dbError.message || 'Failed to submit exam' };
    }
  }

  static async getSubmissionsByExam(examId, teacherId, page = 1, limit = 10) {
    try {
      const exam = await Exam.findById(examId);
      if (!exam) {
        throw { status: 404, message: 'Exam not found' };
      }
      if (exam.assignedBy.toString() !== teacherId.toString()) {
        throw { status: 403, message: 'Access denied' };
      }

      const skip = (page - 1) * limit;
      const [subs, total] = await Promise.all([
        ExamSubmission.find({ exam: examId })
          .populate('student', 'firstName lastName email username')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        ExamSubmission.countDocuments({ exam: examId })
      ]);

      return {
        submissions: subs,
        pagination: {
          currentPage: page,
          limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      const dbError = DbUtils.handleError(error);
      throw { status: dbError.status, message: dbError.message || 'Failed to get exam submissions' };
    }
  }

  static async gradeSubmission(submissionId, teacherId, grade, feedback) {
    try {
      const submission = await ExamSubmission.findById(submissionId).populate('exam');
      if (!submission) {
        throw { status: 404, message: 'Submission not found' };
      }
      if (submission.exam.assignedBy.toString() !== teacherId.toString()) {
        throw { status: 403, message: 'Access denied' };
      }

      submission.grade = grade;
      submission.gradedAt = new Date();
      submission.feedback = feedback || null;
      await submission.save();
      return submission;
    } catch (error) {
      const dbError = DbUtils.handleError(error);
      throw { status: dbError.status, message: dbError.message || 'Failed to grade submission' };
    }
  }

  static async getMySubmission(examId, studentId) {
    try {
      const sub = await ExamSubmission.findOne({ exam: examId, student: studentId });
      return sub;
    } catch (error) {
      const dbError = DbUtils.handleError(error);
      throw { status: dbError.status, message: dbError.message || 'Failed to get submission' };
    }
  }

  static async unsubmitExam(examId, studentId) {
    try {
      const submission = await ExamSubmission.findOne({ exam: examId, student: studentId });
      if (!submission) {
        throw { status: 404, message: 'Submission not found' };
      }
      submission.isSubmitted = false;
      submission.submittedAt = null;
      submission.submittedDocument = null;
      submission.submittedDocumentName = null;
      submission.submittedDocumentType = null;
      submission.grade = null;
      submission.feedback = null;
      submission.gradedAt = null;
      await submission.save();
      return submission;
    } catch (error) {
      const dbError = DbUtils.handleError(error);
      throw { status: dbError.status, message: dbError.message || 'Failed to unsubmit exam' };
    }
  }
}

module.exports = ExamSubmissionService;


