const Assignment = require('../models/Assignment.model');
const AssignmentSubmission = require('../models/AssignmentSubmission.model');
const Quiz = require('../models/Quiz.model');
const QuizSubmission = require('../models/QuizSubmission.model');
const Exam = require('../models/Exam.model');
const User = require('../models/User.model');
const DbUtils = require('../utils/db.utils');

/**
 * Analytics Service
 * Provides data analytics for teacher dashboard charts and reports
 */
class AnalyticsService {

  /**
   * Get average quiz scores per topic/module
   * For Chart 1: Bar Chart showing performance by quiz
   * @param {string} teacherId - Teacher ID
   * @returns {Promise<Array>} Array of quiz performance data
   */
  static async getQuizPerformanceByTopic(teacherId) {
    try {
      // Get all quizzes created by this teacher
      const quizzes = await Quiz.find({ assignedBy: teacherId }).lean();
      
      if (quizzes.length === 0) {
        return [];
      }

      const quizIds = quizzes.map(q => q._id);

      // Get all graded submissions for these quizzes
      const submissions = await QuizSubmission.find({
        quiz: { $in: quizIds },
        isSubmitted: true,
        grade: { $ne: null, $exists: true }
      }).populate('quiz', 'title totalPoints');

      // Group submissions by quiz and calculate averages
      const performanceMap = new Map();

      submissions.forEach(sub => {
        const quizId = sub.quiz._id.toString();
        const quizTitle = sub.quiz.title;
        const maxScore = sub.quiz.totalPoints || 100;
        const percentage = (sub.grade / maxScore) * 100;

        if (!performanceMap.has(quizId)) {
          performanceMap.set(quizId, {
            quizId,
            title: quizTitle,
            totalPoints: maxScore,
            grades: [],
            submissionCount: 0
          });
        }

        const data = performanceMap.get(quizId);
        data.grades.push(percentage);
        data.submissionCount++;
      });

      // Calculate averages and format for chart
      const performanceData = Array.from(performanceMap.values()).map(item => ({
        topic: item.title,
        averageScore: item.grades.length > 0 
          ? Math.round(item.grades.reduce((sum, g) => sum + g, 0) / item.grades.length * 10) / 10
          : 0,
        submissionCount: item.submissionCount,
        totalPoints: item.totalPoints
      }));

      // Sort by average score descending
      performanceData.sort((a, b) => b.averageScore - a.averageScore);

      return performanceData;

    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to get quiz performance data'
      };
    }
  }

  /**
   * Get assignment submission timeliness statistics
   * For Chart 2: Doughnut Chart showing on-time vs late submissions
   * @param {string} teacherId - Teacher ID
   * @returns {Promise<Object>} Submission timeliness data
   */
  static async getAssignmentSubmissionTimeliness(teacherId) {
    try {
      // Get all assignments created by this teacher
      const assignments = await Assignment.find({ assignedBy: teacherId }).lean();
      
      if (assignments.length === 0) {
        return {
          onTime: 0,
          late: 0,
          notSubmitted: 0,
          total: 0,
          onTimePercentage: 0,
          latePercentage: 0,
          notSubmittedPercentage: 0
        };
      }

      const assignmentIds = assignments.map(a => a._id);

      let expectedSubmissions = 0;
      assignments.forEach(assignment => {
        if (assignment.assignedTo && Array.isArray(assignment.assignedTo)) {
          expectedSubmissions += assignment.assignedTo.length;
        }
      });


      const submissions = await AssignmentSubmission.find({
        assignment: { $in: assignmentIds }
      }).populate('assignment', 'dueDate');

      let onTime = 0;
      let late = 0;
      let notSubmitted = 0;

      // Create a map of existing submissions for quick lookup
      const submissionMap = new Map();
      submissions.forEach(sub => {
        const key = `${sub.assignment._id.toString()}_${sub.student.toString()}`;
        submissionMap.set(key, sub);
      });

      // Count submitted submissions
      submissions.forEach(sub => {
        if (sub.isSubmitted) {
          if (sub.assignment.dueDate && sub.submittedAt) {
            // Compare submission date with due date
            if (new Date(sub.submittedAt) <= new Date(sub.assignment.dueDate)) {
              onTime++;
            } else {
              late++;
            }
          } else {
            // If no due date, consider it on time if submitted
            onTime++;
          }
        }
      });

      // Calculate not submitted: expected - (onTime + late)
      // This accounts for students who haven't submitted yet
      const submittedCount = onTime + late;
      notSubmitted = Math.max(0, expectedSubmissions - submittedCount);

      const total = expectedSubmissions; // Total should be expected submissions
      const onTimePercentage = total > 0 ? Math.round((onTime / total) * 100 * 100) / 100 : 0;
      const latePercentage = total > 0 ? Math.round((late / total) * 100 * 100) / 100 : 0;
      const notSubmittedPercentage = total > 0 ? Math.round((notSubmitted / total) * 100 * 100) / 100 : 0;

      return {
        onTime,
        late,
        notSubmitted,
        total,
        onTimePercentage,
        latePercentage,
        notSubmittedPercentage
      };

    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to get submission timeliness data'
      };
    }
  }

  static async getWeeklyContentActivity(teacherId, weeks = 12) {
    try {
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - (weeks * 7));

      const [assignments, quizzes, exams] = await Promise.all([
        Assignment.find({
          assignedBy: teacherId,
          createdAt: { $gte: startDate }
        }).select('createdAt title').lean(),
        Quiz.find({
          assignedBy: teacherId,
          createdAt: { $gte: startDate }
        }).select('createdAt title').lean(),
        Exam.find({
          assignedBy: teacherId,
          createdAt: { $gte: startDate }
        }).select('createdAt title').lean()
      ]);

      // Combine all content
      const allContent = [
        ...assignments.map(a => ({ ...a, type: 'assignment' })),
        ...quizzes.map(q => ({ ...q, type: 'quiz' })),
        ...exams.map(e => ({ ...e, type: 'exam' }))
      ];

      const weeklyData = new Map();

      for (let i = 0; i < weeks; i++) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i * 7));
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const weekKey = `Week ${weeks - i}`;
        weeklyData.set(weekKey, {
          week: weekKey,
          weekStart: weekStart.toISOString().split('T')[0],
          weekEnd: weekEnd.toISOString().split('T')[0],
          assignments: 0,
          quizzes: 0,
          exams: 0,
          total: 0
        });
      }

      // Count content per week
      allContent.forEach(item => {
        const itemDate = new Date(item.createdAt);
        
        // Find which week this belongs to
        let weekIndex = Math.floor((now - itemDate) / (7 * 24 * 60 * 60 * 1000));
        if (weekIndex >= weeks) weekIndex = weeks - 1;
        if (weekIndex < 0) weekIndex = 0;

        const weekKey = `Week ${weeks - weekIndex}`;
        const weekData = weeklyData.get(weekKey);

        if (weekData) {
          if (item.type === 'assignment') weekData.assignments++;
          else if (item.type === 'quiz') weekData.quizzes++;
          else if (item.type === 'exam') weekData.exams++;
          weekData.total++;
        }
      });

      return Array.from(weeklyData.values());

    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to get weekly content activity data'
      };
    }
  }

  /**
   * Get comprehensive analytics data for teacher
   * Combines all analytics in one call
   * @param {string} teacherId - Teacher ID
   * @returns {Promise<Object>} All analytics data
   */
  static async getTeacherAnalytics(teacherId) {
    try {
      const [
        quizPerformance,
        submissionTimeliness,
        weeklyActivity
      ] = await Promise.all([
        this.getQuizPerformanceByTopic(teacherId),
        this.getAssignmentSubmissionTimeliness(teacherId),
        this.getWeeklyContentActivity(teacherId)
      ]);

      return {
        quizPerformance,
        submissionTimeliness,
        weeklyActivity
      };

    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to get teacher analytics'
      };
    }
  }

  /**
   * Export quiz performance data to CSV format
   * @param {string} teacherId - Teacher ID
   * @returns {Promise<string>} CSV string
   */
  static async exportQuizPerformanceCSV(teacherId) {
    try {
      const data = await this.getQuizPerformanceByTopic(teacherId);

      // CSV headers
      let csv = 'Quiz Title,Average Score (%),Submission Count,Total Points\n';

      // Add data rows
      data.forEach(item => {
        csv += `"${item.topic}",${item.averageScore},${item.submissionCount},${item.totalPoints}\n`;
      });

      return csv;

    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to export quiz performance data'
      };
    }
  }

  /**
   * Export submission timeliness data to CSV format
   * @param {string} teacherId - Teacher ID
   * @returns {Promise<string>} CSV string
   */
  static async exportSubmissionTimelinessCSV(teacherId) {
    try {
      const data = await this.getAssignmentSubmissionTimeliness(teacherId);

      // CSV headers
      let csv = 'Category,Count,Percentage\n';

      // Add data rows
      csv += `On Time,${data.onTime},${data.onTimePercentage}%\n`;
      csv += `Late,${data.late},${data.latePercentage}%\n`;
      csv += `Not Submitted,${data.notSubmitted},${data.notSubmittedPercentage}%\n`;
      csv += `Total,${data.total},100%\n`;

      return csv;

    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to export submission timeliness data'
      };
    }
  }

  /**
   * Export weekly activity data to CSV format
   * @param {string} teacherId - Teacher ID
   * @param {number} weeks - Number of weeks
   * @returns {Promise<string>} CSV string
   */
  static async exportWeeklyActivityCSV(teacherId, weeks = 12) {
    try {
      const data = await this.getWeeklyContentActivity(teacherId, weeks);

      // CSV headers
      let csv = 'Week,Period Start,Period End,Assignments,Quizzes,Exams,Total\n';

      // Add data rows
      data.forEach(item => {
        csv += `"${item.week}",${item.weekStart},${item.weekEnd},${item.assignments},${item.quizzes},${item.exams},${item.total}\n`;
      });

      return csv;

    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to export weekly activity data'
      };
    }
  }

  /**
   * Export all analytics data to CSV format (comprehensive report)
   * @param {string} teacherId - Teacher ID
   * @returns {Promise<Object>} Object with multiple CSV strings
   */
  static async exportAllAnalyticsCSV(teacherId) {
    try {
      const [
        quizPerformanceCSV,
        submissionTimelinessCSV,
        weeklyActivityCSV
      ] = await Promise.all([
        this.exportQuizPerformanceCSV(teacherId),
        this.exportSubmissionTimelinessCSV(teacherId),
        this.exportWeeklyActivityCSV(teacherId)
      ]);

      return {
        quizPerformance: quizPerformanceCSV,
        submissionTimeliness: submissionTimelinessCSV,
        weeklyActivity: weeklyActivityCSV
      };

    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to export analytics data'
      };
    }
  }
}

module.exports = AnalyticsService;
