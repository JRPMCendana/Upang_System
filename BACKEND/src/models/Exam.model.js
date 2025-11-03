const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
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
  collection: 'exams'
});

examSchema.index({ assignedBy: 1 });
examSchema.index({ assignedTo: 1 });
examSchema.index({ createdAt: -1 });

const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam;


