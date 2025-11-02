const express = require('express');
const router = express.Router();
const AdminController = require('../controller/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/auth.middleware');

router.post('/create-account', authMiddleware, authorize('administrator'), AdminController.createAccount);

router.get('/users', authMiddleware, authorize('administrator'), AdminController.getAllUsers);

router.put('/update-user/:userId', authMiddleware, authorize('administrator'), AdminController.updateUser);

router.post('/assign-teacher/:studentId', authMiddleware, authorize('administrator'), AdminController.assignTeacher);

router.delete('/unassign-teacher/:studentId', authMiddleware, authorize('administrator'), AdminController.unassignTeacher);

// Admin routes - fetch all quizzes, assignments, and submissions
router.get('/quizzes', authMiddleware, authorize('administrator'), AdminController.getAllQuizzes);

router.get('/assignments', authMiddleware, authorize('administrator'), AdminController.getAllAssignments);

router.get('/assignment-submissions', authMiddleware, authorize('administrator'), AdminController.getAllAssignmentSubmissions);

router.get('/quiz-submissions', authMiddleware, authorize('administrator'), AdminController.getAllQuizSubmissions);

module.exports = router;

