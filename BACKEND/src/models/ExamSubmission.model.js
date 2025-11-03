const mongoose = require('mongoose');

const examSubmissionSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
    default: null
  },
  gradedAt: {
    type: Date,
    default: null
  },
  feedback: {
    type: String,
    default: null
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
  }
}, {
  timestamps: true,
  collection: 'exam_submissions'
});

examSubmissionSchema.index({ exam: 1, student: 1 }, { unique: true });

const ExamSubmission = mongoose.model('ExamSubmission', examSubmissionSchema);

module.exports = ExamSubmission;


