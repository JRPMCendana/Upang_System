const Exam = require('../models/Exam.model');
const ExamSubmission = require('../models/ExamSubmission.model');
const User = require('../models/User.model');
const { uploadToGridFS, deleteFileFromGridFS } = require('../middleware/upload.middleware');
const DbUtils = require('../utils/db.utils');

class ExamService {
  static async createExam(teacherId, data) {
    try {
      const exam = await Exam.create({
        title: data.title,
        description: data.description,
        dueDate: data.dueDate || null,
        totalPoints: data.totalPoints || 100,
        assignedBy: teacherId,
        assignedTo: data.studentIds || [],
        document: data.document || null,
        documentName: data.documentName || null,
        documentType: data.documentType || null,
      });

      // Pre-create submission shells for each assigned student
      if (data.studentIds && data.studentIds.length > 0) {
        const submissions = data.studentIds.map((studentId) => ({
          exam: exam._id,
          student: studentId,
          isSubmitted: false,
          status: 'pending',
        }));
        await ExamSubmission.insertMany(submissions);
      }

      return exam;
    } catch (error) {
      const dbError = DbUtils.handleError(error);
      throw { status: dbError.status, message: dbError.message || 'Failed to create exam' };
    }
  }

  static async updateExam(teacherId, examId, data) {
    try {
      const exam = await Exam.findById(examId);
      if (!exam) throw { status: 404, message: 'Exam not found' };
      if (exam.assignedBy.toString() !== teacherId.toString()) {
        throw { status: 403, message: 'Access denied' };
      }

      if (data.title) exam.title = data.title;
      if (data.description) exam.description = data.description;
      if (typeof data.totalPoints !== 'undefined' && data.totalPoints !== null && data.totalPoints !== '') {
        const parsed = typeof data.totalPoints === 'string' ? parseInt(data.totalPoints, 10) : data.totalPoints;
        exam.totalPoints = parsed;
      }
      if (typeof data.dueDate !== 'undefined') {
        exam.dueDate = data.dueDate ? new Date(data.dueDate) : null;
      }

      // Replace document if new file provided through controller
      if (data.document && data.document.buffer) {
        const filename = `${Date.now()}-${data.document.originalname}`;
        const fileId = await uploadToGridFS(data.document, filename, {
          examId: examId.toString(),
          type: 'exam_document'
        });
        // delete old if exists
        if (exam.document) {
          try { await deleteFileFromGridFS(exam.document); } catch {}
        }
        exam.document = fileId.toString();
        exam.documentName = data.document.originalname;
        exam.documentType = data.document.mimetype;
      }

      await exam.save();
      return exam;
    } catch (error) {
      const dbError = DbUtils.handleError(error);
      throw { status: dbError.status, message: dbError.message || 'Failed to update exam' };
    }
  }

  static async deleteExam(teacherId, examId) {
    try {
      const exam = await Exam.findById(examId);
      if (!exam) throw { status: 404, message: 'Exam not found' };
      if (exam.assignedBy.toString() !== teacherId.toString()) {
        throw { status: 403, message: 'Access denied' };
      }

      // Delete related submission files
      const submissions = await ExamSubmission.find({ exam: examId });
      for (const sub of submissions) {
        if (sub.submittedDocument) {
          try { await deleteFileFromGridFS(sub.submittedDocument); } catch {}
        }
      }
      await ExamSubmission.deleteMany({ exam: examId });

      // Delete exam document file
      if (exam.document) {
        try { await deleteFileFromGridFS(exam.document); } catch {}
      }

      // Finally delete the exam document itself (guard with teacher ownership)
      await Exam.findOneAndDelete({ _id: examId, assignedBy: teacherId });
      return true;
    } catch (error) {
      const dbError = DbUtils.handleError(error);
      throw { status: dbError.status, message: dbError.message || 'Failed to delete exam' };
    }
  }

  static async getExamsByTeacher(teacherId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const [exams, total] = await Promise.all([
        Exam.find({ assignedBy: teacherId })
          .populate('assignedBy', 'firstName lastName email username')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Exam.countDocuments({ assignedBy: teacherId }),
      ]);

      return {
        exams,
        pagination: {
          currentPage: page,
          limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      const dbError = DbUtils.handleError(error);
      throw { status: dbError.status, message: dbError.message || 'Failed to get exams' };
    }
  }

  static async getExamsByStudent(studentId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const [exams, total] = await Promise.all([
        Exam.find({ assignedTo: studentId })
          .populate('assignedBy', 'firstName lastName email username')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Exam.countDocuments({ assignedTo: studentId }),
      ]);

      return {
        exams,
        pagination: {
          currentPage: page,
          limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      const dbError = DbUtils.handleError(error);
      throw { status: dbError.status, message: dbError.message || 'Failed to get exams' };
    }
  }
}

module.exports = ExamService;


