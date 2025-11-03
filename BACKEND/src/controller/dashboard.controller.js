const DashboardService = require('../services/dashboard.service');

class DashboardController {
  /**
   * Get student dashboard statistics
   */
  static async getStudentDashboard(req, res, next) {
    try {
      const studentId = req.user.id;

      // Verify user is a student
      if (req.user.role !== 'student') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only students can access student dashboard'
        });
      }

      const stats = await DashboardService.getStudentStats(studentId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get teacher dashboard statistics
   */
  static async getTeacherDashboard(req, res, next) {
    try {
      const teacherId = req.user.id;

      // Verify user is a teacher
      if (req.user.role !== 'teacher') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only teachers can access teacher dashboard'
        });
      }

      const stats = await DashboardService.getTeacherStats(teacherId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DashboardController;
