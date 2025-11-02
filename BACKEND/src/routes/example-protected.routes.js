const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/auth.middleware');

/**
 * Example protected routes demonstrating role-based access control
 * 
 * These are example routes showing how to use authentication and authorization.
 * You can remove or modify these routes as needed for your application.
 */

// Protected route - any authenticated user can access
router.get('/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'This is a protected route',
    user: req.user
  });
});

// Administrator only route
router.get('/admin-only', authMiddleware, authorize('administrator'), (req, res) => {
  res.json({
    message: 'This route is only accessible by administrators',
    user: req.user
  });
});

// Teacher only route
router.get('/teacher-only', authMiddleware, authorize('teacher'), (req, res) => {
  res.json({
    message: 'This route is only accessible by teachers',
    user: req.user
  });
});

// Student only route
router.get('/student-only', authMiddleware, authorize('student'), (req, res) => {
  res.json({
    message: 'This route is only accessible by students',
    user: req.user
  });
});

// Multiple roles allowed (student OR teacher)
router.get('/student-teacher', authMiddleware, authorize('student', 'teacher'), (req, res) => {
  res.json({
    message: 'This route is accessible by students or teachers',
    user: req.user
  });
});

// Administrator OR teacher
router.get('/admin-teacher', authMiddleware, authorize('administrator', 'teacher'), (req, res) => {
  res.json({
    message: 'This route is accessible by administrators or teachers',
    user: req.user
  });
});

module.exports = router;

