const AuthService = require('../services/auth.service');
const QuizService = require('../services/quiz.service');
const AssignmentTaskService = require('../services/assignment-task.service');
const SubmissionService = require('../services/submission.service');
const QuizSubmissionService = require('../services/quiz-submission.service');
const AdminStatsService = require('../services/admin-stats.service');

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

      const result = await QuizService.getAllQuizzes(page, limit);

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

      const result = await AssignmentTaskService.getAllAssignments(page, limit);

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
}

module.exports = AdminController;

