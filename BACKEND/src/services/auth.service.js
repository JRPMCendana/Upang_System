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

      if (user.status !== 'active') {
        if (user.status === 'deleted') {
          throw {
            status: 403,
            message: 'Account has been deleted. Please contact administrator.'
          };
        }
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
        isActive: true,
        status: 'active'
      });

      return {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        isActive: newUser.isActive,
        status: newUser.status,
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

  static async changePassword(userId, currentPassword, newPassword) {
    try {
      if (!currentPassword || !newPassword) {
        throw {
          status: 400,
          message: 'Current password and new password are required'
        };
      }

      if (newPassword.length < 6) {
        throw {
          status: 400,
          message: 'New password must be at least 6 characters'
        };
      }

      const user = await User.findById(userId);

      if (!user) {
        throw {
          status: 404,
          message: 'User not found'
        };
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isCurrentPasswordValid) {
        throw {
          status: 401,
          message: 'Current password is incorrect'
        };
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedNewPassword;
      await user.save();

      return {
        message: 'Password changed successfully'
      };
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to change password'
      };
    }
  }

  static async updateUser(userId, updateData) {
    try {
      const { email, password, username, firstName, lastName, status } = updateData;

      const user = await User.findById(userId);

      if (!user) {
        throw {
          status: 404,
          message: 'User not found'
        };
      }

      if (email) {
        const trimmedEmail = email.trim().toLowerCase();
        
        if (!trimmedEmail) {
          throw {
            status: 400,
            message: 'Email cannot be empty'
          };
        }

        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(trimmedEmail)) {
          throw {
            status: 400,
            message: 'Invalid email format'
          };
        }

        const existingEmail = await User.findOne({ 
          email: trimmedEmail,
          _id: { $ne: userId }
        });

        if (existingEmail) {
          throw {
            status: 409,
            message: 'Email already exists'
          };
        }

        user.email = trimmedEmail;
      }

      if (username) {
        const trimmedUsername = username.trim();

        if (!trimmedUsername || trimmedUsername.length < 3) {
          throw {
            status: 400,
            message: 'Username must be at least 3 characters'
          };
        }

        if (trimmedUsername.length > 50) {
          throw {
            status: 400,
            message: 'Username cannot exceed 50 characters'
          };
        }

        const existingUsername = await User.findOne({ 
          username: trimmedUsername,
          _id: { $ne: userId }
        });

        if (existingUsername) {
          throw {
            status: 409,
            message: 'Username already exists'
          };
        }

        user.username = trimmedUsername;
      }

      if (password) {
        const trimmedPassword = password.trim();

        if (trimmedPassword.length < 6) {
          throw {
            status: 400,
            message: 'Password must be at least 6 characters'
          };
        }

        user.password = await bcrypt.hash(trimmedPassword, 10);
      }

      if (firstName !== undefined) {
        const trimmedFirstName = firstName ? firstName.trim() : '';
        
        if (trimmedFirstName.length > 50) {
          throw {
            status: 400,
            message: 'First name cannot exceed 50 characters'
          };
        }

        user.firstName = trimmedFirstName;
      }

      if (lastName !== undefined) {
        const trimmedLastName = lastName ? lastName.trim() : '';
        
        if (trimmedLastName.length > 50) {
          throw {
            status: 400,
            message: 'Last name cannot exceed 50 characters'
          };
        }

        user.lastName = trimmedLastName;
      }

      if (status !== undefined) {
        if (!['active', 'deactivated', 'deleted'].includes(status)) {
          throw {
            status: 400,
            message: 'Status must be one of: active, deactivated, deleted'
          };
        }

        if (user.role === 'administrator' && status === 'deleted') {
          throw {
            status: 403,
            message: 'Administrator accounts cannot be deleted'
          };
        }

        user.status = status;
        
        if (status === 'active') {
          user.isActive = true;
        } else {
          user.isActive = false;
        }
      }

      await user.save();

      const updatedUser = await User.findById(userId).select('-password');

      return {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        isActive: updatedUser.isActive,
        status: updatedUser.status,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      };
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to update user'
      };
    }
  }

  static async getAllUsers(page = 1, limit = 10, role = null, statusFilter = null) {
    try {
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      if (pageNum < 1) {
        throw {
          status: 400,
          message: 'Page must be greater than 0'
        };
      }

      if (limitNum < 1 || limitNum > 100) {
        throw {
          status: 400,
          message: 'Limit must be between 1 and 100'
        };
      }

      const skip = (pageNum - 1) * limitNum;

      const filter = {};
      if (role) {
        if (role === 'teacher' || role === 'student') {
          filter.role = role;
        } else {
          throw {
            status: 400,
            message: 'Role filter must be either "teacher" or "student"'
          };
        }
      } else {
        filter.role = { $in: ['teacher', 'student'] };
      }

      if (statusFilter) {
        if (!['active', 'deactivated', 'deleted'].includes(statusFilter)) {
          throw {
            status: 400,
            message: 'Status filter must be one of: active, deactivated, deleted'
          };
        }
        filter.status = statusFilter;
      }

      const [users, total] = await Promise.all([
        User.find(filter)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        User.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / limitNum);

      return {
        users,
        pagination: {
          currentPage: pageNum,
          limit: limitNum,
          totalItems: total,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      };
    } catch (error) {
      if (error.status) {
        throw error;
      }

      const dbError = DbUtils.handleError(error);
      throw {
        status: dbError.status,
        message: dbError.message || 'Failed to get users'
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

