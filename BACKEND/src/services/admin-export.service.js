const User = require('../models/User.model');
const Assignment = require('../models/Assignment.model');
const Quiz = require('../models/Quiz.model');
const Exam = require('../models/Exam.model');
const AssignmentSubmission = require('../models/AssignmentSubmission.model');
const QuizSubmission = require('../models/QuizSubmission.model');
const ExamSubmission = require('../models/ExamSubmission.model');
const DbUtils = require('../utils/db.utils');

class AdminExportService {
  /**
   * Export all users to CSV
   * @returns {string} CSV string
   */
  static async exportUsersCSV() {
    try {
      const users = await User.find()
        .populate('assignedTeacher', 'firstName lastName email')
        .select('-password')
        .sort({ createdAt: -1 })
        .lean();

      // CSV Headers
      let csv = 'ID,Username,Email,First Name,Last Name,Role,Status,Assigned Teacher,Created At\n';

      // Add data rows
      users.forEach(user => {
        const assignedTeacher = user.assignedTeacher 
          ? `${user.assignedTeacher.firstName} ${user.assignedTeacher.lastName} (${user.assignedTeacher.email})`
          : 'N/A';

        csv += `"${user._id}",`;
        csv += `"${this.escapeCSV(user.username)}",`;
        csv += `"${this.escapeCSV(user.email)}",`;
        csv += `"${this.escapeCSV(user.firstName || '')}",`;
        csv += `"${this.escapeCSV(user.lastName || '')}",`;
        csv += `"${user.role}",`;
        csv += `"${user.status || 'active'}",`;
        csv += `"${this.escapeCSV(assignedTeacher)}",`;
        csv += `"${new Date(user.createdAt).toLocaleString()}"\n`;
      });

      return csv;
    } catch (error) {
      console.error('Error in AdminExportService.exportUsersCSV:', error);
      throw DbUtils.handleError(error);
    }
  }

