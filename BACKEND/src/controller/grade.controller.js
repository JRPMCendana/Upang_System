const GradeService = require('../services/grade.service');

class GradeController {
  /**
   * Get teacher grade statistics
   */
  static async getTeacherGradeStats(req, res, next) {
    try {
      const teacherId = req.user.id;

      // Verify user is a teacher
      if (req.user.role !== 'teacher') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only teachers can access teacher grade statistics'
        });
      }

      const stats = await GradeService.getTeacherGradeStats(teacherId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get student grade statistics
   */
  static async getStudentGradeStats(req, res, next) {
    try {
      const studentId = req.user.id;

      // Verify user is a student
      if (req.user.role !== 'student') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only students can access student grade statistics'
        });
      }

      const stats = await GradeService.getStudentGradeStats(studentId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GradeController;

