const database = require('../config/database');

/**
 * Middleware to check if database is connected
 * Returns 503 Service Unavailable if database is not connected
 */
const checkDatabaseConnection = (req, res, next) => {
  if (!database.isConnected()) {
    return res.status(503).json({
      success: false,
      error: 'Service Unavailable',
      message: 'Database connection is not available. Please try again later.',
      details: {
        service: 'MongoDB',
        status: 'disconnected',
        suggestion: 'The server is running but database connection failed. This is likely due to network issues. Please check your internet connection and try again in a few moments.'
      }
    });
  }
  next();
};

module.exports = { checkDatabaseConnection };
