const express = require('express');
const router = express.Router();
const AdminController = require('../controller/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/auth.middleware');

router.post('/create-account', authMiddleware, authorize('administrator'), AdminController.createAccount);

router.get('/users', authMiddleware, authorize('administrator'), AdminController.getAllUsers);

router.put('/update-user/:userId', authMiddleware, authorize('administrator'), AdminController.updateUser);

router.post('/assign-teacher/:studentId', authMiddleware, authorize('administrator'), AdminController.assignTeacher);

router.delete('/unassign-teacher/:studentId', authMiddleware, authorize('administrator'), AdminController.unassignTeacher);

// Admin routes - fetch all quizzes, assignments, exams, and submissions
router.get('/quizzes', authMiddleware, authorize('administrator'), AdminController.getAllQuizzes);

router.get('/assignments', authMiddleware, authorize('administrator'), AdminController.getAllAssignments);

router.get('/exams', authMiddleware, authorize('administrator'), AdminController.getAllExams);

router.get('/assignment-submissions', authMiddleware, authorize('administrator'), AdminController.getAllAssignmentSubmissions);

router.get('/quiz-submissions', authMiddleware, authorize('administrator'), AdminController.getAllQuizSubmissions);

// Admin statistics
router.get('/statistics', authMiddleware, authorize('administrator'), AdminController.getSystemStatistics);

// Unified submissions endpoint (combines assignments and quizzes)
router.get('/submissions', authMiddleware, authorize('administrator'), AdminController.getAllSubmissionsUnified);

// Get specific submission detail
router.get('/submissions/:submissionId', authMiddleware, authorize('administrator'), AdminController.getSubmissionDetail);

// ============================================
// DATA EXPORT ROUTES FOR ADMIN
// ============================================

// Export users
router.get('/export/users', authMiddleware, authorize('administrator'), AdminController.exportUsers);

// Export assignments
router.get('/export/assignments', authMiddleware, authorize('administrator'), AdminController.exportAssignments);

// Export quizzes
router.get('/export/quizzes', authMiddleware, authorize('administrator'), AdminController.exportQuizzes);

// Export exams
router.get('/export/exams', authMiddleware, authorize('administrator'), AdminController.exportExams);

// Export assignment submissions
router.get('/export/assignment-submissions', authMiddleware, authorize('administrator'), AdminController.exportAssignmentSubmissions);

// Export quiz submissions
router.get('/export/quiz-submissions', authMiddleware, authorize('administrator'), AdminController.exportQuizSubmissions);

// Export exam submissions
router.get('/export/exam-submissions', authMiddleware, authorize('administrator'), AdminController.exportExamSubmissions);

// Export student grades report
router.get('/export/student-grades', authMiddleware, authorize('administrator'), AdminController.exportStudentGrades);

// Export system statistics
router.get('/export/system-statistics', authMiddleware, authorize('administrator'), AdminController.exportSystemStatistics);

// Export teacher activity
router.get('/export/teacher-activity', authMiddleware, authorize('administrator'), AdminController.exportTeacherActivity);

// ============================================
// KPI-SPECIFIC EXPORT ROUTES
// ============================================

// KPI #1: Quiz Performance by Topic (Bar Chart)
router.get('/export/kpi/quiz-performance-by-topic', authMiddleware, authorize('administrator'), AdminController.exportKPI_QuizPerformanceByTopic);

// KPI #2: Submission Timeliness (Doughnut Chart)
router.get('/export/kpi/submission-timeliness', authMiddleware, authorize('administrator'), AdminController.exportKPI_SubmissionTimeliness);

// KPI #3: Weekly Content Activity (Column Chart) - supports ?weeks=12 parameter
router.get('/export/kpi/weekly-content-activity', authMiddleware, authorize('administrator'), AdminController.exportKPI_WeeklyContentActivity);

module.exports = router;

