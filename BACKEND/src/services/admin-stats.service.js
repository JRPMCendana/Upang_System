const AssignmentSubmission = require('../models/AssignmentSubmission.model');
const QuizSubmission = require('../models/QuizSubmission.model');
const mongoose = require('mongoose');

class AdminStatsService {
  /**
   * Get system-wide statistics for admin dashboard
   * @returns {Object} System statistics
   */
  static async getSystemStatistics() {
    try {
      // Get GridFS bucket for file counting
      const db = mongoose.connection.db;
      const bucket = new mongoose.mongo.GridFSBucket(db, {
        bucketName: 'assignments'
      });

      // Count total files uploaded in GridFS
      const filesCollection = db.collection('assignments.files');
      const totalFiles = await filesCollection.countDocuments();

      // Count total submissions (assignments + quizzes)
      const [assignmentSubmissionsCount, quizSubmissionsCount] = await Promise.all([
        AssignmentSubmission.countDocuments(),
        QuizSubmission.countDocuments()
      ]);
      const totalSubmissions = assignmentSubmissionsCount + quizSubmissionsCount;

      // Calculate average score from graded submissions
      // For assignments: calculate percentage from grade/maxGrade
      // For quizzes: calculate percentage from grade/totalPoints
      const assignmentGradesResult = await AssignmentSubmission.aggregate([
        {
          $match: {
            grade: { $ne: null },
            status: 'graded'
          }
        },
        {
          $lookup: {
            from: 'assignments',
            localField: 'assignmentId',
            foreignField: '_id',
            as: 'assignment'
          }
        },
        {
          $unwind: '$assignment'
        },
        {
          $project: {
            percentage: {
              $cond: {
                if: { $gt: ['$assignment.maxGrade', 0] },
                then: {
                  $multiply: [
                    { $divide: ['$grade', '$assignment.maxGrade'] },
                    100
                  ]
                },
                else: 0
              }
            }
          }
        },
        {
          $group: {
            _id: null,
            avgPercentage: { $avg: '$percentage' },
            count: { $sum: 1 }
          }
        }
      ]);

      const quizGradesResult = await QuizSubmission.aggregate([
        {
          $match: {
            grade: { $ne: null },
            status: 'graded'
          }
        },
        {
          $lookup: {
            from: 'quizzes',
            localField: 'quizId',
            foreignField: '_id',
            as: 'quiz'
          }
        },
        {
          $unwind: '$quiz'
        },
        {
          $project: {
            percentage: {
              $cond: {
                if: { $gt: ['$quiz.totalPoints', 0] },
                then: {
                  $multiply: [
                    { $divide: ['$grade', '$quiz.totalPoints'] },
                    100
                  ]
                },
                else: 0
              }
            }
          }
        },
        {
          $group: {
            _id: null,
            avgPercentage: { $avg: '$percentage' },
            count: { $sum: 1 }
          }
        }
      ]);

      // Calculate weighted average score
      let averageScore = 0;
      const assignmentData = assignmentGradesResult[0] || { avgPercentage: 0, count: 0 };
      const quizData = quizGradesResult[0] || { avgPercentage: 0, count: 0 };
      
      const totalGradedSubmissions = assignmentData.count + quizData.count;
      
      if (totalGradedSubmissions > 0) {
        const weightedSum = 
          (assignmentData.avgPercentage * assignmentData.count) +
          (quizData.avgPercentage * quizData.count);
        averageScore = Math.round(weightedSum / totalGradedSubmissions);
      }

      return {
        filesUploaded: totalFiles,
        totalSubmissions: totalSubmissions,
        averageScore: averageScore,
        breakdown: {
          assignmentSubmissions: assignmentSubmissionsCount,
          quizSubmissions: quizSubmissionsCount,
          gradedAssignments: assignmentData.count,
          gradedQuizzes: quizData.count
        }
      };
    } catch (error) {
      console.error('Error in AdminStatsService.getSystemStatistics:', error);
      throw error;
    }
  }
}

module.exports = AdminStatsService;
