const database = require('../config/database');

class DbUtils {
  static isConnected() {
    return database.isConnected();
  }

  static getConnection() {
    return database.getConnection();
  }

  static handleError(error) {
    if (error.name === 'ValidationError') {
      return {
        status: 400,
        message: 'Validation Error',
        errors: Object.values(error.errors).map(err => err.message)
      };
    }

    if (error.name === 'CastError') {
      return {
        status: 400,
        message: 'Invalid ID format'
      };
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return {
        status: 409,
        message: `${field} already exists`
      };
    }

    return {
      status: 500,
      message: 'Database error occurred'
    };
  }
}

module.exports = DbUtils;

