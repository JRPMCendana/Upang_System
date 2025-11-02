const express = require('express');
const router = express.Router();
const AuthController = require('../controller/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/auth.middleware');

router.post('/login', AuthController.login);

router.get('/me', authMiddleware, AuthController.getMe);

router.post('/change-password', authMiddleware, AuthController.changePassword);

router.post('/create-account', authMiddleware, authorize('administrator'), AuthController.createAccount);

router.get('/users', authMiddleware, authorize('administrator'), AuthController.getAllUsers);

router.put('/update-user/:userId', authMiddleware, authorize('administrator'), AuthController.updateUser);

module.exports = router;

