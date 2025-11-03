const mongoose = require('mongoose');

const quizSubmissionSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedDocument: {
    type: String, // GridFS file ID (screenshot/image)
    default: null
  },
  submittedDocumentName: {
    type: String,
    default: null
  },
  submittedDocumentType: {
    type: String,
    default: null
  },
  isSubmitted: {
    type: Boolean,
    default: false
  },
  submittedAt: {
    type: Date,
    default: null
  },
  grade: {
    type: Number,
    default: null,
    min: 0,
    max: 100
  },
  feedback: {
    type: String,
    default: null
  },
  gradedAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'submitted', 'graded', 'due'],
    default: 'pending'
  }
}, {
  timestamps: true,
  collection: 'quiz_submissions'
});

// Ensure one submission per student per quiz
quizSubmissionSchema.index({ quiz: 1, student: 1 }, { unique: true });
quizSubmissionSchema.index({ student: 1 });
quizSubmissionSchema.index({ quiz: 1 });
quizSubmissionSchema.index({ isSubmitted: 1 });

const QuizSubmission = mongoose.model('QuizSubmission', quizSubmissionSchema);

module.exports = QuizSubmission;

