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

