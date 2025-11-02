const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const config = require('../config/config');
const DbUtils = require('../utils/db.utils');

class AuthService {
  static async login(email, password) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        throw {
          status: 401,
          message: 'Invalid credentials'
        };
      }

      if (!user.isActive) {
        throw {
          status: 403,
          message: 'Account is deactivated. Please contact administrator.'
        };
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        throw {
          status: 401,
          message: 'Invalid credentials'
        };
      }

      const token = this.generateToken(user);

      return {
        token,
        role: user.role
      };
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Login failed'
      };
    }
  }

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

  static async createAccount(userData) {
    try {
      const { email, password, username, role, firstName, lastName } = userData;

      if (!email || !password || !username || !role) {
        throw {
          status: 400,
          message: 'Email, password, username, and role are required'
        };
      }

      if (!['student', 'teacher'].includes(role)) {
        throw {
          status: 400,
          message: 'Invalid role. Administrators can only create student or teacher accounts'
        };
      }

      if (password.length < 6) {
        throw {
          status: 400,
          message: 'Password must be at least 6 characters'
        };
      }

      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        throw {
          status: 409,
          message: existingUser.email === email ? 'Email already exists' : 'Username already exists'
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        email,
        password: hashedPassword,
        username,
        role,
        firstName: firstName || '',
        lastName: lastName || '',
        isActive: true
      });

      return {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
      };
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Account creation failed'
      };
    }
  }

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

