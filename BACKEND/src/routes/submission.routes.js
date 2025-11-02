const express = require('express');
const router = express.Router();
const SubmissionController = require('../controller/submission.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

// Student routes - submit, unsubmit, replace submission, get own submission
router.post('/:assignmentId/submit', authMiddleware, authorize('student'), upload.single('file'), SubmissionController.submitAssignment);

router.post('/:assignmentId/unsubmit', authMiddleware, authorize('student'), SubmissionController.unsubmitAssignment);

router.put('/:assignmentId/replace', authMiddleware, authorize('student'), upload.single('file'), SubmissionController.replaceSubmission);

router.get('/:assignmentId/my-submission', authMiddleware, authorize('student'), SubmissionController.getSubmission);

// Teacher routes - view all submissions for an assignment, grade submissions
router.get('/:assignmentId/submissions', authMiddleware, authorize('teacher'), SubmissionController.getSubmissionsByAssignment);

router.put('/:submissionId/grade', authMiddleware, authorize('teacher'), SubmissionController.gradeSubmission);

module.exports = router;