  /**
   * Export all assignments to CSV
   * @returns {string} CSV string
   */
  static async exportAssignmentsCSV() {
    try {
      const assignments = await Assignment.find()
        .populate('assignedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .lean();

      // CSV Headers
      let csv = 'ID,Title,Description,Assigned By,Due Date,Max Grade,Created At,Status\n';

      // Add data rows
      assignments.forEach(assignment => {
        const assignedBy = assignment.assignedBy
          ? `${assignment.assignedBy.firstName} ${assignment.assignedBy.lastName} (${assignment.assignedBy.email})`
          : 'Unknown';

        csv += `"${assignment._id}",`;
        csv += `"${this.escapeCSV(assignment.title)}",`;
        csv += `"${this.escapeCSV(assignment.description || '')}",`;
        csv += `"${this.escapeCSV(assignedBy)}",`;
        csv += `"${assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : 'N/A'}",`;
        csv += `"${assignment.maxGrade || 100}",`;
        csv += `"${new Date(assignment.createdAt).toLocaleString()}",`;
        csv += `"${assignment.status || 'active'}"\n`;
      });

      return csv;
    } catch (error) {
      console.error('Error in AdminExportService.exportAssignmentsCSV:', error);
      throw DbUtils.handleError(error);
    }
  }

  /**
   * Export all quizzes to CSV
   * @returns {string} CSV string
   */
  static async exportQuizzesCSV() {
    try {
      const quizzes = await Quiz.find()
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .lean();

      // CSV Headers
      let csv = 'ID,Title,Description,Created By,Time Limit (min),Total Points,Questions Count,Created At\n';

      // Add data rows
      quizzes.forEach(quiz => {
        const createdBy = quiz.createdBy
          ? `${quiz.createdBy.firstName} ${quiz.createdBy.lastName} (${quiz.createdBy.email})`
          : 'Unknown';

        csv += `"${quiz._id}",`;
        csv += `"${this.escapeCSV(quiz.title)}",`;
        csv += `"${this.escapeCSV(quiz.description || '')}",`;
        csv += `"${this.escapeCSV(createdBy)}",`;
        csv += `"${quiz.timeLimit || 'N/A'}",`;
        csv += `"${quiz.totalPoints || 0}",`;
        csv += `"${quiz.questions?.length || 0}",`;
        csv += `"${new Date(quiz.createdAt).toLocaleString()}"\n`;
      });

      return csv;
    } catch (error) {
      console.error('Error in AdminExportService.exportQuizzesCSV:', error);
      throw DbUtils.handleError(error);
    }
  }

  /**
   * Export all exams to CSV
   * @returns {string} CSV string
   */
  static async exportExamsCSV() {
    try {
      const exams = await Exam.find()
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .lean();

      // CSV Headers
      let csv = 'ID,Title,Description,Created By,Time Limit (min),Total Points,Questions Count,Start Date,End Date,Created At\n';

      // Add data rows
      exams.forEach(exam => {
        const createdBy = exam.createdBy
          ? `${exam.createdBy.firstName} ${exam.createdBy.lastName} (${exam.createdBy.email})`
          : 'Unknown';

        csv += `"${exam._id}",`;
        csv += `"${this.escapeCSV(exam.title)}",`;
        csv += `"${this.escapeCSV(exam.description || '')}",`;
        csv += `"${this.escapeCSV(createdBy)}",`;
        csv += `"${exam.timeLimit || 'N/A'}",`;
        csv += `"${exam.totalPoints || 0}",`;
        csv += `"${exam.questions?.length || 0}",`;
        csv += `"${exam.startDate ? new Date(exam.startDate).toLocaleString() : 'N/A'}",`;
        csv += `"${exam.endDate ? new Date(exam.endDate).toLocaleString() : 'N/A'}",`;
        csv += `"${new Date(exam.createdAt).toLocaleString()}"\n`;
      });

      return csv;
    } catch (error) {
      console.error('Error in AdminExportService.exportExamsCSV:', error);
      throw DbUtils.handleError(error);
    }
  }

  /**
   * Export all assignment submissions to CSV
   * @returns {string} CSV string
   */
  static async exportAssignmentSubmissionsCSV() {
    try {
      const submissions = await AssignmentSubmission.find({ isSubmitted: true })
        .populate('student', 'firstName lastName email username')
        .populate({
          path: 'assignment',
          select: 'title dueDate maxGrade',
          populate: {
            path: 'assignedBy',
            select: 'firstName lastName email'
          }
        })
        .sort({ submittedAt: -1 })
        .lean();

      // CSV Headers
      let csv = 'Submission ID,Assignment Title,Student Name,Student Email,Submitted At,Due Date,Status,Grade,Max Grade,Percentage,Feedback,Graded At,Teacher\n';

      // Add data rows
      submissions.forEach(sub => {
        const studentName = sub.student 
          ? `${sub.student.firstName} ${sub.student.lastName}`
          : 'Unknown Student';
        
        const studentEmail = sub.student?.email || 'N/A';
        
        const assignmentTitle = sub.assignment?.title || 'Unknown Assignment';
        
        const teacher = sub.assignment?.assignedBy
          ? `${sub.assignment.assignedBy.firstName} ${sub.assignment.assignedBy.lastName}`
          : 'Unknown';

        const maxGrade = sub.assignment?.maxGrade || 100;
        const percentage = sub.grade !== null && sub.grade !== undefined
          ? ((sub.grade / maxGrade) * 100).toFixed(2) + '%'
          : 'N/A';

        const status = sub.status || (sub.grade !== null ? 'graded' : 'pending');

        csv += `"${sub._id}",`;
        csv += `"${this.escapeCSV(assignmentTitle)}",`;
        csv += `"${this.escapeCSV(studentName)}",`;
        csv += `"${this.escapeCSV(studentEmail)}",`;
        csv += `"${new Date(sub.submittedAt).toLocaleString()}",`;
        csv += `"${sub.assignment?.dueDate ? new Date(sub.assignment.dueDate).toLocaleString() : 'N/A'}",`;
        csv += `"${status}",`;
        csv += `"${sub.grade !== null && sub.grade !== undefined ? sub.grade : 'Not Graded'}",`;
        csv += `"${maxGrade}",`;
        csv += `"${percentage}",`;
        csv += `"${this.escapeCSV(sub.feedback || 'No feedback')}",`;
        csv += `"${sub.gradedAt ? new Date(sub.gradedAt).toLocaleString() : 'Not graded yet'}",`;
        csv += `"${this.escapeCSV(teacher)}"\n`;
      });

      return csv;
    } catch (error) {
      console.error('Error in AdminExportService.exportAssignmentSubmissionsCSV:', error);
      throw DbUtils.handleError(error);
    }
  }

  /**
   * Export all quiz submissions to CSV
   * @returns {string} CSV string
   */
  static async exportQuizSubmissionsCSV() {
    try {
      const submissions = await QuizSubmission.find({ isSubmitted: true })
        .populate('student', 'firstName lastName email username')
        .populate({
          path: 'quiz',
          select: 'title totalPoints',
          populate: {
            path: 'createdBy',
            select: 'firstName lastName email'
          }
        })
        .sort({ submittedAt: -1 })
        .lean();

      // CSV Headers
      let csv = 'Submission ID,Quiz Title,Student Name,Student Email,Submitted At,Status,Grade,Total Points,Percentage,Time Taken (min),Teacher\n';

      // Add data rows
      submissions.forEach(sub => {
        const studentName = sub.student 
          ? `${sub.student.firstName} ${sub.student.lastName}`
          : 'Unknown Student';
        
        const studentEmail = sub.student?.email || 'N/A';
        
        const quizTitle = sub.quiz?.title || 'Unknown Quiz';
        
        const teacher = sub.quiz?.createdBy
          ? `${sub.quiz.createdBy.firstName} ${sub.quiz.createdBy.lastName}`
          : 'Unknown';

        const totalPoints = sub.quiz?.totalPoints || 100;
        const percentage = sub.grade !== null && sub.grade !== undefined
          ? ((sub.grade / totalPoints) * 100).toFixed(2) + '%'
          : 'N/A';

        const status = sub.status || (sub.grade !== null ? 'graded' : 'pending');

        const timeTaken = sub.timeTaken 
          ? (sub.timeTaken / 60).toFixed(2)
          : 'N/A';

        csv += `"${sub._id}",`;
        csv += `"${this.escapeCSV(quizTitle)}",`;
        csv += `"${this.escapeCSV(studentName)}",`;
        csv += `"${this.escapeCSV(studentEmail)}",`;
        csv += `"${new Date(sub.submittedAt).toLocaleString()}",`;
        csv += `"${status}",`;
        csv += `"${sub.grade !== null && sub.grade !== undefined ? sub.grade : 'Not Graded'}",`;
        csv += `"${totalPoints}",`;
        csv += `"${percentage}",`;
        csv += `"${timeTaken}",`;
        csv += `"${this.escapeCSV(teacher)}"\n`;
      });

      return csv;
    } catch (error) {
      console.error('Error in AdminExportService.exportQuizSubmissionsCSV:', error);
      throw DbUtils.handleError(error);
    }
  }

  /**
   * Export all exam submissions to CSV
   * @returns {string} CSV string
   */
  static async exportExamSubmissionsCSV() {
    try {
      const submissions = await ExamSubmission.find({ isSubmitted: true })
        .populate('student', 'firstName lastName email username')
        .populate({
          path: 'exam',
          select: 'title totalPoints',
          populate: {
            path: 'createdBy',
            select: 'firstName lastName email'
          }
        })
        .sort({ submittedAt: -1 })
        .lean();

      // CSV Headers
      let csv = 'Submission ID,Exam Title,Student Name,Student Email,Submitted At,Status,Grade,Total Points,Percentage,Time Taken (min),Teacher\n';

      // Add data rows
      submissions.forEach(sub => {
        const studentName = sub.student 
          ? `${sub.student.firstName} ${sub.student.lastName}`
          : 'Unknown Student';
        
        const studentEmail = sub.student?.email || 'N/A';
        
        const examTitle = sub.exam?.title || 'Unknown Exam';
        
        const teacher = sub.exam?.createdBy
          ? `${sub.exam.createdBy.firstName} ${sub.exam.createdBy.lastName}`
          : 'Unknown';

        const totalPoints = sub.exam?.totalPoints || 100;
        const percentage = sub.grade !== null && sub.grade !== undefined
          ? ((sub.grade / totalPoints) * 100).toFixed(2) + '%'
          : 'N/A';

        const status = sub.status || (sub.grade !== null ? 'graded' : 'pending');

        const timeTaken = sub.timeTaken 
          ? (sub.timeTaken / 60).toFixed(2)
          : 'N/A';

        csv += `"${sub._id}",`;
        csv += `"${this.escapeCSV(examTitle)}",`;
        csv += `"${this.escapeCSV(studentName)}",`;
        csv += `"${this.escapeCSV(studentEmail)}",`;
        csv += `"${new Date(sub.submittedAt).toLocaleString()}",`;
        csv += `"${status}",`;
        csv += `"${sub.grade !== null && sub.grade !== undefined ? sub.grade : 'Not Graded'}",`;
        csv += `"${totalPoints}",`;
        csv += `"${percentage}",`;
        csv += `"${timeTaken}",`;
        csv += `"${this.escapeCSV(teacher)}"\n`;
      });

      return csv;
    } catch (error) {
      console.error('Error in AdminExportService.exportExamSubmissionsCSV:', error);
      throw DbUtils.handleError(error);
    }
  }

  /**
   * Export comprehensive student grades report
   * @returns {string} CSV string
   */
  static async exportStudentGradesCSV() {
    try {
      const students = await User.find({ role: 'student' })
        .populate('assignedTeacher', 'firstName lastName email')
        .sort({ lastName: 1, firstName: 1 })
        .lean();

      // CSV Headers
      let csv = 'Student ID,Student Name,Email,Assigned Teacher,Quiz Average,Assignment Average,Exam Average,Class Standing,Final Grade,Quiz Count,Assignment Count,Exam Count\n';

      // Process each student
      for (const student of students) {
        const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
        const teacherName = student.assignedTeacher
          ? `${student.assignedTeacher.firstName} ${student.assignedTeacher.lastName}`
          : 'Not Assigned';

        // Get all graded submissions for this student
        const [quizSubs, assignmentSubs, examSubs] = await Promise.all([
          QuizSubmission.find({
            student: student._id,
            grade: { $ne: null },
            status: 'graded'
          }).populate('quiz', 'totalPoints').lean(),
          
          AssignmentSubmission.find({
            student: student._id,
            grade: { $ne: null },
            status: 'graded'
          }).populate('assignment', 'maxGrade').lean(),
          
          ExamSubmission.find({
            student: student._id,
            grade: { $ne: null },
            status: 'graded'
          }).populate('exam', 'totalPoints').lean()
        ]);

        // Calculate quiz average percentage
        let quizAverage = 0;
        if (quizSubs.length > 0) {
          const quizPercentages = quizSubs.map(sub => {
            const totalPoints = sub.quiz?.totalPoints || 100;
            return (sub.grade / totalPoints) * 100;
          });
          quizAverage = quizPercentages.reduce((a, b) => a + b, 0) / quizPercentages.length;
        }

        // Calculate assignment average percentage
        let assignmentAverage = 0;
        if (assignmentSubs.length > 0) {
          const assignmentPercentages = assignmentSubs.map(sub => {
            const maxGrade = sub.assignment?.maxGrade || 100;
            return (sub.grade / maxGrade) * 100;
          });
          assignmentAverage = assignmentPercentages.reduce((a, b) => a + b, 0) / assignmentPercentages.length;
        }

        // Calculate exam average percentage
        let examAverage = 0;
        if (examSubs.length > 0) {
          const examPercentages = examSubs.map(sub => {
            const totalPoints = sub.exam?.totalPoints || 100;
            return (sub.grade / totalPoints) * 100;
          });
          examAverage = examPercentages.reduce((a, b) => a + b, 0) / examPercentages.length;
        }

        // Calculate Class Standing and Final Grade using the correct formula
        // Class Standing = (Quiz × 0.45) + (Assignment × 0.15)
        // Final Grade = (Class Standing × 0.60) + (Exam × 0.40)
        const classStanding = (quizAverage * 0.45) + (assignmentAverage * 0.15);
        const finalGrade = (classStanding * 0.60) + (examAverage * 0.40);

        csv += `"${student._id}",`;
        csv += `"${this.escapeCSV(studentName)}",`;
        csv += `"${this.escapeCSV(student.email)}",`;
        csv += `"${this.escapeCSV(teacherName)}",`;
        csv += `"${quizAverage.toFixed(2)}%",`;
        csv += `"${assignmentAverage.toFixed(2)}%",`;
        csv += `"${examAverage.toFixed(2)}%",`;
        csv += `"${classStanding.toFixed(2)}%",`;
        csv += `"${finalGrade.toFixed(2)}%",`;
        csv += `"${quizSubs.length}",`;
        csv += `"${assignmentSubs.length}",`;
        csv += `"${examSubs.length}"\n`;
      }

      return csv;
    } catch (error) {
      console.error('Error in AdminExportService.exportStudentGradesCSV:', error);
      throw DbUtils.handleError(error);
    }
  }

  /**
   * Export system statistics summary to CSV
   * @returns {string} CSV string
   */
  static async exportSystemStatisticsCSV() {
    try {
      // Get counts
      const [
        totalUsers,
        totalStudents,
        totalTeachers,
        totalAdmins,
        totalAssignments,
        totalQuizzes,
        totalExams,
        totalAssignmentSubmissions,
        totalQuizSubmissions,
        totalExamSubmissions
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'teacher' }),
        User.countDocuments({ role: 'administrator' }),
        Assignment.countDocuments(),
        Quiz.countDocuments(),
        Exam.countDocuments(),
        AssignmentSubmission.countDocuments({ isSubmitted: true }),
        QuizSubmission.countDocuments({ isSubmitted: true }),
        ExamSubmission.countDocuments({ isSubmitted: true })
      ]);

