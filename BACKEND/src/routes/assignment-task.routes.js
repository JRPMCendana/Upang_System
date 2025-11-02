const express = require('express');
const router = express.Router();
const AssignmentTaskController = require('../controller/assignment-task.controller');
const FileController = require('../controller/file.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

// Teacher routes - create, update, delete assignments
router.post('/', authMiddleware, authorize('teacher'), upload.single('document'), AssignmentTaskController.createAssignment);

router.get('/', authMiddleware, authorize('teacher', 'student'), AssignmentTaskController.getAssignments);

router.get('/:assignmentId', authMiddleware, authorize('teacher', 'student'), AssignmentTaskController.getAssignmentById);

router.put('/:assignmentId', authMiddleware, authorize('teacher'), upload.single('document'), AssignmentTaskController.updateAssignment);

router.delete('/:assignmentId', authMiddleware, authorize('teacher'), AssignmentTaskController.deleteAssignment);

// File download route
router.get('/files/:fileId', authMiddleware, authorize('teacher', 'student'), FileController.getFile);

module.exports = router;

