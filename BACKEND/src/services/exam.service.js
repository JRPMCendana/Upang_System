const Exam = require('../models/Exam.model');
const ExamSubmission = require('../models/ExamSubmission.model');
const User = require('../models/User.model');
const { uploadToGridFS } = require('../middleware/upload.middleware');
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
        }));
        await ExamSubmission.insertMany(submissions);
      }

      return exam;
    } catch (error) {
      const dbError = DbUtils.handleError(error);
      throw { status: dbError.status, message: dbError.message || 'Failed to create exam' };
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
          .limit(limit),
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
          .limit(limit),
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