      // CSV Headers
      let csv = 'Metric,Count\n';
      
      // Add data rows
      csv += `"Total Users","${totalUsers}"\n`;
      csv += `"Total Students","${totalStudents}"\n`;
      csv += `"Total Teachers","${totalTeachers}"\n`;
      csv += `"Total Administrators","${totalAdmins}"\n`;
      csv += `"Total Assignments","${totalAssignments}"\n`;
      csv += `"Total Quizzes","${totalQuizzes}"\n`;
      csv += `"Total Exams","${totalExams}"\n`;
      csv += `"Total Assignment Submissions","${totalAssignmentSubmissions}"\n`;
      csv += `"Total Quiz Submissions","${totalQuizSubmissions}"\n`;
      csv += `"Total Exam Submissions","${totalExamSubmissions}"\n`;
      csv += `"Total Submissions","${totalAssignmentSubmissions + totalQuizSubmissions + totalExamSubmissions}"\n`;
      csv += `"Report Generated","${new Date().toLocaleString()}"\n`;

      return csv;
    } catch (error) {
      console.error('Error in AdminExportService.exportSystemStatisticsCSV:', error);
      throw DbUtils.handleError(error);
    }
  }

  /**
   * Export teacher activity summary to CSV
   * @returns {string} CSV string
   */
  static async exportTeacherActivityCSV() {
    try {
      const teachers = await User.find({ role: 'teacher' })
        .sort({ lastName: 1, firstName: 1 })
        .lean();

      // CSV Headers
      let csv = 'Teacher ID,Teacher Name,Email,Assigned Students,Assignments Created,Quizzes Created,Exams Created,Total Content,Total Submissions Graded\n';

      // Process each teacher
      for (const teacher of teachers) {
        const teacherName = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();

        // Get counts
        const [
          assignedStudents,
          assignmentsCreated,
          quizzesCreated,
          examsCreated,
          assignmentSubmissionsGraded,
          quizSubmissionsGraded,
          examSubmissionsGraded
        ] = await Promise.all([
          User.countDocuments({ assignedTeacher: teacher._id, role: 'student' }),
          Assignment.countDocuments({ assignedBy: teacher._id }),
          Quiz.countDocuments({ createdBy: teacher._id }),
          Exam.countDocuments({ createdBy: teacher._id }),
          AssignmentSubmission.countDocuments({
            assignment: { $in: await Assignment.find({ assignedBy: teacher._id }).distinct('_id') },
            status: 'graded'
          }),
          QuizSubmission.countDocuments({
            quiz: { $in: await Quiz.find({ createdBy: teacher._id }).distinct('_id') },
            status: 'graded'
          }),
          ExamSubmission.countDocuments({
            exam: { $in: await Exam.find({ createdBy: teacher._id }).distinct('_id') },
            status: 'graded'
          })
        ]);

        const totalContent = assignmentsCreated + quizzesCreated + examsCreated;
        const totalGraded = assignmentSubmissionsGraded + quizSubmissionsGraded + examSubmissionsGraded;

        csv += `"${teacher._id}",`;
        csv += `"${this.escapeCSV(teacherName)}",`;
        csv += `"${this.escapeCSV(teacher.email)}",`;
        csv += `"${assignedStudents}",`;
        csv += `"${assignmentsCreated}",`;
        csv += `"${quizzesCreated}",`;
        csv += `"${examsCreated}",`;
        csv += `"${totalContent}",`;
        csv += `"${totalGraded}"\n`;
      }

      return csv;
    } catch (error) {
      console.error('Error in AdminExportService.exportTeacherActivityCSV:', error);
      throw DbUtils.handleError(error);
    }
  }

  /**
   * KPI #1: Export average quiz score per topic/module
   * Single CSV file with all quiz topics and their average scores
   * @returns {string} CSV string
   */
  static async exportKPI_QuizPerformanceByTopicCSV() {
    try {
      const quizzes = await Quiz.find()
        .populate('assignedBy', 'firstName lastName email')
        .sort({ title: 1 })
        .lean();

      // CSV Headers - optimized for direct charting
      let csv = 'Quiz/Topic,Average Score (%),Submission Count,Total Points,Teacher Name,Teacher Email\n';

      for (const quiz of quizzes) {
        const submissions = await QuizSubmission.find({
          quiz: quiz._id,
          grade: { $ne: null },
          status: 'graded'
        }).lean();

        if (submissions.length > 0) {
          // Calculate average percentage score
          const avgPercentage = submissions.reduce((sum, sub) => {
            return sum + ((sub.grade / quiz.totalPoints) * 100);
          }, 0) / submissions.length;

          const teacherName = quiz.assignedBy 
            ? `${quiz.assignedBy.firstName} ${quiz.assignedBy.lastName}`
            : 'Unknown';
          const teacherEmail = quiz.assignedBy?.email || 'N/A';

          csv += `"${this.escapeCSV(quiz.title)}",`;
          csv += `${avgPercentage.toFixed(2)},`;
          csv += `${submissions.length},`;
          csv += `${quiz.totalPoints},`;
          csv += `"${this.escapeCSV(teacherName)}",`;
          csv += `"${this.escapeCSV(teacherEmail)}"\n`;
        } else {
          // Include quizzes with no submissions
          const teacherName = quiz.assignedBy 
            ? `${quiz.assignedBy.firstName} ${quiz.assignedBy.lastName}`
            : 'Unknown';
          const teacherEmail = quiz.assignedBy?.email || 'N/A';

          csv += `"${this.escapeCSV(quiz.title)}",`;
          csv += `0,`;
          csv += `0,`;
          csv += `${quiz.totalPoints},`;
          csv += `"${this.escapeCSV(teacherName)}",`;
          csv += `"${this.escapeCSV(teacherEmail)}"\n`;
        }
      }

      return csv;
    } catch (error) {
      console.error('Error in AdminExportService.exportKPI_QuizPerformanceByTopicCSV:', error);
      throw DbUtils.handleError(error);
    }
  }

  /**
   * KPI #2: Export assignment submission timeliness (on-time vs late)
   * Single CSV file with all data needed for doughnut chart
   * @returns {string} CSV string
   */
  static async exportKPI_SubmissionTimelinessCSV() {
    try {
      // Get all assignments with due dates, including assignedTo array
      const assignments = await Assignment.find({ dueDate: { $ne: null } })
        .select('_id assignedTo')
        .lean();

      const assignmentIds = assignments.map(a => a._id);

      // Calculate expected submissions: sum of all students assigned to each assignment
      let expectedSubmissions = 0;
      assignments.forEach(assignment => {
        if (assignment.assignedTo && Array.isArray(assignment.assignedTo)) {
          expectedSubmissions += assignment.assignedTo.length;
        }
      });

      // Get all submissions for these assignments
      const submissions = await AssignmentSubmission.find({
        assignment: { $in: assignmentIds },
        isSubmitted: true
      })
        .populate('assignment', 'dueDate')
        .lean();

      // Calculate totals
      let onTime = 0;
      let late = 0;

      submissions.forEach(sub => {
        if (sub.assignment?.dueDate) {
          const submittedDate = new Date(sub.submittedAt);
          const dueDate = new Date(sub.assignment.dueDate);
          
          if (submittedDate <= dueDate) {
            onTime++;
          } else {
            late++;
          }
        }
      });

      // Calculate not submitted: expected - (onTime + late)
      const submittedCount = onTime + late;
      const notSubmitted = Math.max(0, expectedSubmissions - submittedCount);

      const total = expectedSubmissions; // Total should be expected submissions

      // Calculate percentages
      const onTimePercentage = total > 0 ? ((onTime / total) * 100).toFixed(2) : 0;
      const latePercentage = total > 0 ? ((late / total) * 100).toFixed(2) : 0;
      const notSubmittedPercentage = total > 0 ? ((notSubmitted / total) * 100).toFixed(2) : 0;

      // CSV Headers - ready for doughnut chart
      let csv = 'Category,Count,Percentage,Color\n';
      csv += `"On Time",${onTime},${onTimePercentage},"#10b981"\n`;
      csv += `"Late",${late},${latePercentage},"#f59e0b"\n`;
      csv += `"Not Submitted",${notSubmitted},${notSubmittedPercentage},"#ef4444"\n`;
      csv += `"Total",${total},100.00,"#000000"\n`;

      return csv;
    } catch (error) {
      console.error('Error in AdminExportService.exportKPI_SubmissionTimelinessCSV:', error);
      throw DbUtils.handleError(error);
    }
  }

  /**
   * KPI #3: Export weekly content upload activity
   * Single CSV file with content uploads per week for column chart
   * @param {number} weeks - Number of weeks to look back (default: 12)
   * @returns {string} CSV string
   */
  static async exportKPI_WeeklyContentActivityCSV(weeks = 12) {
    try {
      // Calculate start date (X weeks ago)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (weeks * 7));
      startDate.setHours(0, 0, 0, 0);

      // Fetch all content created since start date
      const [assignments, quizzes, exams] = await Promise.all([
        Assignment.find({ createdAt: { $gte: startDate } })
          .populate('assignedBy', 'firstName lastName')
          .sort({ createdAt: 1 })
          .lean(),
        Quiz.find({ createdAt: { $gte: startDate } })
          .populate('assignedBy', 'firstName lastName')
          .sort({ createdAt: 1 })
          .lean(),
        Exam.find({ createdAt: { $gte: startDate } })
          .populate('assignedBy', 'firstName lastName')
          .sort({ createdAt: 1 })
          .lean()
      ]);

      // Initialize weekly data structure
      const weeklyData = {};
      const currentDate = new Date();

      // Create entries for all weeks (even if no content)
      for (let i = weeks - 1; i >= 0; i--) {
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - (i * 7) - currentDate.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const weekKey = weekStart.toISOString().split('T')[0];
        
        weeklyData[weekKey] = {
          weekStart: weekStart.toISOString().split('T')[0],
          weekEnd: weekEnd.toISOString().split('T')[0],
          weekLabel: `Week ${weeks - i}`,
          assignments: 0,
          quizzes: 0,
          exams: 0,
          total: 0
        };
      }

      // Helper to get week key for a date
      const getWeekKey = (date) => {
        const d = new Date(date);
        const dayOfWeek = d.getDay();
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);
        return weekStart.toISOString().split('T')[0];
      };

      // Count assignments per week
      assignments.forEach(item => {
        const weekKey = getWeekKey(item.createdAt);
        if (weeklyData[weekKey]) {
          weeklyData[weekKey].assignments++;
          weeklyData[weekKey].total++;
        }
      });

      // Count quizzes per week
      quizzes.forEach(item => {
        const weekKey = getWeekKey(item.createdAt);
        if (weeklyData[weekKey]) {
          weeklyData[weekKey].quizzes++;
          weeklyData[weekKey].total++;
        }
      });

      // Count exams per week
      exams.forEach(item => {
        const weekKey = getWeekKey(item.createdAt);
        if (weeklyData[weekKey]) {
          weeklyData[weekKey].exams++;
          weeklyData[weekKey].total++;
        }
      });

      // CSV Headers - ready for column chart
      let csv = 'Week,Week Start,Week End,Assignments,Quizzes,Exams,Total\n';

      // Sort by date and output
      Object.entries(weeklyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([key, data]) => {
          csv += `"${data.weekLabel}",`;
          csv += `"${data.weekStart}",`;
          csv += `"${data.weekEnd}",`;
          csv += `${data.assignments},`;
          csv += `${data.quizzes},`;
          csv += `${data.exams},`;
          csv += `${data.total}\n`;
        });

      return csv;
    } catch (error) {
      console.error('Error in AdminExportService.exportKPI_WeeklyContentActivityCSV:', error);
      throw DbUtils.handleError(error);
    }
  }

  /**
   * Utility function to escape CSV values
   * @param {string} value - Value to escape
   * @returns {string} Escaped value
   */
  static escapeCSV(value) {
    if (value === null || value === undefined) {
      return '';
    }
    // Convert to string and replace double quotes with double double quotes
    return String(value).replace(/"/g, '""');
  }
}

module.exports = AdminExportService;
