const AssignmentService = require('../services/assignment.service');

class StudentController {
  static async getAssignedTeacher(req, res, next) {
    try {
      const userId = req.user.id;

      const teacher = await AssignmentService.getAssignedTeacher(userId);

      if (!teacher) {
        return res.status(200).json({
          success: true,
          message: 'No teacher assigned',
          data: null
        });
      }

      res.status(200).json({
        success: true,
        data: teacher
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StudentController;

