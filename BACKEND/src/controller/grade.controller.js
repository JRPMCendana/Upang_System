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

  /**
   * Get detailed grade breakdown for a specific student (teacher view)
   */
  static async getStudentGradeDetails(req, res, next) {
    try {
      const { studentId } = req.params;
      const teacherId = req.user.id;

      // Verify user is a teacher
      if (req.user.role !== 'teacher') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only teachers can view student grade details'
        });
      }

      if (!studentId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Student ID is required'
        });
      }

      const details = await GradeService.getStudentGradeDetails(studentId, teacherId);

      res.status(200).json({
        success: true,
        data: details
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GradeController;

