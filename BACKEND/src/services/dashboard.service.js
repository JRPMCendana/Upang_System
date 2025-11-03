const Assignment = require('../models/Assignment.model');
const AssignmentSubmission = require('../models/AssignmentSubmission.model');
const Quiz = require('../models/Quiz.model');
const QuizSubmission = require('../models/QuizSubmission.model');
const User = require('../models/User.model');
const DbUtils = require('../utils/db.utils');

class DashboardService {
  /**
   * Get student dashboard statistics
   */
  static async getStudentStats(studentId) {
    try {
      // Get all assignments assigned to student
      const assignments = await Assignment.find({ 
        assignedTo: studentId 
      });

      const assignmentIds = assignments.map(a => a._id);

      // Get all submissions for this student
      const [assignmentSubmissions, quizzes] = await Promise.all([
        AssignmentSubmission.find({ 
          student: studentId,
          assignment: { $in: assignmentIds }
        }),
        Quiz.find({ assignedTo: studentId })
      ]);

      const quizIds = quizzes.map(q => q._id);
      const quizSubmissions = await QuizSubmission.find({
        student: studentId,
        quiz: { $in: quizIds }
      });

      // Calculate pending assignments (not submitted or late)
      const now = new Date();
      const submissionMap = new Map();
      assignmentSubmissions.forEach(sub => {
        submissionMap.set(sub.assignment.toString(), sub);
      });

      let pendingAssignments = 0;
      let lateAssignments = 0;
      let completedAssignments = 0;

      assignments.forEach(assignment => {
        const submission = submissionMap.get(assignment._id.toString());
        if (!submission || !submission.isSubmitted) {
          if (new Date(assignment.dueDate) < now) {
            lateAssignments++;
          } else {
            pendingAssignments++;
          }
        } else {
          completedAssignments++;
        }
      });

      // Calculate pending quizzes
      const quizSubmissionMap = new Map();
      quizSubmissions.forEach(sub => {
        quizSubmissionMap.set(sub.quiz.toString(), sub);
      });

      let pendingQuizzes = 0;
      quizzes.forEach(quiz => {
        const submission = quizSubmissionMap.get(quiz._id.toString());
        if (!submission || !submission.isSubmitted) {
          pendingQuizzes++;
        }
      });

      // Calculate average grade (only graded assignments)
      const gradedAssignments = assignmentSubmissions.filter(
        sub => sub.grade !== null && sub.grade !== undefined
      );
      const gradedQuizzes = quizSubmissions.filter(
        sub => sub.grade !== null && sub.grade !== undefined
      );

      const allGrades = [
        ...gradedAssignments.map(s => s.grade),
        ...gradedQuizzes.map(s => s.grade)
      ];

      const averageGrade = allGrades.length > 0
        ? Math.round(allGrades.reduce((sum, grade) => sum + grade, 0) / allGrades.length)
        : 0;

      // Calculate completion rate
      const totalTasks = assignments.length + quizzes.length;
      const completedTasks = completedAssignments + quizSubmissions.filter(s => s.isSubmitted).length;
      const completionRate = totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

      // Get recent assignments (next 5 upcoming)
      const recentAssignments = await Assignment.find({
        assignedTo: studentId,
        dueDate: { $gte: now }
      })
        .populate('assignedBy', 'firstName lastName')
        .sort({ dueDate: 1 })
        .limit(5)
        .lean();

      // Add submission status to recent assignments
      const recentWithStatus = recentAssignments.map(assignment => {
        const submission = submissionMap.get(assignment._id.toString());
        let status = 'pending';
        
        if (submission && submission.isSubmitted) {
          if (submission.grade !== null && submission.gradedAt !== null) {
            status = 'graded';
          } else {
            status = 'submitted';
          }
        } else if (new Date(assignment.dueDate) < now) {
          status = 'late';
        }

        return {
          ...assignment,
          status,
          submission: submission || null
        };
      });

      return {
        pendingAssignments,
        pendingQuizzes,
        lateAssignments,
        averageGrade,
        completionRate,
        totalAssignments: assignments.length,
        totalQuizzes: quizzes.length,
        completedAssignments,
        completedQuizzes: quizSubmissions.filter(s => s.isSubmitted).length,
        recentAssignments: recentWithStatus
      };
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to get student statistics'
      };
    }
  }

  /**
   * Get teacher dashboard statistics
   */
  static async getTeacherStats(teacherId) {
    try {
      // Get all students assigned to this teacher
      const students = await User.find({
        role: 'student',
        assignedTeacher: teacherId
      }).select('_id firstName lastName email');

      const studentIds = students.map(s => s._id);

      // Get all assignments created by this teacher
      const assignments = await Assignment.find({
        assignedBy: teacherId
      });

      const assignmentIds = assignments.map(a => a._id);

      // Get all quizzes created by this teacher
      const quizzes = await Quiz.find({
        assignedBy: teacherId
      });

      const quizIds = quizzes.map(q => q._id);

      // Get all submissions
      const [assignmentSubmissions, quizSubmissions] = await Promise.all([
        AssignmentSubmission.find({
          assignment: { $in: assignmentIds }
        }).populate('assignment', 'title dueDate'),
        QuizSubmission.find({
          quiz: { $in: quizIds }
        }).populate('quiz', 'title')
      ]);

      // Calculate pending submissions (submitted but not graded)
      const pendingAssignmentGrading = assignmentSubmissions.filter(
        sub => sub.isSubmitted && (sub.grade === null || sub.grade === undefined)
      ).length;

      const pendingQuizGrading = quizSubmissions.filter(
        sub => sub.isSubmitted && (sub.grade === null || sub.grade === undefined)
      ).length;

      const totalPendingGrading = pendingAssignmentGrading + pendingQuizGrading;

      // Calculate total submissions
      const totalSubmissions = assignmentSubmissions.filter(s => s.isSubmitted).length +
                              quizSubmissions.filter(s => s.isSubmitted).length;

      // Calculate graded submissions
      const gradedAssignments = assignmentSubmissions.filter(
        sub => sub.grade !== null && sub.grade !== undefined
      ).length;

      const gradedQuizzes = quizSubmissions.filter(
        sub => sub.grade !== null && sub.grade !== undefined
      ).length;

      const totalGraded = gradedAssignments + gradedQuizzes;

      // Get recent submissions (last 5 that need grading)
      const recentPendingSubmissions = assignmentSubmissions
        .filter(sub => sub.isSubmitted && (sub.grade === null || sub.grade === undefined))
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .slice(0, 5);

      // Populate student info for recent submissions
      const recentWithStudents = await Promise.all(
        recentPendingSubmissions.map(async (sub) => {
          const student = await User.findById(sub.student).select('firstName lastName email');
          return {
            _id: sub._id,
            assignment: sub.assignment,
            student,
            submittedAt: sub.submittedAt,
            type: 'assignment'
          };
        })
      );

      // Calculate average class grade
      const allGrades = [
        ...assignmentSubmissions.filter(s => s.grade !== null).map(s => s.grade),
        ...quizSubmissions.filter(s => s.grade !== null).map(s => s.grade)
      ];

      const averageClassGrade = allGrades.length > 0
        ? Math.round(allGrades.reduce((sum, grade) => sum + grade, 0) / allGrades.length)
        : 0;

      return {
        totalStudents: students.length,
        totalAssignments: assignments.length,
        totalQuizzes: quizzes.length,
        totalTasks: assignments.length + quizzes.length,
        pendingGrading: totalPendingGrading,
        pendingAssignmentGrading,
        pendingQuizGrading,
        totalSubmissions,
        gradedSubmissions: totalGraded,
        averageClassGrade,
        recentSubmissions: recentWithStudents,
        students: students.map(s => ({
          _id: s._id,
          name: `${s.firstName} ${s.lastName}`,
          email: s.email
        }))
      };
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to get teacher statistics'
      };
    }
  }
}

module.exports = DashboardService;
