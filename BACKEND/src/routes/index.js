const express = require('express');
const router = express.Router();
const homeRoutes = require('./home.routes');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');

router.use('/', homeRoutes);
router.use('/api', healthRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/admin', adminRoutes);

module.exports = router;

