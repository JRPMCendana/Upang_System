const AssignmentTaskService = require('../services/assignment-task.service');
const { uploadToGridFS } = require('../middleware/upload.middleware');

class AssignmentTaskController {
  static async createAssignment(req, res, next) {
    try {
      const teacherId = req.user.id;
      const { title, description, dueDate, studentIds } = req.body;
      
      // Parse studentIds if it's a JSON string (from form-data)
      let parsedStudentIds = studentIds;
      if (typeof studentIds === 'string') {
        try {
          parsedStudentIds = JSON.parse(studentIds);
        } catch (e) {
          // If not JSON, treat as single value or comma-separated
          parsedStudentIds = studentIds.includes(',') ? studentIds.split(',') : [studentIds];
        }
      }
      
      // Ensure it's an array
      if (!Array.isArray(parsedStudentIds)) {
        parsedStudentIds = [parsedStudentIds];
      }
      
      // Handle file upload to GridFS (optional)
      let document = null;
      let documentName = null;
      let documentType = null;
      
      if (req.file) {
        const filename = `${Date.now()}-${req.file.originalname}`;
        const fileId = await uploadToGridFS(req.file, filename, {
          teacherId: teacherId.toString(),
          assignmentType: 'assignment'
        });
        
        document = fileId.toString();
        documentName = req.file.originalname;
        documentType = req.file.mimetype;
      }

      const result = await AssignmentTaskService.createAssignment(teacherId, {
        title,
        description,
        dueDate,
        studentIds: parsedStudentIds,
        document,
        documentName,
        documentType
      });

      res.status(201).json({
        success: true,
        message: 'Assignment created successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAssignments(req, res, next) {
    try {
      const userId = req.user.id;
      const role = req.user.role;
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;

      let result;
      if (role === 'teacher') {
        result = await AssignmentTaskService.getAssignmentsByTeacher(userId, page, limit);
      } else if (role === 'student') {
        result = await AssignmentTaskService.getAssignmentsByStudent(userId, page, limit);
      } else if (role === 'administrator' || role === 'admin') {
        // Admins can see all assignments
        result = await AssignmentTaskService.getAllAssignments(page, limit);
      } else {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Unauthorized role'
        });
      }

      res.status(200).json({
        success: true,
        data: result.assignments,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAssignmentById(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const userId = req.user.id;
      const role = req.user.role;

      if (!assignmentId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Assignment ID is required'
        });
      }

      const result = await AssignmentTaskService.getAssignmentById(assignmentId, userId, role);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateAssignment(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const teacherId = req.user.id;
      const { title, description, dueDate, studentIds } = req.body;
      
      // Handle file upload to GridFS
      let document = undefined;
      let documentName = undefined;
      let documentType = undefined;
      
      if (req.file) {
        const filename = `${Date.now()}-${req.file.originalname}`;
        const fileId = await uploadToGridFS(req.file, filename, {
          teacherId: teacherId.toString(),
          assignmentId: assignmentId,
          assignmentType: 'assignment'
        });
        
        document = fileId.toString();
        documentName = req.file.originalname;
        documentType = req.file.mimetype;
      }

      if (!assignmentId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Assignment ID is required'
        });
      }

      const result = await AssignmentTaskService.updateAssignment(assignmentId, teacherId, {
        title,
        description,
        dueDate,
        studentIds,
        document,
        documentName,
        documentType
      });

      res.status(200).json({
        success: true,
        message: 'Assignment updated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAssignment(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const teacherId = req.user.id;

      if (!assignmentId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Assignment ID is required'
        });
      }

      const result = await AssignmentTaskService.deleteAssignment(assignmentId, teacherId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AssignmentTaskController;

