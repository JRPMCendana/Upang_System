const express = require('express');
const router = express.Router();
const { checkDatabaseConnection } = require('../middleware/database.middleware');
const homeRoutes = require('./home.routes');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const teacherRoutes = require('./teacher.routes');
const studentRoutes = require('./student.routes');
const assignmentTaskRoutes = require('./assignment-task.routes');
const submissionRoutes = require('./submission.routes');
const quizRoutes = require('./quiz.routes');
const dashboardRoutes = require('./dashboard.routes');

// Routes that don't require database (always available)
router.use('/', homeRoutes);
router.use('/api', healthRoutes);

// All API routes below require database connection
// Return 503 if database is not connected
router.use('/api/auth', checkDatabaseConnection, authRoutes);
router.use('/api/admin', checkDatabaseConnection, adminRoutes);
router.use('/api/teacher', checkDatabaseConnection, teacherRoutes);
router.use('/api/student', checkDatabaseConnection, studentRoutes);
router.use('/api/assignments', checkDatabaseConnection, assignmentTaskRoutes);
router.use('/api/submissions', checkDatabaseConnection, submissionRoutes);
router.use('/api/quizzes', checkDatabaseConnection, quizRoutes);
router.use('/api/dashboard', checkDatabaseConnection, dashboardRoutes);

module.exports = router;

