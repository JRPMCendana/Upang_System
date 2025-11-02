const express = require('express');
const router = express.Router();
const AuthController = require('../controller/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public routes
router.post('/login', AuthController.login);

// Protected routes (require authentication)
router.get('/me', authMiddleware, AuthController.getMe);

module.exports = router;

