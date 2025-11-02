const AuthService = require('../services/auth.service');

class AuthController {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Email and password are required'
        });
      }

      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      if (!trimmedEmail || !trimmedPassword) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Email and password are required'
        });
      }

      const result = await AuthService.login(trimmedEmail, trimmedPassword);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

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

  static async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Current password and new password are required'
        });
      }

      const trimmedCurrentPassword = currentPassword.trim();
      const trimmedNewPassword = newPassword.trim();

      if (!trimmedCurrentPassword || !trimmedNewPassword) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Current password and new password are required'
        });
      }

      const result = await AuthService.changePassword(userId, trimmedCurrentPassword, trimmedNewPassword);

      res.status(200).json({
        success: true,
        message: result.message
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

  static async getMe(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await AuthService.getUserById(userId);

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;

