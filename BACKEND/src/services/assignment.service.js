const User = require('../models/User.model');
const DbUtils = require('../utils/db.utils');

class AssignmentService {
  static async assignTeacher(studentId, teacherId) {
    try {
      if (!studentId || !teacherId) {
        throw {
          status: 400,
          message: 'Student ID and Teacher ID are required'
        };
      }

      const student = await User.findById(studentId);
      if (!student) {
        throw {
          status: 404,
          message: 'Student not found'
        };
      }

      if (student.role !== 'student') {
        throw {
          status: 400,
          message: 'User is not a student'
        };
      }

      const teacher = await User.findById(teacherId);
      if (!teacher) {
        throw {
          status: 404,
          message: 'Teacher not found'
        };
      }

      if (teacher.role !== 'teacher') {
        throw {
          status: 400,
          message: 'User is not a teacher'
        };
      }

      if (teacher.status !== 'active') {
        throw {
          status: 400,
          message: 'Cannot assign inactive teacher to student'
        };
      }

      student.assignedTeacher = teacherId;
      await student.save();

      const updatedStudent = await User.findById(studentId)
        .select('-password')
        .populate('assignedTeacher', '-password');

      return updatedStudent;
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to assign teacher'
      };
    }
  }

  static async unassignTeacher(studentId) {
    try {
      if (!studentId) {
        throw {
          status: 400,
          message: 'Student ID is required'
        };
      }

      const student = await User.findById(studentId);
      if (!student) {
        throw {
          status: 404,
          message: 'Student not found'
        };
      }

      if (student.role !== 'student') {
        throw {
          status: 400,
          message: 'User is not a student'
        };
      }

      student.assignedTeacher = null;
      await student.save();

      const updatedStudent = await User.findById(studentId)
        .select('-password');

      return updatedStudent;
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to unassign teacher'
      };
    }
  }

  static async getAssignedTeacher(studentId) {
    try {
      if (!studentId) {
        throw {
          status: 400,
          message: 'Student ID is required'
        };
      }

      const student = await User.findById(studentId)
        .select('-password')
        .populate('assignedTeacher', '-password');

      if (!student) {
        throw {
          status: 404,
          message: 'Student not found'
        };
      }

      if (student.role !== 'student') {
        throw {
          status: 400,
          message: 'User is not a student'
        };
      }

      return student.assignedTeacher;
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to get assigned teacher'
      };
    }
  }

  static async getStudentsByTeacher(teacherId, page = 1, limit = 10) {
    try {
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      if (pageNum < 1) {
        throw {
          status: 400,
          message: 'Page must be greater than 0'
        };
      }

      if (limitNum < 1 || limitNum > 100) {
        throw {
          status: 400,
          message: 'Limit must be between 1 and 100'
        };
      }

      const teacher = await User.findById(teacherId);
      if (!teacher) {
        throw {
          status: 404,
          message: 'Teacher not found'
        };
      }

      if (teacher.role !== 'teacher') {
        throw {
          status: 400,
          message: 'User is not a teacher'
        };
      }

      const skip = (pageNum - 1) * limitNum;

      const [students, total] = await Promise.all([
        User.find({ assignedTeacher: teacherId, role: 'student' })
          .select('-password')
          .populate('assignedTeacher', '-password')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        User.countDocuments({ assignedTeacher: teacherId, role: 'student' })
      ]);

      const totalPages = Math.ceil(total / limitNum);

      return {
        students,
        pagination: {
          currentPage: pageNum,
          limit: limitNum,
          totalItems: total,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      };
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to get students'
      };
    }
  }
}

module.exports = AssignmentService;

