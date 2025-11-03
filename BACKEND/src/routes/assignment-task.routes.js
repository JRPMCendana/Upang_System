const express = require('express');
const router = express.Router();
const AssignmentTaskController = require('../controller/assignment-task.controller');
const FileController = require('../controller/file.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

// Teacher & Admin routes - create, update, delete assignments
router.post('/', authMiddleware, authorize('teacher', 'administrator'), upload.single('document'), AssignmentTaskController.createAssignment);

router.get('/', authMiddleware, authorize('teacher', 'student', 'administrator'), AssignmentTaskController.getAssignments);

router.get('/:assignmentId', authMiddleware, authorize('teacher', 'student', 'administrator'), AssignmentTaskController.getAssignmentById);

router.put('/:assignmentId', authMiddleware, authorize('teacher', 'administrator'), upload.single('document'), AssignmentTaskController.updateAssignment);

router.delete('/:assignmentId', authMiddleware, authorize('teacher', 'administrator'), AssignmentTaskController.deleteAssignment);

// File download route
router.get('/files/:fileId', authMiddleware, authorize('teacher', 'student', 'administrator'), FileController.getFile);

module.exports = router;

