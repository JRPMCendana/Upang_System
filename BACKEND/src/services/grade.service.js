const Assignment = require('../models/Assignment.model');
const AssignmentSubmission = require('../models/AssignmentSubmission.model');
const Quiz = require('../models/Quiz.model');
const QuizSubmission = require('../models/QuizSubmission.model');
const User = require('../models/User.model');
const DbUtils = require('../utils/db.utils');

class GradeService {

  static async getTeacherGradeStats(teacherId) {
    try {

      const students = await User.find({
        role: 'student',
        assignedTeacher: teacherId
      }).select('_id firstName lastName email');

      const studentIds = students.map(s => s._id);


      const [assignments, quizzes] = await Promise.all([
        Assignment.find({ assignedBy: teacherId }),
        Quiz.find({ assignedBy: teacherId })
      ]);

      const assignmentIds = assignments.map(a => a._id);
      const quizIds = quizzes.map(q => q._id);


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


      const gradedAssignmentSubs = assignmentSubmissions.filter(
        sub => sub.grade !== null && sub.grade !== undefined && sub.isSubmitted
      );
      const gradedQuizSubs = quizSubmissions.filter(
        sub => sub.grade !== null && sub.grade !== undefined && sub.isSubmitted
      );

      // Calculate percentage grades (grade / maxScore * 100)
      // For assignments, assume maxScore of 100 if not specified
      // For quizzes, use totalPoints field
      const percentageGrades = [];
      
      gradedAssignmentSubs.forEach(sub => {
        const assignment = assignments.find(a => a._id.toString() === sub.assignment._id.toString());
        const maxScore = assignment?.totalPoints || 100; // Default to 100 if not set
        const percentage = (sub.grade / maxScore) * 100;
        percentageGrades.push(Math.round(percentage * 10) / 10); // Round to 1 decimal
      });

      gradedQuizSubs.forEach(sub => {
        const quiz = quizzes.find(q => q._id.toString() === sub.quiz._id.toString());
        const maxScore = quiz?.totalPoints || 100; // Default to 100 if not set
        const percentage = (sub.grade / maxScore) * 100;
        percentageGrades.push(Math.round(percentage * 10) / 10); // Round to 1 decimal
      });

      // Calculate class average from percentage grades
      const classAverage = percentageGrades.length > 0
        ? Math.round(percentageGrades.reduce((sum, grade) => sum + grade, 0) / percentageGrades.length)
        : 0;

  
      // Calculate pass rate based on students, not individual submissions
      // Track which students have at least one passing grade (>= 70%)
      const studentPassingStatus = new Map();
      
      // Check assignment submissions for passing grades
      gradedAssignmentSubs.forEach(sub => {
        const assignment = assignments.find(a => a._id.toString() === sub.assignment._id.toString());
        const maxScore = assignment?.totalPoints || 100;
        const percentage = (sub.grade / maxScore) * 100;
        const studentId = sub.student._id.toString();
        
        if (!studentPassingStatus.has(studentId)) {
          studentPassingStatus.set(studentId, { hasPassing: false, hasAnyGrade: false });
        }
        
        const status = studentPassingStatus.get(studentId);
        status.hasAnyGrade = true;
        if (percentage >= 70) {
          status.hasPassing = true;
        }
      });

      // Check quiz submissions for passing grades
      gradedQuizSubs.forEach(sub => {
        const quiz = quizzes.find(q => q._id.toString() === sub.quiz._id.toString());
        const maxScore = quiz?.totalPoints || 100;
        const percentage = (sub.grade / maxScore) * 100;
        const studentId = sub.student._id.toString();
        
        if (!studentPassingStatus.has(studentId)) {
          studentPassingStatus.set(studentId, { hasPassing: false, hasAnyGrade: false });
        }
        
        const status = studentPassingStatus.get(studentId);
        status.hasAnyGrade = true;
        if (percentage >= 70) {
          status.hasPassing = true;
        }
      });

      // Count students with at least one passing grade
      const passingStudentsCount = Array.from(studentPassingStatus.values())
        .filter(status => status.hasPassing).length;
      const totalStudentsWithGrades = Array.from(studentPassingStatus.values())
        .filter(status => status.hasAnyGrade).length;
      
      const passRate = totalStudentsWithGrades > 0
        ? Math.round((passingStudentsCount / totalStudentsWithGrades) * 100)
        : 0;
      const passingStudents = `${passingStudentsCount}/${totalStudentsWithGrades} students`;

  
      const totalSubmissions = assignmentSubmissions.filter(s => s.isSubmitted).length +
                               quizSubmissions.filter(s => s.isSubmitted).length;
      const avgSubmissions = assignments.length > 0
        ? Math.round(totalSubmissions / assignments.length)
        : 0;


      const pendingGrading = assignmentSubmissions.filter(
        s => s.isSubmitted && (s.grade === null || s.grade === undefined)
      ).length + quizSubmissions.filter(
        s => s.isSubmitted && (s.grade === null || s.grade === undefined)
      ).length;

      const gradingStatus = pendingGrading === 0 ? 'All Current' : `${pendingGrading} Pending`;

      // Grade distribution based on percentages (A: 90-100%, B: 80-89%, C: 70-79%, F: <70%)
      const distribution = {
        A: percentageGrades.filter(g => g >= 90 && g <= 100).length,
        B: percentageGrades.filter(g => g >= 80 && g < 90).length,
        C: percentageGrades.filter(g => g >= 70 && g < 80).length,
        F: percentageGrades.filter(g => g < 70).length
      };

      const totalGraded = percentageGrades.length;
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

      const assignmentPerformance = assignments.map(assignment => {
        const subs = assignmentSubmissions.filter(s => 
          s.assignment._id.toString() === assignment._id.toString()
        );
        const gradedSubs = subs.filter(s => s.grade !== null && s.isSubmitted);
        const maxScore = assignment.totalPoints || 100; 
        
        // Calculate percentage grades
        const percentageGrades = gradedSubs.map(s => (s.grade / maxScore) * 100);
        const average = percentageGrades.length > 0
          ? Math.round(percentageGrades.reduce((sum, p) => sum + p, 0) / percentageGrades.length)
          : 0;
        const passed = percentageGrades.filter(p => p >= 70).length;

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
        const maxScore = quiz.totalPoints || 100; // Default to 100 if not set
        
        // Calculate percentage grades
        const percentageGrades = gradedSubs.map(s => (s.grade / maxScore) * 100);
        const average = percentageGrades.length > 0
          ? Math.round(percentageGrades.reduce((sum, p) => sum + p, 0) / percentageGrades.length)
          : 0;
        const passed = percentageGrades.filter(p => p >= 70).length;

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

      // Calculate percentage grades (grade / maxScore * 100)
      const percentageGrades = [];
      
      gradedAssignmentSubs.forEach(sub => {
        const assignment = assignments.find(a => a._id.toString() === sub.assignment._id.toString());
        const maxScore = assignment?.totalPoints || 100; // Default to 100 if not set
        const percentage = (sub.grade / maxScore) * 100;
        percentageGrades.push(Math.round(percentage * 10) / 10); // Round to 1 decimal
      });

      gradedQuizSubs.forEach(sub => {
        const quiz = quizzes.find(q => q._id.toString() === sub.quiz._id.toString());
        const maxScore = quiz?.totalPoints || 100; // Default to 100 if not set
        const percentage = (sub.grade / maxScore) * 100;
        percentageGrades.push(Math.round(percentage * 10) / 10); // Round to 1 decimal
      });

      // Calculate overall average from percentage grades
      const overallAverage = percentageGrades.length > 0
        ? Math.round(percentageGrades.reduce((sum, grade) => sum + grade, 0) / percentageGrades.length)
        : 0;

      // Get highest grade (as percentage)
      const highestGrade = percentageGrades.length > 0 ? Math.max(...percentageGrades) : 0;
      
      // Find highest grade item (using percentage for comparison)
      const allGradeItems = [
        ...gradedAssignmentSubs.map(s => {
          const assignment = assignments.find(a => a._id.toString() === s.assignment._id.toString());
          const maxScore = assignment?.totalPoints || 100;
          const percentage = (s.grade / maxScore) * 100;
          return { grade: Math.round(percentage * 10) / 10, name: s.assignment.title, type: 'assignment' };
        }),
        ...gradedQuizSubs.map(s => {
          const quiz = quizzes.find(q => q._id.toString() === s.quiz._id.toString());
          const maxScore = quiz?.totalPoints || 100;
          const percentage = (s.grade / maxScore) * 100;
          return { grade: Math.round(percentage * 10) / 10, name: s.quiz.title, type: 'quiz' };
        })
      ];
      const highestGradeItem = allGradeItems.find(item => item.grade === highestGrade);

      // Count completed
      const completed = gradedAssignmentSubs.length + gradedQuizSubs.length;
      const total = assignments.length + quizzes.length;

      // Grade trend over time (group by month) - use percentage grades
      const gradeTrend = [];
      const monthlyGrades = new Map();

      [...gradedAssignmentSubs, ...gradedQuizSubs].forEach(sub => {
        const date = new Date(sub.gradedAt || sub.submittedAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        // Calculate percentage for this submission
        let percentage = 0;
        if (sub.assignment) {
          const assignment = assignments.find(a => a._id.toString() === sub.assignment._id.toString());
          const maxScore = assignment?.totalPoints || 100;
          percentage = (sub.grade / maxScore) * 100;
        } else if (sub.quiz) {
          const quiz = quizzes.find(q => q._id.toString() === sub.quiz._id.toString());
          const maxScore = quiz?.totalPoints || 100;
          percentage = (sub.grade / maxScore) * 100;
        }
        
        if (!monthlyGrades.has(monthKey)) {
          monthlyGrades.set(monthKey, []);
        }
        monthlyGrades.get(monthKey).push(Math.round(percentage * 10) / 10);
      });

      monthlyGrades.forEach((grades, month) => {
        const average = Math.round(grades.reduce((sum, g) => sum + g, 0) / grades.length);
        gradeTrend.push({
          month,
          average
        });
      });

      gradeTrend.sort((a, b) => a.month.localeCompare(b.month));

      // Recent grades (last 10) - convert to percentages
      const recentGrades = [
        ...gradedAssignmentSubs.map(s => {
          const assignment = assignments.find(a => a._id.toString() === s.assignment._id.toString());
          const maxScore = assignment?.totalPoints || 100;
          const percentage = Math.round((s.grade / maxScore) * 100);
          return {
            id: s._id.toString(),
            name: s.assignment.title,
            grade: percentage,
            type: 'assignment',
            status: 'submitted',
            date: s.gradedAt || s.submittedAt
          };
        }),
        ...gradedQuizSubs.map(s => {
          const quiz = quizzes.find(q => q._id.toString() === s.quiz._id.toString());
          const maxScore = quiz?.totalPoints || 100;
          const percentage = Math.round((s.grade / maxScore) * 100);
          return {
            id: s._id.toString(),
            name: s.quiz.title,
            grade: percentage,
            type: 'quiz',
            status: 'submitted',
            date: s.gradedAt || s.submittedAt
          };
        })
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

  /**
   * Get detailed grade breakdown for a specific student (for teachers to view)
   */
  static async getStudentGradeDetails(studentId, teacherId) {
    try {
      // Verify student exists and is assigned to this teacher
      const student = await User.findById(studentId);
      if (!student || student.role !== 'student') {
        throw {
          status: 404,
          message: 'Student not found'
        };
      }

      if (!student.assignedTeacher || student.assignedTeacher.toString() !== teacherId) {
        throw {
          status: 403,
          message: 'Access denied. This student is not assigned to you.'
        };
      }

      // Get all assignments and quizzes created by this teacher
      const [assignments, quizzes] = await Promise.all([
        Assignment.find({ assignedBy: teacherId, assignedTo: studentId }),
        Quiz.find({ assignedBy: teacherId, assignedTo: studentId })
      ]);

      const assignmentIds = assignments.map(a => a._id);
      const quizIds = quizzes.map(q => q._id);

      // Get all submissions for this student
      const [assignmentSubmissions, quizSubmissions] = await Promise.all([
        AssignmentSubmission.find({
          assignment: { $in: assignmentIds },
          student: studentId
        }).populate('assignment', 'title dueDate').sort({ createdAt: -1 }),
        QuizSubmission.find({
          quiz: { $in: quizIds },
          student: studentId
        }).populate('quiz', 'title totalPoints').sort({ createdAt: -1 })
      ]);

      // Format assignment grades
      const assignmentGrades = assignmentSubmissions.map(sub => {
        const assignment = assignments.find(a => a._id.toString() === sub.assignment._id.toString());
        const maxScore = assignment?.totalPoints || 100;
        const percentage = sub.grade !== null && sub.grade !== undefined
          ? Math.round((sub.grade / maxScore) * 100)
          : null;
        
        return {
          id: sub._id.toString(),
          type: 'assignment',
          source: sub.assignment.title,
          sourceId: sub.assignment._id.toString(),
          rawGrade: sub.grade,
          maxScore,
          percentage,
          submittedAt: sub.submittedAt,
          gradedAt: sub.gradedAt,
          dueDate: sub.assignment.dueDate,
          isSubmitted: sub.isSubmitted,
          feedback: sub.feedback || null
        };
      });

      // Format quiz grades
      const quizGrades = quizSubmissions.map(sub => {
        const quiz = quizzes.find(q => q._id.toString() === sub.quiz._id.toString());
        const maxScore = quiz?.totalPoints || 100;
        const percentage = sub.grade !== null && sub.grade !== undefined
          ? Math.round((sub.grade / maxScore) * 100)
          : null;
        
        return {
          id: sub._id.toString(),
          type: 'quiz',
          source: sub.quiz.title,
          sourceId: sub.quiz._id.toString(),
          rawGrade: sub.grade,
          maxScore,
          percentage,
          submittedAt: sub.submittedAt,
          gradedAt: sub.gradedAt,
          dueDate: null,
          isSubmitted: sub.isSubmitted,
          feedback: sub.feedback || null
        };
      });

      // Combine all grades and sort by date
      const allGrades = [...assignmentGrades, ...quizGrades].sort((a, b) => {
        const dateA = a.gradedAt || a.submittedAt || new Date(0);
        const dateB = b.gradedAt || b.submittedAt || new Date(0);
        return new Date(dateB) - new Date(dateA);
      });

      // Calculate statistics
      const gradedItems = allGrades.filter(g => g.percentage !== null);
      const overallAverage = gradedItems.length > 0
        ? Math.round(gradedItems.reduce((sum, g) => sum + g.percentage, 0) / gradedItems.length)
        : 0;

      // Group by type
      const byType = {
        assignments: assignmentGrades,
        quizzes: quizGrades
      };

      return {
        student: {
          id: student._id.toString(),
          username: student.username,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email
        },
        overallAverage,
        totalItems: allGrades.length,
        gradedItems: gradedItems.length,
        pendingItems: allGrades.filter(g => g.isSubmitted && g.percentage === null).length,
        byType,
        allGrades
      };
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to get student grade details'
      };
    }
  }
}

module.exports = GradeService;

