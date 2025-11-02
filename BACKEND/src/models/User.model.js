const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['student', 'administrator', 'teacher']
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^\S+@\S+\.\S+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'deactivated', 'deleted'],
    default: 'active'
  },
  assignedTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Only create indexes that don't already exist from unique: true
userSchema.index({ role: 1 });
userSchema.index({ assignedTeacher: 1 });
// email and username indexes are already created by unique: true

const User = mongoose.model('User', userSchema);

module.exports = User;

