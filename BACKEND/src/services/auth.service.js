const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const config = require('../config/config');
const DbUtils = require('../utils/db.utils');

class AuthService {
  /**
   * Login user with username/email and password
   * @param {string} usernameOrEmail - Username or email
   * @param {string} password - Plain text password
   * @returns {Promise<{user: Object, token: string}>}
   */
  static async login(usernameOrEmail, password) {
    try {
      // Find user by username or email
      const user = await User.findOne({
        $or: [
          { username: usernameOrEmail },
          { email: usernameOrEmail }
        ]
      });

      if (!user) {
        throw {
          status: 401,
          message: 'Invalid credentials'
        };
      }

      // Check if user is active
      if (!user.isActive) {
        throw {
          status: 403,
          message: 'Account is deactivated. Please contact administrator.'
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        throw {
          status: 401,
          message: 'Invalid credentials'
        };
      }

      // Generate JWT token
      const token = this.generateToken(user);

      // Return user data (without password) and token
      const userData = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      return {
        user: userData,
        token
      };
    } catch (error) {
      // If error already has status, rethrow it
      if (error.status) {
        throw error;
      }

      // Handle database errors
      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Login failed'
      };
    }
  }

  /**
   * Generate JWT token for user
   * @param {Object} user - User object
   * @returns {string} JWT token
   */
  static generateToken(user) {
    const payload = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw {
        status: 401,
        message: 'Invalid or expired token'
      };
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User object
   */
  static async getUserById(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        throw {
          status: 404,
          message: 'User not found'
        };
      }

      return user;
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to get user'
      };
    }
  }
}

module.exports = AuthService;

