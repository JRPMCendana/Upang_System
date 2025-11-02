const express = require('express');
const router = express.Router();
const TeacherController = require('../controller/teacher.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/auth.middleware');

router.get('/assigned-students', authMiddleware, authorize('teacher'), TeacherController.getAssignedStudents);

router.get('/assigned-students/:studentId', authMiddleware, authorize('teacher'), TeacherController.getAssignedStudentById);

module.exports = router;

