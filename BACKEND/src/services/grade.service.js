const Assignment = require('../models/Assignment.model');
const AssignmentSubmission = require('../models/AssignmentSubmission.model');
const Quiz = require('../models/Quiz.model');
const QuizSubmission = require('../models/QuizSubmission.model');
const User = require('../models/User.model');
const DbUtils = require('../utils/db.utils');

class GradeService {
  /**
   * Get grade statistics for a teacher's class
   * Aggregates data from all assignments and quizzes
   */
  static async getTeacherGradeStats(teacherId) {
    try {
      // Get all students assigned to this teacher
      const students = await User.find({
        role: 'student',
        assignedTeacher: teacherId
      }).select('_id firstName lastName email');

      const studentIds = students.map(s => s._id);

      // Get all assignments and quizzes created by this teacher
      const [assignments, quizzes] = await Promise.all([
        Assignment.find({ assignedBy: teacherId }),
        Quiz.find({ assignedBy: teacherId })
      ]);

      const assignmentIds = assignments.map(a => a._id);
      const quizIds = quizzes.map(q => q._id);

      // Get all submissions
      const [assignmentSubmissions, quizSubmissions] = await Promise.all([
        AssignmentSubmission.find({
          assignment: { $in: assignmentIds },
          student: { $in: studentIds }
        }).populate('assignment', 'title dueDate').populate('student', 'firstName lastName email'),
        QuizSubmission.find({
          quiz: { $in: quizIds },
          student: { $in: studentIds }
        }).populate('quiz', 'title').populate('student', 'firstName lastName email')
      ]);

      // Collect all graded submissions
      const gradedAssignmentSubs = assignmentSubmissions.filter(
        sub => sub.grade !== null && sub.grade !== undefined && sub.isSubmitted
      );
      const gradedQuizSubs = quizSubmissions.filter(
        sub => sub.grade !== null && sub.grade !== undefined && sub.isSubmitted
      );

      // Calculate class average (from all graded submissions)
      const allGrades = [
        ...gradedAssignmentSubs.map(s => s.grade),
        ...gradedQuizSubs.map(s => s.grade)
      ];

      const classAverage = allGrades.length > 0
        ? Math.round(allGrades.reduce((sum, grade) => sum + grade, 0) / allGrades.length)
        : 0;

      // Calculate pass rate (>= 70 is passing)
      const passingCount = allGrades.filter(g => g >= 70).length;
      const passRate = allGrades.length > 0
        ? Math.round((passingCount / allGrades.length) * 100)
        : 0;
      const passingStudents = `${passingCount}/${allGrades.length} students`;

      // Calculate average submissions per assignment
      const totalSubmissions = assignmentSubmissions.filter(s => s.isSubmitted).length +
                               quizSubmissions.filter(s => s.isSubmitted).length;
      const avgSubmissions = assignments.length > 0
        ? Math.round(totalSubmissions / assignments.length)
        : 0;

      // Check grading status
      const pendingGrading = assignmentSubmissions.filter(
        s => s.isSubmitted && (s.grade === null || s.grade === undefined)
      ).length + quizSubmissions.filter(
        s => s.isSubmitted && (s.grade === null || s.grade === undefined)
      ).length;

      const gradingStatus = pendingGrading === 0 ? 'All Current' : `${pendingGrading} Pending`;

      // Grade distribution (A: 90-100, B: 80-89, C: 70-79, F: <70)
      const distribution = {
        A: allGrades.filter(g => g >= 90 && g <= 100).length,
        B: allGrades.filter(g => g >= 80 && g < 90).length,
        C: allGrades.filter(g => g >= 70 && g < 80).length,
        F: allGrades.filter(g => g < 70).length
      };

      const totalGraded = allGrades.length;
      const gradeDistribution = [
        {
          name: 'A (90-100)',
          value: totalGraded > 0 ? Math.round((distribution.A / totalGraded) * 100) : 0,
          color: '#10b981',
          count: distribution.A
        },
        {
          name: 'B (80-89)',
          value: totalGraded > 0 ? Math.round((distribution.B / totalGraded) * 100) : 0,
          color: '#f59e0b',
          count: distribution.B
        },
        {
          name: 'C (70-79)',
          value: totalGraded > 0 ? Math.round((distribution.C / totalGraded) * 100) : 0,
          color: '#f97316',
          count: distribution.C
        },
        {
          name: 'F (Below 70)',
          value: totalGraded > 0 ? Math.round((distribution.F / totalGraded) * 100) : 0,
          color: '#ef4444',
          count: distribution.F
        }
      ];

      // Performance by Assignment/Quiz
      const assignmentPerformance = assignments.map(assignment => {
        const subs = assignmentSubmissions.filter(s => 
          s.assignment._id.toString() === assignment._id.toString()
        );
        const gradedSubs = subs.filter(s => s.grade !== null && s.isSubmitted);
        const average = gradedSubs.length > 0
          ? Math.round(gradedSubs.reduce((sum, s) => sum + s.grade, 0) / gradedSubs.length)
          : 0;
        const passed = gradedSubs.filter(s => s.grade >= 70).length;

        return {
          name: assignment.title,
          type: 'assignment',
          average,
          passed,
          total: gradedSubs.length
        };
      });

      const quizPerformance = quizzes.map(quiz => {
        const subs = quizSubmissions.filter(s => 
          s.quiz._id.toString() === quiz._id.toString()
        );
        const gradedSubs = subs.filter(s => s.grade !== null && s.isSubmitted);
        const average = gradedSubs.length > 0
          ? Math.round(gradedSubs.reduce((sum, s) => sum + s.grade, 0) / gradedSubs.length)
          : 0;
        const passed = gradedSubs.filter(s => s.grade >= 70).length;

        return {
          name: quiz.title,
          type: 'quiz',
          average,
          passed,
          total: gradedSubs.length
        };
      });

      // Combine and limit to top 10
      const performanceByTask = [...assignmentPerformance, ...quizPerformance]
        .sort((a, b) => b.average - a.average)
        .slice(0, 10);

      return {
        classAverage,
        passRate,
        passingStudents,
        avgSubmissions,
        gradingStatus,
        pendingGrading,
        gradeDistribution,
        performanceByTask,
        totalStudents: students.length,
        totalAssignments: assignments.length,
        totalQuizzes: quizzes.length,
        totalGraded: totalGraded
      };
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to get teacher grade statistics'
      };
    }
  }

  /**
   * Get grade statistics for a student
   */
  static async getStudentGradeStats(studentId) {
    try {
      // Get all assignments and quizzes assigned to student
      const [assignments, quizzes] = await Promise.all([
        Assignment.find({ assignedTo: studentId }),
        Quiz.find({ assignedTo: studentId })
      ]);

      const assignmentIds = assignments.map(a => a._id);
      const quizIds = quizzes.map(q => q._id);

      // Get all submissions
      const [assignmentSubmissions, quizSubmissions] = await Promise.all([
        AssignmentSubmission.find({
          student: studentId,
          assignment: { $in: assignmentIds }
        }).populate('assignment', 'title dueDate'),
        QuizSubmission.find({
          student: studentId,
          quiz: { $in: quizIds }
        }).populate('quiz', 'title')
      ]);

      // Get graded submissions
      const gradedAssignmentSubs = assignmentSubmissions.filter(
        sub => sub.grade !== null && sub.grade !== undefined && sub.isSubmitted
      );
      const gradedQuizSubs = quizSubmissions.filter(
        sub => sub.grade !== null && sub.grade !== undefined && sub.isSubmitted
      );

      // Calculate overall average
      const allGrades = [
        ...gradedAssignmentSubs.map(s => s.grade),
        ...gradedQuizSubs.map(s => s.grade)
      ];

      const overallAverage = allGrades.length > 0
        ? Math.round(allGrades.reduce((sum, grade) => sum + grade, 0) / allGrades.length)
        : 0;

      // Get highest grade
      const highestGrade = allGrades.length > 0 ? Math.max(...allGrades) : 0;
      const highestGradeItem = [
        ...gradedAssignmentSubs.map(s => ({ grade: s.grade, name: s.assignment.title, type: 'assignment' })),
        ...gradedQuizSubs.map(s => ({ grade: s.grade, name: s.quiz.title, type: 'quiz' }))
      ].find(item => item.grade === highestGrade);

      // Count completed
      const completed = gradedAssignmentSubs.length + gradedQuizSubs.length;
      const total = assignments.length + quizzes.length;

      // Grade trend over time (group by month)
      const gradeTrend = [];
      const monthlyGrades = new Map();

      [...gradedAssignmentSubs, ...gradedQuizSubs].forEach(sub => {
        const date = new Date(sub.gradedAt || sub.submittedAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyGrades.has(monthKey)) {
          monthlyGrades.set(monthKey, []);
        }
        monthlyGrades.get(monthKey).push(sub.grade);
      });

      monthlyGrades.forEach((grades, month) => {
        const average = Math.round(grades.reduce((sum, g) => sum + g, 0) / grades.length);
        gradeTrend.push({
          month,
          average
        });
      });

      gradeTrend.sort((a, b) => a.month.localeCompare(b.month));

      // Recent grades (last 10)
      const recentGrades = [
        ...gradedAssignmentSubs.map(s => ({
          id: s._id.toString(),
          name: s.assignment.title,
          grade: s.grade,
          type: 'assignment',
          status: 'submitted',
          date: s.gradedAt || s.submittedAt
        })),
        ...gradedQuizSubs.map(s => ({
          id: s._id.toString(),
          name: s.quiz.title,
          grade: s.grade,
          type: 'quiz',
          status: 'submitted',
          date: s.gradedAt || s.submittedAt
        }))
      ]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

      // Pending assignments/quizzes
      const pendingTasks = [
        ...assignments.filter(a => {
          const sub = assignmentSubmissions.find(s => 
            s.assignment._id.toString() === a._id.toString()
          );
          return !sub || !sub.isSubmitted;
        }).map(a => ({
          id: a._id.toString(),
          name: a.title,
          grade: null,
          type: 'assignment',
          status: 'pending',
          date: a.dueDate
        })),
        ...quizzes.filter(q => {
          const sub = quizSubmissions.find(s => 
            s.quiz._id.toString() === q._id.toString()
          );
          return !sub || !sub.isSubmitted;
        }).map(q => ({
          id: q._id.toString(),
          name: q.title,
          grade: null,
          type: 'quiz',
          status: 'pending',
          date: null
        }))
      ];

      return {
        overallAverage,
        highestGrade,
        highestGradeItem: highestGradeItem ? highestGradeItem.name : null,
        completed,
        total,
        gradeTrend,
        recentGrades,
        pendingTasks
      };
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to get student grade statistics'
      };
    }
  }
}

module.exports = GradeService;

