const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  quizLink: {
    type: String,
    default: null,
    trim: true,
    validate: {
      validator: function(v) {
        // Allow null or empty, but if provided must be valid URL
        return !v || /^https?:\/\/.+\..+/.test(v);
      },
      message: 'Invalid URL format. Must start with http:// or https://'
    }
  },
  dueDate: {
    type: Date,
    default: null
  },
  totalPoints: {
    type: Number,
    default: 100,
    min: 0,
    max: 1000
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  document: {
    type: String, // GridFS file ID
    default: null
  },
  documentName: {
    type: String,
    default: null
  },
  documentType: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true,
  collection: 'quizzes'
});

quizSchema.index({ assignedBy: 1 });
quizSchema.index({ assignedTo: 1 });
quizSchema.index({ createdAt: -1 });

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;

