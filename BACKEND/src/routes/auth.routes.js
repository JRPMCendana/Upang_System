const express = require('express');
const router = express.Router();
const AuthController = require('../controller/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/login', AuthController.login);

router.get('/me', authMiddleware, AuthController.getMe);

router.post('/change-password', authMiddleware, AuthController.changePassword);

module.exports = router;

