const QuizService = require('../services/quiz.service');
const { uploadToGridFS } = require('../middleware/upload.middleware');

class QuizController {
  static async createQuiz(req, res, next) {
    try {
      const teacherId = req.user.id;
      const { title, description, quizLink, dueDate, totalPoints, studentIds } = req.body;
      
      // Parse totalPoints if it's a string (from form-data)
      let parsedTotalPoints = totalPoints;
      if (totalPoints && typeof totalPoints === 'string') {
        parsedTotalPoints = parseInt(totalPoints, 10);
      }
      
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
          quizType: 'quiz'
        });
        
        document = fileId.toString();
        documentName = req.file.originalname;
        documentType = req.file.mimetype;
      }

      const result = await QuizService.createQuiz(teacherId, {
        title,
        description,
        quizLink,
        dueDate,
        totalPoints: parsedTotalPoints,
        studentIds: parsedStudentIds,
        document,
        documentName,
        documentType
      });

      res.status(201).json({
        success: true,
        message: 'Quiz created successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getQuizzes(req, res, next) {
    try {
      const userId = req.user.id;
      const role = req.user.role;
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;

      let result;
      if (role === 'teacher') {
        result = await QuizService.getQuizzesByTeacher(userId, page, limit);
      } else if (role === 'student') {
        result = await QuizService.getQuizzesByStudent(userId, page, limit);
      } else if (role === 'administrator' || role === 'admin') {
        // Admins can see all quizzes
        result = await QuizService.getAllQuizzes(page, limit);
      } else {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Unauthorized role'
        });
      }

      res.status(200).json({
        success: true,
        data: result.quizzes,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async getQuizById(req, res, next) {
    try {
      const { quizId } = req.params;
      const userId = req.user.id;
      const role = req.user.role;

      if (!quizId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Quiz ID is required'
        });
      }

      const result = await QuizService.getQuizById(quizId, userId, role);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateQuiz(req, res, next) {
    try {
      const { quizId } = req.params;
      const teacherId = req.user.id;
      const { title, description, quizLink, dueDate, totalPoints, studentIds } = req.body;
      
      // Parse totalPoints if it's a string (from form-data)
      let parsedTotalPoints = totalPoints;
      if (totalPoints && typeof totalPoints === 'string') {
        parsedTotalPoints = parseInt(totalPoints, 10);
      }
      
      // Parse studentIds if it's a JSON string (from form-data)
      let parsedStudentIds = studentIds;
      if (studentIds && typeof studentIds === 'string') {
        try {
          parsedStudentIds = JSON.parse(studentIds);
        } catch (e) {
          // If not JSON, treat as single value or comma-separated
          parsedStudentIds = studentIds.includes(',') ? studentIds.split(',') : [studentIds];
        }
      }
      
      // Ensure it's an array if provided
      if (parsedStudentIds && !Array.isArray(parsedStudentIds)) {
        parsedStudentIds = [parsedStudentIds];
      }
      
      // Handle file upload to GridFS (optional)
      let document = undefined;
      let documentName = undefined;
      let documentType = undefined;
      
      if (req.file) {
        const filename = `${Date.now()}-${req.file.originalname}`;
        const fileId = await uploadToGridFS(req.file, filename, {
          teacherId: teacherId.toString(),
          quizId: quizId,
          quizType: 'quiz'
        });
        
        document = fileId.toString();
        documentName = req.file.originalname;
        documentType = req.file.mimetype;
      }

      if (!quizId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Quiz ID is required'
        });
      }

      const result = await QuizService.updateQuiz(quizId, teacherId, {
        title,
        description,
        quizLink,
        dueDate,
        totalPoints: parsedTotalPoints,
        studentIds: parsedStudentIds,
        document,
        documentName,
        documentType
      });

      res.status(200).json({
        success: true,
        message: 'Quiz updated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

}

module.exports = QuizController;

