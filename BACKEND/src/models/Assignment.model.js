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
  maxGrade: {
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

