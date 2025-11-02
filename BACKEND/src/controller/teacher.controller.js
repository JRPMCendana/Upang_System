const User = require('../models/User.model');
const AssignmentService = require('../services/assignment.service');

class TeacherController {
  static async getAssignedStudents(req, res, next) {
    try {
      const teacherId = req.user.id;
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;

      const result = await AssignmentService.getStudentsByTeacher(teacherId, page, limit);

      res.status(200).json({
        success: true,
        data: result.students,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAssignedStudentById(req, res, next) {
    try {
      const { studentId } = req.params;
      const teacherId = req.user.id;

      if (!studentId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Student ID is required'
        });
      }

      const student = await User.findById(studentId)
        .select('-password')
        .populate('assignedTeacher', '-password');

      if (!student) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Student not found'
        });
      }

      if (student.role !== 'student') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied. This user is not a student.'
        });
      }


      if (!student.assignedTeacher || student.assignedTeacher._id.toString() !== teacherId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied. This student is not assigned to you.'
        });
      }

      res.status(200).json({
        success: true,
        data: student
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TeacherController;

