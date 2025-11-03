const express = require('express');
const router = express.Router();
const DashboardController = require('../controller/dashboard.controller');
const authMiddleware = require('../middleware/auth.middleware');
// Fixed: Using authMiddleware instead of authenticate

/**
 * @route   GET /api/dashboard/student
 * @desc    Get student dashboard statistics
 * @access  Private (Student only)
 */
router.get('/student', authMiddleware, DashboardController.getStudentDashboard);

/**
 * @route   GET /api/dashboard/teacher
 * @desc    Get teacher dashboard statistics
 * @access  Private (Teacher only)
 */
router.get('/teacher', authMiddleware, DashboardController.getTeacherDashboard);

module.exports = router;
