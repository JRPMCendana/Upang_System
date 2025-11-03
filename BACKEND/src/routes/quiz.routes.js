const express = require('express');
const router = express.Router();
const QuizController = require('../controller/quiz.controller');
const QuizSubmissionController = require('../controller/quiz-submission.controller');
const FileController = require('../controller/file.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/auth.middleware');
const { upload, quizSubmissionUpload } = require('../middleware/upload.middleware');

// Teacher & Admin routes - create, update, delete quizzes
router.post('/', authMiddleware, authorize('teacher', 'administrator'), upload.single('document'), QuizController.createQuiz);

router.get('/', authMiddleware, authorize('teacher', 'student', 'administrator'), QuizController.getQuizzes);

router.get('/:quizId', authMiddleware, authorize('teacher', 'student', 'administrator'), QuizController.getQuizById);

router.put('/:quizId', authMiddleware, authorize('teacher', 'administrator'), upload.single('document'), QuizController.updateQuiz);

router.delete('/:quizId', authMiddleware, authorize('teacher', 'administrator'), QuizController.deleteQuiz);

// Student routes - submit quiz, unsubmit, replace submission, get own submission
router.post('/:quizId/submit', authMiddleware, authorize('student'), quizSubmissionUpload.single('file'), QuizSubmissionController.submitQuiz);

router.post('/:quizId/unsubmit', authMiddleware, authorize('student'), QuizSubmissionController.unsubmitQuiz);

router.put('/:quizId/replace', authMiddleware, authorize('student'), quizSubmissionUpload.single('file'), QuizSubmissionController.replaceSubmission);

router.get('/:quizId/my-submission', authMiddleware, authorize('student'), QuizSubmissionController.getSubmission);

// Teacher & Admin routes - view all submissions for a quiz, grade submissions
router.get('/:quizId/submissions', authMiddleware, authorize('teacher', 'administrator'), QuizSubmissionController.getSubmissionsByQuiz);

router.put('/submissions/:submissionId/grade', authMiddleware, authorize('teacher', 'administrator'), QuizSubmissionController.gradeSubmission);

// File download route (for quiz documents and submissions)
router.get('/files/:fileId', authMiddleware, authorize('teacher', 'student', 'administrator'), FileController.getFile);

module.exports = router;

