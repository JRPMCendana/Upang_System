const express = require('express');
const router = express.Router();
const StudentController = require('../controller/student.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/auth.middleware');

router.get('/assigned-teacher', authMiddleware, authorize('student'), StudentController.getAssignedTeacher);

module.exports = router;

