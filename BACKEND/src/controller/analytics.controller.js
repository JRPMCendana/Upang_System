const AnalyticsService = require('../services/analytics.service');

class AnalyticsController {

  /**
   * Get quiz performance by topic
   * GET /api/analytics/quiz-performance
   */
  static async getQuizPerformance(req, res, next) {
    try {
      const teacherId = req.user.id;

      const data = await AnalyticsService.getQuizPerformanceByTopic(teacherId);

      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get assignment submission timeliness
   * GET /api/analytics/submission-timeliness
   */
  static async getSubmissionTimeliness(req, res, next) {
    try {
      const teacherId = req.user.id;

      const data = await AnalyticsService.getAssignmentSubmissionTimeliness(teacherId);

      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get weekly content activity
   * GET /api/analytics/weekly-activity
   */
  static async getWeeklyActivity(req, res, next) {
    try {
      const teacherId = req.user.id;
      const weeks = parseInt(req.query.weeks) || 12;

      const data = await AnalyticsService.getWeeklyContentActivity(teacherId, weeks);

      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all analytics data
   * GET /api/analytics/teacher
   */
  static async getTeacherAnalytics(req, res, next) {
    try {
      const teacherId = req.user.id;

      const data = await AnalyticsService.getTeacherAnalytics(teacherId);

      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export quiz performance to CSV
   * GET /api/analytics/export/quiz-performance
   */
  static async exportQuizPerformance(req, res, next) {
    try {
      const teacherId = req.user.id;

      const csv = await AnalyticsService.exportQuizPerformanceCSV(teacherId);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="quiz-performance.csv"');
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export submission timeliness to CSV
   * GET /api/analytics/export/submission-timeliness
   */
  static async exportSubmissionTimeliness(req, res, next) {
    try {
      const teacherId = req.user.id;

      const csv = await AnalyticsService.exportSubmissionTimelinessCSV(teacherId);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="submission-timeliness.csv"');
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export weekly activity to CSV
   * GET /api/analytics/export/weekly-activity
   */
  static async exportWeeklyActivity(req, res, next) {
    try {
      const teacherId = req.user.id;
      const weeks = parseInt(req.query.weeks) || 12;

      const csv = await AnalyticsService.exportWeeklyActivityCSV(teacherId, weeks);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="weekly-activity.csv"');
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export all analytics to CSV (returns ZIP or multiple files info)
   * GET /api/analytics/export/all
   */
  static async exportAllAnalytics(req, res, next) {
    try {
      const teacherId = req.user.id;

      const data = await AnalyticsService.exportAllAnalyticsCSV(teacherId);

      // Return JSON with all CSV data
      // Frontend can create multiple downloads or combine them
      res.status(200).json({
        success: true,
        data: {
          quizPerformance: data.quizPerformance,
          submissionTimeliness: data.submissionTimeliness,
          weeklyActivity: data.weeklyActivity
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AnalyticsController;
