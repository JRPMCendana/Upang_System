const AuthService = require('../services/auth.service');

class AuthController {
  /**
   * Login endpoint handler
   * POST /api/auth/login
   */
  static async login(req, res, next) {
    try {
      const { usernameOrEmail, password } = req.body;

      // Validation
      if (!usernameOrEmail || !password) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Username/Email and password are required'
        });
      }

      // Call service
      const result = await AuthService.login(usernameOrEmail, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
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

