const express = require('express');
const router = express.Router();
const GradeController = require('../controller/grade.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Teacher grade statistics
router.get('/teacher', authMiddleware, GradeController.getTeacherGradeStats);

// Student grade statistics
router.get('/student', authMiddleware, GradeController.getStudentGradeStats);

// Student grade details (teacher view)
router.get('/student/:studentId', authMiddleware, GradeController.getStudentGradeDetails);

module.exports = router;

