const AssignmentSubmission = require('../models/AssignmentSubmission.model');
const QuizSubmission = require('../models/QuizSubmission.model');
const Assignment = require('../models/Assignment.model');
const Quiz = require('../models/Quiz.model');
const DbUtils = require('../utils/db.utils');

class AdminSubmissionService {
  /**
   * Get all submissions (both assignments and quizzes) with filtering and pagination
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {string} type - Filter by type: 'assignment', 'quiz', or 'all'
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
      let totalAssignments = 0;
      let totalQuizzes = 0;

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
          status: sub.grade !== null ? 'graded' : 'pending',
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
          status: sub.grade !== null ? 'graded' : 'pending',
          submittedDocument: sub.submittedDocument,
          submittedDocumentName: sub.submittedDocumentName,
          assignedBy: sub.quiz?.assignedBy
        }));

        totalQuizzes = countQuizzes;
      }

      // Combine and sort by submission date
      let allSubmissions = [...assignmentSubmissions, ...quizSubmissions].sort(
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
          total: totalAssignments + totalQuizzes
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
   * @param {string} type - Type: 'assignment' or 'quiz'
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
      } else {
        throw {
          status: 400,
          message: 'Invalid type. Must be "assignment" or "quiz"'
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
