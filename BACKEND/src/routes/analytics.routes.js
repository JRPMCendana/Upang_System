const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controller/analytics.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/auth.middleware');

// All routes require teacher authentication

/**
 * Get quiz performance by topic (for Bar Chart)
 * GET /api/analytics/quiz-performance
 */
router.get('/quiz-performance', authMiddleware, authorize('teacher'), AnalyticsController.getQuizPerformance);

/**
 * Get submission timeliness (for Doughnut Chart)
 * GET /api/analytics/submission-timeliness
 */
router.get('/submission-timeliness', authMiddleware, authorize('teacher'), AnalyticsController.getSubmissionTimeliness);

/**
 * Get weekly content activity (for Column Chart)
 * GET /api/analytics/weekly-activity?weeks=12
 */
router.get('/weekly-activity', authMiddleware, authorize('teacher'), AnalyticsController.getWeeklyActivity);

/**
 * Get all analytics data (combined)
 * GET /api/analytics/teacher
 */
router.get('/teacher', authMiddleware, authorize('teacher'), AnalyticsController.getTeacherAnalytics);

// Export routes

/**
 * Export quiz performance to CSV
 * GET /api/analytics/export/quiz-performance
 */
router.get('/export/quiz-performance', authMiddleware, authorize('teacher'), AnalyticsController.exportQuizPerformance);

/**
 * Export submission timeliness to CSV
 * GET /api/analytics/export/submission-timeliness
 */
router.get('/export/submission-timeliness', authMiddleware, authorize('teacher'), AnalyticsController.exportSubmissionTimeliness);

/**
 * Export weekly activity to CSV
 * GET /api/analytics/export/weekly-activity?weeks=12
 */
router.get('/export/weekly-activity', authMiddleware, authorize('teacher'), AnalyticsController.exportWeeklyActivity);

/**
 * Export all analytics to CSV
 * GET /api/analytics/export/all
 */
router.get('/export/all', authMiddleware, authorize('teacher'), AnalyticsController.exportAllAnalytics);

module.exports = router;
