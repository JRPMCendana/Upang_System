const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/auth.middleware');

router.get('/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'This is a protected route',
    user: req.user
  });
});

router.get('/admin-only', authMiddleware, authorize('administrator'), (req, res) => {
  res.json({
    message: 'This route is only accessible by administrators',
    user: req.user
  });
});

router.get('/teacher-only', authMiddleware, authorize('teacher'), (req, res) => {
  res.json({
    message: 'This route is only accessible by teachers',
    user: req.user
  });
});

router.get('/student-only', authMiddleware, authorize('student'), (req, res) => {
  res.json({
    message: 'This route is only accessible by students',
    user: req.user
  });
});

router.get('/student-teacher', authMiddleware, authorize('student', 'teacher'), (req, res) => {
  res.json({
    message: 'This route is accessible by students or teachers',
    user: req.user
  });
});

router.get('/admin-teacher', authMiddleware, authorize('administrator', 'teacher'), (req, res) => {
  res.json({
    message: 'This route is accessible by administrators or teachers',
    user: req.user
  });
});

module.exports = router;

