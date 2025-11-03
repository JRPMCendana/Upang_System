const express = require('express');
const router = express.Router();
const DashboardController = require('../controller/dashboard.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/student', authMiddleware, DashboardController.getStudentDashboard);


router.get('/teacher', authMiddleware, DashboardController.getTeacherDashboard);

module.exports = router;
