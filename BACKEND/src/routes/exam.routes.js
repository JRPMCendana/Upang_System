const express = require('express');
const router = express.Router();
const ExamController = require('../controller/exam.controller');
const ExamSubmissionController = require('../controller/exam-submission.controller');
const FileController = require('../controller/file.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/auth.middleware');
const { upload, quizSubmissionUpload } = require('../middleware/upload.middleware');

// Teacher routes - create exam, update, list
router.post('/', authMiddleware, authorize('teacher'), upload.single('document'), ExamController.createExam);
router.put('/:examId', authMiddleware, authorize('teacher'), upload.single('document'), ExamController.updateExam);
router.get('/', authMiddleware, authorize('teacher', 'student'), ExamController.getExams);

// Student routes - submit exam (allow images/PDF/DOCX)
router.post('/:examId/submit', authMiddleware, authorize('student'), upload.single('file'), ExamSubmissionController.submitExam);
router.post('/:examId/unsubmit', authMiddleware, authorize('student'), ExamSubmissionController.unsubmitExam);
router.get('/:examId/my-submission', authMiddleware, authorize('student'), ExamSubmissionController.getMySubmission);

// Teacher routes - view submissions, grade
router.get('/:examId/submissions', authMiddleware, authorize('teacher'), ExamSubmissionController.getSubmissionsByExam);
router.put('/submissions/:submissionId/grade', authMiddleware, authorize('teacher'), ExamSubmissionController.gradeSubmission);

// File download/preview for exam documents and submissions
router.get('/files/:fileId', authMiddleware, authorize('teacher', 'student'), FileController.getFile);

module.exports = router;


