const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedDocument: {
    type: String, // GridFS file ID
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
  }
}, {
  timestamps: true,
  collection: 'assignment_submissions'
});

// Ensure one submission per student per assignment
assignmentSubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
assignmentSubmissionSchema.index({ student: 1 });
assignmentSubmissionSchema.index({ assignment: 1 });
assignmentSubmissionSchema.index({ isSubmitted: 1 });

const AssignmentSubmission = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);

module.exports = AssignmentSubmission;

