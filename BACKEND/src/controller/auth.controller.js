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

