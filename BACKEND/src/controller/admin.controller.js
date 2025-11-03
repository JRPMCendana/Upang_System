const AuthService = require('../services/auth.service');
const QuizService = require('../services/quiz.service');
const AssignmentTaskService = require('../services/assignment-task.service');
const SubmissionService = require('../services/submission.service');
const QuizSubmissionService = require('../services/quiz-submission.service');
const AdminStatsService = require('../services/admin-stats.service');
const AdminSubmissionService = require('../services/admin-submission.service');
const ExamService = require('../services/exam.service');
const AdminExportService = require('../services/admin-export.service');

class AdminController {
  static async createAccount(req, res, next) {
    try {
      const { email, password, username, role, firstName, lastName } = req.body;

      if (!email || !password || !username || !role) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Email, password, username, and role are required'
        });
      }

      const result = await AuthService.createAccount({
        email,
        password,
        username,
        role,
        firstName,
        lastName
      });

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req, res, next) {
    try {
      const { userId } = req.params;
      const { email, password, username, firstName, lastName, status } = req.body;

      if (!userId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'User ID is required'
        });
      }

      if (!email && !password && !username && firstName === undefined && lastName === undefined && status === undefined) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'At least one field (email, password, username, firstName, lastName, status) must be provided'
        });
      }

      const updateData = {};
      if (email !== undefined) updateData.email = email;
      if (password !== undefined) updateData.password = password;
      if (username !== undefined) updateData.username = username;
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (status !== undefined) updateData.status = status;

      const result = await AuthService.updateUser(userId, updateData);

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req, res, next) {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const role = req.query.role || null;
      const status = req.query.status || null;

      const result = await AuthService.getAllUsers(page, limit, role, status);

      res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async assignTeacher(req, res, next) {
    try {
      const { studentId } = req.params;
      const { teacherId } = req.body;

      if (!studentId || !teacherId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Student ID and Teacher ID are required'
        });
      }

      const AssignmentService = require('../services/assignment.service');
      const result = await AssignmentService.assignTeacher(studentId, teacherId);

      res.status(200).json({
        success: true,
        message: 'Teacher assigned successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async unassignTeacher(req, res, next) {
    try {
      const { studentId } = req.params;

      if (!studentId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Student ID is required'
        });
      }

      const AssignmentService = require('../services/assignment.service');
      const result = await AssignmentService.unassignTeacher(studentId);

      res.status(200).json({
        success: true,
        message: 'Teacher unassigned successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllQuizzes(req, res, next) {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const teacherId = req.query.teacherId || null;

      const result = await QuizService.getAllQuizzes(page, limit, teacherId);

      res.status(200).json({
        success: true,
        data: result.quizzes,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllAssignments(req, res, next) {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const teacherId = req.query.teacherId || null;

      const result = await AssignmentTaskService.getAllAssignments(page, limit, teacherId);

      res.status(200).json({
        success: true,
        data: result.assignments,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllAssignmentSubmissions(req, res, next) {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;

      const result = await SubmissionService.getAllSubmissions(page, limit);

      res.status(200).json({
        success: true,
        data: result.submissions,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllQuizSubmissions(req, res, next) {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;

      const result = await QuizSubmissionService.getAllSubmissions(page, limit);

      res.status(200).json({
        success: true,
        data: result.submissions,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSystemStatistics(req, res, next) {
    try {
      const stats = await AdminStatsService.getSystemStatistics();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error in getSystemStatistics:', error);
      next(error);
    }
  }

  static async getAllSubmissionsUnified(req, res, next) {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const type = req.query.type || 'all'; // 'assignment', 'quiz', or 'all'
      const status = req.query.status || 'all'; // 'graded', 'pending', or 'all'
      const search = req.query.search || '';

      const result = await AdminSubmissionService.getAllSubmissions(
        page,
        limit,
        type,
        status,
        search
      );

      res.status(200).json({
        success: true,
        data: result.submissions,
        pagination: result.pagination,
        breakdown: result.breakdown
      });
    } catch (error) {
      console.error('Error in getAllSubmissionsUnified:', error);
      next(error);
    }
  }

  static async getSubmissionDetail(req, res, next) {
    try {
      const { submissionId } = req.params;
      const { type } = req.query; // 'assignment', 'quiz', or 'exam'

      if (!type || (type !== 'assignment' && type !== 'quiz' && type !== 'exam')) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Type query parameter is required and must be "assignment", "quiz", or "exam"'
        });
      }

      const submission = await AdminSubmissionService.getSubmissionById(submissionId, type);

      res.status(200).json({
        success: true,
        data: submission
      });
    } catch (error) {
      console.error('Error in getSubmissionDetail:', error);
      next(error);
    }
  }

  static async getAllExams(req, res, next) {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const teacherId = req.query.teacherId || null;

      const result = await ExamService.getAllExams(page, limit, teacherId);

      res.status(200).json({
        success: true,
        data: result.exams,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // DATA EXPORT ENDPOINTS FOR ADMIN
  // ============================================

  /**
   * Export all users to CSV
   */
  static async exportUsers(req, res, next) {
    try {
      const csv = await AdminExportService.exportUsersCSV();

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="users-${new Date().toISOString().split('T')[0]}.csv"`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export all assignments to CSV
   */
  static async exportAssignments(req, res, next) {
    try {
      const csv = await AdminExportService.exportAssignmentsCSV();

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="assignments-${new Date().toISOString().split('T')[0]}.csv"`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export all quizzes to CSV
   */
  static async exportQuizzes(req, res, next) {
    try {
      const csv = await AdminExportService.exportQuizzesCSV();

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="quizzes-${new Date().toISOString().split('T')[0]}.csv"`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export all exams to CSV
   */
  static async exportExams(req, res, next) {
    try {
      const csv = await AdminExportService.exportExamsCSV();

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="exams-${new Date().toISOString().split('T')[0]}.csv"`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export all assignment submissions to CSV
   */
  static async exportAssignmentSubmissions(req, res, next) {
    try {
      const csv = await AdminExportService.exportAssignmentSubmissionsCSV();

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="assignment-submissions-${new Date().toISOString().split('T')[0]}.csv"`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export all quiz submissions to CSV
   */
  static async exportQuizSubmissions(req, res, next) {
    try {
      const csv = await AdminExportService.exportQuizSubmissionsCSV();

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="quiz-submissions-${new Date().toISOString().split('T')[0]}.csv"`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export all exam submissions to CSV
   */
  static async exportExamSubmissions(req, res, next) {
    try {
      const csv = await AdminExportService.exportExamSubmissionsCSV();

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="exam-submissions-${new Date().toISOString().split('T')[0]}.csv"`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export comprehensive student grades report to CSV
   */
  static async exportStudentGrades(req, res, next) {
    try {
      const csv = await AdminExportService.exportStudentGradesCSV();

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="student-grades-${new Date().toISOString().split('T')[0]}.csv"`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export system statistics summary to CSV
   */
  static async exportSystemStatistics(req, res, next) {
    try {
      const csv = await AdminExportService.exportSystemStatisticsCSV();

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="system-statistics-${new Date().toISOString().split('T')[0]}.csv"`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export teacher activity summary to CSV
   */
  static async exportTeacherActivity(req, res, next) {
    try {
      const csv = await AdminExportService.exportTeacherActivityCSV();

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="teacher-activity-${new Date().toISOString().split('T')[0]}.csv"`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // KPI-SPECIFIC EXPORTS
  // ============================================

  /**
   * KPI #1: Export quiz performance by topic (Bar Chart data)
   */
  static async exportKPI_QuizPerformanceByTopic(req, res, next) {
    try {
      const csv = await AdminExportService.exportKPI_QuizPerformanceByTopicCSV();

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="kpi-quiz-performance-by-topic-${new Date().toISOString().split('T')[0]}.csv"`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  /**
   * KPI #2: Export submission timeliness (Doughnut Chart data)
   */
  static async exportKPI_SubmissionTimeliness(req, res, next) {
    try {
      const csv = await AdminExportService.exportKPI_SubmissionTimelinessCSV();

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="kpi-submission-timeliness-${new Date().toISOString().split('T')[0]}.csv"`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  /**
   * KPI #3: Export weekly content activity (Column Chart data)
   */
  static async exportKPI_WeeklyContentActivity(req, res, next) {
    try {
      const weeks = parseInt(req.query.weeks) || 12;
      const csv = await AdminExportService.exportKPI_WeeklyContentActivityCSV(weeks);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="kpi-weekly-content-activity-${new Date().toISOString().split('T')[0]}.csv"`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;

