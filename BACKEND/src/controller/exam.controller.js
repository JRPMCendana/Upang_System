const ExamService = require('../services/exam.service');
const { uploadToGridFS } = require('../middleware/upload.middleware');

class ExamController {
  static async createExam(req, res, next) {
    try {
      const teacherId = req.user.id;
      const { title, description, dueDate, totalPoints, studentIds } = req.body;

      let parsedTotalPoints = totalPoints;
      if (totalPoints && typeof totalPoints === 'string') parsedTotalPoints = parseInt(totalPoints, 10);

      let parsedStudentIds = studentIds;
      if (typeof studentIds === 'string') {
        try { parsedStudentIds = JSON.parse(studentIds); } catch {
          parsedStudentIds = studentIds.includes(',') ? studentIds.split(',') : [studentIds];
        }
      }
      if (parsedStudentIds && !Array.isArray(parsedStudentIds)) parsedStudentIds = [parsedStudentIds];

      let document = null, documentName = null, documentType = null;
      if (req.file) {
        const filename = `${Date.now()}-${req.file.originalname}`;
        const fileId = await uploadToGridFS(req.file, filename, { teacherId: teacherId.toString(), examType: 'exam' });
        document = fileId.toString();
        documentName = req.file.originalname;
        documentType = req.file.mimetype;
      }

      const result = await ExamService.createExam(teacherId, { title, description, dueDate, totalPoints: parsedTotalPoints, studentIds: parsedStudentIds, document, documentName, documentType });

      res.status(201).json({ success: true, message: 'Exam created successfully', data: result });
    } catch (error) { next(error); }
  }

  static async getExams(req, res, next) {
    try {
      const userId = req.user.id;
      const role = req.user.role;
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;

      let result;
      if (role === 'teacher') result = await ExamService.getExamsByTeacher(userId, page, limit);
      else if (role === 'student') result = await ExamService.getExamsByStudent(userId, page, limit);
      else return res.status(403).json({ error: 'Forbidden', message: 'Only teachers and students can view exams' });

      res.status(200).json({ success: true, data: result.exams, pagination: result.pagination });
    } catch (error) { next(error); }
  }

  static async updateExam(req, res, next) {
    try {
      const teacherId = req.user.id;
      const { examId } = req.params;
      const { title, description, dueDate, totalPoints } = req.body;

      let document = undefined, documentName = undefined, documentType = undefined;
      if (req.file) {
        // file already uploaded in service, but pass through
        document = req.file;
        documentName = req.file.originalname;
        documentType = req.file.mimetype;
      }

      const result = await ExamService.updateExam(teacherId, examId, {
        title,
        description,
        dueDate,
        totalPoints,
        document,
        documentName,
        documentType,
      });

      res.status(200).json({ success: true, message: 'Exam updated successfully', data: result });
    } catch (error) { next(error); }
  }

  static async deleteExam(req, res, next) {
    try {
      const teacherId = req.user.id;
      const { examId } = req.params;
      await ExamService.deleteExam(teacherId, examId);
      res.status(200).json({ success: true, message: 'Exam deleted successfully' });
    } catch (error) { next(error); }
  }
}

module.exports = ExamController;


