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
          .populate('assignedTo', 'firstName lastName email username')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Exam.countDocuments({ assignedBy: teacherId }),
      ]);

      // Add submission statistics for each exam
      const ExamSubmission = require('../models/ExamSubmission.model');
      const examsWithStats = await Promise.all(
        exams.map(async (exam) => {
          const totalStudents = exam.assignedTo.length;
          
          // Get submission counts
          const [submittedCount, gradedCount] = await Promise.all([
            ExamSubmission.countDocuments({
              exam: exam._id,
              isSubmitted: true
            }),
            ExamSubmission.countDocuments({
              exam: exam._id,
              grade: { $ne: null }
            })
          ]);

          return {
            ...exam,
            submissionStats: {
              total: totalStudents,
              submitted: submittedCount,
              graded: gradedCount,
              pending: totalStudents - submittedCount
            }
          };
        })
      );

      return {
        exams: examsWithStats,
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
      const ExamSubmission = require('../models/ExamSubmission.model');
      const ObjectId = require('mongoose').Types.ObjectId;

      const [exams, total] = await Promise.all([
        Exam.aggregate([
          { $match: { assignedTo: new ObjectId(studentId) } },
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: 'users',
              localField: 'assignedBy',
              foreignField: '_id',
              as: 'assignedBy'
            }
          },
          { $unwind: '$assignedBy' },
          {
            $lookup: {
              from: 'exam_submissions',
              let: { examId: '$_id', studentId: new ObjectId(studentId) },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$exam', '$$examId'] },
                        { $eq: ['$student', '$$studentId'] }
                      ]
                    }
                  }
                }
              ],
              as: 'submissions'
            }
          },
          {
            $addFields: {
              submission: {
                $cond: {
                  if: { $gt: [{ $size: '$submissions' }, 0] },
                  then: {
                    _id: { $arrayElemAt: ['$submissions._id', 0] },
                    isSubmitted: { $arrayElemAt: ['$submissions.isSubmitted', 0] },
                    submittedAt: { $arrayElemAt: ['$submissions.submittedAt', 0] },
                    grade: { $arrayElemAt: ['$submissions.grade', 0] },
                    feedback: { $arrayElemAt: ['$submissions.feedback', 0] },
                    gradedAt: { $arrayElemAt: ['$submissions.gradedAt', 0] },
                    submittedDocument: { $arrayElemAt: ['$submissions.submittedDocument', 0] },
                    submittedDocumentName: { $arrayElemAt: ['$submissions.submittedDocumentName', 0] },
                    status: { $arrayElemAt: ['$submissions.status', 0] }
                  },
                  else: null
                }
              },
              // Calculate status based on submission
              submissionStatus: {
                $cond: {
                  if: { $gt: [{ $size: '$submissions' }, 0] },
                  then: {
                    $ifNull: [
                      { $arrayElemAt: ['$submissions.status', 0] },
                      'pending'
                    ]
                  },
                  else: {
                    $cond: {
                      if: { $and: ['$dueDate', { $lt: ['$dueDate', new Date()] }] },
                      then: 'due',
                      else: 'pending'
                    }
                  }
                }
              }
            }
          },
          {
            $project: {
              submissions: 0,
              'assignedBy.password': 0,
              'assignedBy.tokens': 0
            }
          }
        ]),
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

  static async getAllExams(page = 1, limit = 10, teacherId = null) {
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

      // Build query filter
      const filter = {};
      if (teacherId) {
        filter.assignedBy = teacherId;
      }

      const [exams, total] = await Promise.all([
        Exam.find(filter)
          .populate('assignedBy', 'firstName lastName email username')
          .populate('assignedTo', 'firstName lastName email username')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        Exam.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / limitNum);

      return {
        exams,
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
        message: dbError.message || 'Failed to get exams'
      };
    }
  }
}

module.exports = ExamService;


