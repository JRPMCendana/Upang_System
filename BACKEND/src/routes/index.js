const express = require('express');
const router = express.Router();
const homeRoutes = require('./home.routes');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const teacherRoutes = require('./teacher.routes');
const studentRoutes = require('./student.routes');
const assignmentTaskRoutes = require('./assignment-task.routes');
const submissionRoutes = require('./submission.routes');

router.use('/', homeRoutes);
router.use('/api', healthRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/admin', adminRoutes);
router.use('/api/teacher', teacherRoutes);
router.use('/api/student', studentRoutes);
router.use('/api/assignments', assignmentTaskRoutes);
router.use('/api/submissions', submissionRoutes);

module.exports = router;

