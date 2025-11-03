const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
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
    required: true
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
    type: String,
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
    enum: ['pending', 'submitted', 'graded', 'due'],
    default: 'pending'
  }
}, {
  timestamps: true,
  collection: 'assignments'
});

assignmentSchema.index({ assignedBy: 1 });
assignmentSchema.index({ assignedTo: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ createdAt: -1 });

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;

