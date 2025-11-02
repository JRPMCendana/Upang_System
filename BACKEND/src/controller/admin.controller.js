const AuthService = require('../services/auth.service');

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
}

module.exports = AdminController;

