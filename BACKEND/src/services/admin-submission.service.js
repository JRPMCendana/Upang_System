const AssignmentSubmission = require('../models/AssignmentSubmission.model');
const QuizSubmission = require('../models/QuizSubmission.model');
const ExamSubmission = require('../models/ExamSubmission.model');
const Assignment = require('../models/Assignment.model');
const Quiz = require('../models/Quiz.model');
const Exam = require('../models/Exam.model');
const DbUtils = require('../utils/db.utils');

class AdminSubmissionService {
  /**
   * Get all submissions (assignments, quizzes, and exams) with filtering and pagination
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {string} type - Filter by type: 'assignment', 'quiz', 'exam', or 'all'
   * @param {string} status - Filter by status: 'graded', 'pending', or 'all'
   * @param {string} search - Search query for student name or activity title
   * @returns {Object} Combined submissions with pagination
   */
  static async getAllSubmissions(page = 1, limit = 10, type = 'all', status = 'all', search = '') {
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

      // Build status filter
      let statusFilter = { isSubmitted: true };
      if (status === 'graded') {
        statusFilter.grade = { $ne: null };
      } else if (status === 'pending') {
        statusFilter.grade = null;
      }

      let assignmentSubmissions = [];
      let quizSubmissions = [];
      let examSubmissions = [];
      let totalAssignments = 0;
      let totalQuizzes = 0;
      let totalExams = 0;

      // Fetch assignment submissions
      if (type === 'all' || type === 'assignment') {
        const assignmentQuery = AssignmentSubmission.find(statusFilter)
          .populate({
            path: 'assignment',
            select: 'title description dueDate maxGrade assignedBy',
            populate: {
              path: 'assignedBy',
              select: 'firstName lastName email username'
            }
          })
          .populate('student', 'firstName lastName email username')
          .sort({ submittedAt: -1 })
          .lean();

        const [assignments, countAssignments] = await Promise.all([
          assignmentQuery,
          AssignmentSubmission.countDocuments(statusFilter)
        ]);

        assignmentSubmissions = assignments.map(sub => ({
          _id: sub._id,
          type: 'assignment',
          activity: sub.assignment?.title || 'Unknown Assignment',
          activityId: sub.assignment?._id,
          description: sub.assignment?.description,
          student: sub.student ? `${sub.student.firstName} ${sub.student.lastName}` : 'Unknown Student',
          studentId: sub.student?._id,
          studentEmail: sub.student?.email,
          studentUsername: sub.student?.username,
          submittedAt: sub.submittedAt,
          grade: sub.grade,
          maxGrade: sub.assignment?.maxGrade || 100,
          feedback: sub.feedback,
          gradedAt: sub.gradedAt,
          status: sub.status || (sub.grade !== null ? 'graded' : 'pending'),
          dueDate: sub.assignment?.dueDate,
          submittedDocument: sub.submittedDocument,
          submittedDocumentName: sub.submittedDocumentName,
          assignedBy: sub.assignment?.assignedBy
        }));

        totalAssignments = countAssignments;
      }

      // Fetch quiz submissions
      if (type === 'all' || type === 'quiz') {
        const quizQuery = QuizSubmission.find(statusFilter)
          .populate({
            path: 'quiz',
            select: 'title description totalPoints assignedBy',
            populate: {
              path: 'assignedBy',
              select: 'firstName lastName email username'
            }
          })
          .populate('student', 'firstName lastName email username')
          .sort({ submittedAt: -1 })
          .lean();

        const [quizzes, countQuizzes] = await Promise.all([
          quizQuery,
          QuizSubmission.countDocuments(statusFilter)
        ]);

        quizSubmissions = quizzes.map(sub => ({
          _id: sub._id,
          type: 'quiz',
          activity: sub.quiz?.title || 'Unknown Quiz',
          activityId: sub.quiz?._id,
          description: sub.quiz?.description,
          student: sub.student ? `${sub.student.firstName} ${sub.student.lastName}` : 'Unknown Student',
          studentId: sub.student?._id,
          studentEmail: sub.student?.email,
          studentUsername: sub.student?.username,
          submittedAt: sub.submittedAt,
          grade: sub.grade,
          maxGrade: sub.quiz?.totalPoints || 100,
          feedback: sub.feedback,
          gradedAt: sub.gradedAt,
          status: sub.status || (sub.grade !== null ? 'graded' : 'pending'),
          submittedDocument: sub.submittedDocument,
          submittedDocumentName: sub.submittedDocumentName,
          assignedBy: sub.quiz?.assignedBy
        }));

        totalQuizzes = countQuizzes;
      }

      // Fetch exam submissions
      if (type === 'all' || type === 'exam') {
        const examQuery = ExamSubmission.find(statusFilter)
          .populate({
            path: 'exam',
            select: 'title description dueDate totalPoints assignedBy',
            populate: {
              path: 'assignedBy',
              select: 'firstName lastName email username'
            }
          })
          .populate('student', 'firstName lastName email username')
          .sort({ submittedAt: -1 })
          .lean();

        const [exams, countExams] = await Promise.all([
          examQuery,
          ExamSubmission.countDocuments(statusFilter)
        ]);

        examSubmissions = exams.map(sub => ({
          _id: sub._id,
          type: 'exam',
          activity: sub.exam?.title || 'Unknown Exam',
          activityId: sub.exam?._id,
          description: sub.exam?.description,
          student: sub.student ? `${sub.student.firstName} ${sub.student.lastName}` : 'Unknown Student',
          studentId: sub.student?._id,
          studentEmail: sub.student?.email,
          studentUsername: sub.student?.username,
          submittedAt: sub.submittedAt,
          grade: sub.grade,
          maxGrade: sub.exam?.totalPoints || 100,
          feedback: sub.feedback,
          gradedAt: sub.gradedAt,
          status: sub.status || (sub.grade !== null ? 'graded' : 'pending'),
          dueDate: sub.exam?.dueDate,
          submittedDocument: sub.submittedDocument,
          submittedDocumentName: sub.submittedDocumentName,
          assignedBy: sub.exam?.assignedBy
        }));

        totalExams = countExams;
      }

      // Combine and sort by submission date
      let allSubmissions = [...assignmentSubmissions, ...quizSubmissions, ...examSubmissions].sort(
        (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
      );

      // Apply search filter
      if (search && search.trim() !== '') {
        const searchLower = search.toLowerCase();
        allSubmissions = allSubmissions.filter(sub => 
          sub.student.toLowerCase().includes(searchLower) ||
          sub.activity.toLowerCase().includes(searchLower) ||
          sub.studentEmail?.toLowerCase().includes(searchLower) ||
          sub.studentUsername?.toLowerCase().includes(searchLower)
        );
      }

      const total = allSubmissions.length;
      const paginatedSubmissions = allSubmissions.slice(skip, skip + limitNum);
      const totalPages = Math.ceil(total / limitNum);

      return {
        submissions: paginatedSubmissions,
        pagination: {
          currentPage: pageNum,
          limit: limitNum,
          totalItems: total,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        },
        breakdown: {
          totalAssignments,
          totalQuizzes,
          totalExams,
          total: totalAssignments + totalQuizzes + totalExams
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

  /**
   * Get submission details by ID and type
   * @param {string} submissionId - Submission ID
   * @param {string} type - Type: 'assignment', 'quiz', or 'exam'
   * @returns {Object} Submission details
   */
  static async getSubmissionById(submissionId, type) {
    try {
      let submission;

      if (type === 'assignment') {
        submission = await AssignmentSubmission.findById(submissionId)
          .populate({
            path: 'assignment',
            select: 'title description dueDate maxGrade assignedBy',
            populate: {
              path: 'assignedBy',
              select: 'firstName lastName email username'
            }
          })
          .populate('student', 'firstName lastName email username')
          .lean();

        if (!submission) {
          throw {
            status: 404,
            message: 'Assignment submission not found'
          };
        }

        return {
          ...submission,
          type: 'assignment',
          maxGrade: submission.assignment?.maxGrade || 100
        };
      } else if (type === 'quiz') {
        submission = await QuizSubmission.findById(submissionId)
          .populate({
            path: 'quiz',
            select: 'title description totalPoints assignedBy',
            populate: {
              path: 'assignedBy',
              select: 'firstName lastName email username'
            }
          })
          .populate('student', 'firstName lastName email username')
          .lean();

        if (!submission) {
          throw {
            status: 404,
            message: 'Quiz submission not found'
          };
        }

        return {
          ...submission,
          type: 'quiz',
          maxGrade: submission.quiz?.totalPoints || 100
        };
      } else if (type === 'exam') {
        submission = await ExamSubmission.findById(submissionId)
          .populate({
            path: 'exam',
            select: 'title description dueDate totalPoints assignedBy',
            populate: {
              path: 'assignedBy',
              select: 'firstName lastName email username'
            }
          })
          .populate('student', 'firstName lastName email username')
          .lean();

        if (!submission) {
          throw {
            status: 404,
            message: 'Exam submission not found'
          };
        }

        return {
          ...submission,
          type: 'exam',
          maxGrade: submission.exam?.totalPoints || 100
        };
      } else {
        throw {
          status: 400,
          message: 'Invalid type. Must be "assignment", "quiz", or "exam"'
        };
      }
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
}

module.exports = AdminSubmissionService;
