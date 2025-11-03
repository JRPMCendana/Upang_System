# Upang System Backend

Express.js backend server for the Upang System.

## Installation

1. Navigate to the BACKEND directory:
```bash
cd BACKEND
```

2. Install dependencies:
```bash
npm install
```

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will run on `http://localhost:3001` by default (or the port specified in `.env`).

## Environment Variables

Create a `.env` file in the BACKEND directory with:
```
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/UPANGLEARNINGSYSTEM
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=UPANG Learning System <your-email@gmail.com>
```

### MongoDB Connection

- **Local MongoDB**: `mongodb://localhost:27017/UPANGLEARNINGSYSTEM`
- **MongoDB Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/UPANGLEARNINGSYSTEM`
- **Docker MongoDB**: `mongodb://mongodb:27017/UPANGLEARNINGSYSTEM`

The server will automatically connect to MongoDB on startup. Make sure MongoDB is running before starting the server.

### Email Configuration (SMTP)

The system sends automated emails when administrators create accounts. Configure your SMTP settings in the `.env` file.

**For Gmail:**
1. Enable 2-Step Verification on your Google account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Create a new app password for "Mail"
   - Use this password in `SMTP_PASSWORD` (not your regular Gmail password)

**Example Gmail Configuration:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-character-app-password
SMTP_FROM=UPANG Learning System <your-email@gmail.com>
```

**Other Email Providers:**
- **Outlook/Hotmail**: `smtp-mail.outlook.com`, port `587`
- **Yahoo**: `smtp.mail.yahoo.com`, port `587`
- **Custom SMTP**: Use your provider's SMTP settings

**Frontend URL:**
Set `FRONTEND_URL` to your frontend application URL. This is used in email links for password changes.

## Dependencies

Required npm packages:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcrypt` - Password hashing
- `nodemailer` - Email sending
- `multer` - File upload handling
- `cors` - Cross-Origin Resource Sharing
- `dotenv` - Environment variables

## Architecture Overview

The backend follows a layered architecture:
- **Routes** (`src/routes/`) - API endpoint definitions
- **Controllers** (`src/controller/`) - Request/response handling
- **Services** (`src/services/`) - Business logic
- **Models** (`src/models/`) - MongoDB schemas
- **Middleware** (`src/middleware/`) - Authentication, CORS, file upload

## Authentication API

The backend includes a complete authentication system with JWT tokens and role-based access control.

### User Roles
- **student**: Student user
- **administrator**: Administrator user
- **teacher**: Teacher user

### API Endpoints

#### 1. Login
**POST** `/api/auth/login`

Request body:
```json
{
  "usernameOrEmail": "johndoe",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "student",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Get Current User (Protected)
**GET** `/api/auth/me`

Headers:
```
Authorization: Bearer <your-token>
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "student",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true
  }
}
```

### Using Authentication Middleware

To protect routes, use the `authMiddleware`:

```javascript
const authMiddleware = require('./middleware/auth.middleware');

router.get('/protected-route', authMiddleware, (req, res) => {
  // req.user contains the decoded token info
  res.json({ user: req.user });
});
```

### Role-Based Authorization

To restrict routes to specific roles, use the `authorize` middleware:

```javascript
const { authorize } = require('./middleware/auth.middleware');

// Only administrators
router.get('/admin-only', authMiddleware, authorize('administrator'), (req, res) => {
  res.json({ message: 'Admin access' });
});

// Multiple roles
router.get('/student-teacher', authMiddleware, authorize('student', 'teacher'), (req, res) => {
  res.json({ message: 'Student or teacher access' });
});
```

## Admin API

### Admin Endpoints

All admin endpoints require `Authorization: Bearer <admin_token>` header.

#### 1. Create Account
**POST** `/api/admin/create-account`

Create student or teacher account.

Request body:
```json
{
  "email": "student@example.com",
  "password": "password123",
  "username": "student1",
  "role": "student",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### 2. Get All Users
**GET** `/api/admin/users?page=1&limit=10&role=student&status=active`

Query parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role (`student`, `teacher`)
- `status` (optional): Filter by status (`active`, `deactivated`, `deleted`)

#### 3. Update User
**PUT** `/api/admin/update-user/:userId`

Request body (all fields optional):
```json
{
  "email": "newemail@example.com",
  "username": "newusername",
  "firstName": "Jane",
  "lastName": "Smith",
  "status": "active"
}
```

#### 4. Assign Teacher to Student
**POST** `/api/admin/assign-teacher/:studentId`

Request body:
```json
{
  "teacherId": "teacher_id_here"
}
```

#### 5. Unassign Teacher from Student
**DELETE** `/api/admin/unassign-teacher/:studentId`

#### 6. Get All Quizzes
**GET** `/api/admin/quizzes?page=1&limit=10`

Returns all quizzes created by all teachers.

#### 7. Get All Assignments
**GET** `/api/admin/assignments?page=1&limit=10`

Returns all assignments created by all teachers.

#### 8. Get All Assignment Submissions
**GET** `/api/admin/assignment-submissions?page=1&limit=10`

Returns all submitted assignments (where `isSubmitted: true`).

#### 9. Get All Quiz Submissions
**GET** `/api/admin/quiz-submissions?page=1&limit=10`

Returns all submitted quizzes (where `isSubmitted: true`).

## Assignment API

### Teacher Endpoints

#### 1. Create Assignment
**POST** `/api/assignments`

Headers:
```
Authorization: Bearer <teacher_token>
Content-Type: multipart/form-data
```

Request body:
- `title` (required): Assignment title
- `description` (required): Assignment description
- `dueDate` (required): Due date (ISO 8601 format)
- `studentIds` (required): JSON array of student IDs
- `document` (optional): PDF or image file

Example:
```
title: "Math Homework"
description: "Complete exercises 1-10"
dueDate: "2024-12-31T23:59:59Z"
studentIds: ["student_id_1", "student_id_2"]
document: <optional_file>
```

#### 2. Get Assignments
**GET** `/api/assignments?page=1&limit=10`

- **Teachers**: Get all assignments they created
- **Students**: Get all assignments assigned to them

#### 3. Get Assignment by ID
**GET** `/api/assignments/:assignmentId`

- **Teachers**: Can only view their own assignments
- **Students**: Can only view assignments assigned to them

#### 4. Update Assignment
**PUT** `/api/assignments/:assignmentId`

Headers:
```
Authorization: Bearer <teacher_token>
Content-Type: multipart/form-data
```

Request body (all fields optional):
```
title: "Updated Title"
description: "Updated description"
dueDate: "2024-12-31T23:59:59Z"
studentIds: ["student_id_1"]
document: <optional_file>
```

#### 5. Delete Assignment
**DELETE** `/api/assignments/:assignmentId`

Teachers can only delete their own assignments.

#### 6. Download Assignment Document
**GET** `/api/assignments/files/:fileId`

Download document file from GridFS.

### Student Assignment Submission Endpoints

#### 1. Submit Assignment
**POST** `/api/submissions/:assignmentId/submit`

Headers:
```
Authorization: Bearer <student_token>
Content-Type: multipart/form-data
```

Request body:
- `file` (required): PDF or image file

**Note**: Students can only submit assignments assigned to them. Submission sets `isSubmitted = true`.

#### 2. Unsubmit Assignment
**POST** `/api/submissions/:assignmentId/unsubmit`

Removes submission and deletes file. Sets `isSubmitted = false`.

#### 3. Replace Submission
**PUT** `/api/submissions/:assignmentId/replace`

Headers:
```
Authorization: Bearer <student_token>
Content-Type: multipart/form-data
```

Request body:
- `file` (required): New PDF or image file

Replaces existing submission file. Only works if already submitted.

#### 4. Get My Submission
**GET** `/api/submissions/:assignmentId/my-submission`

Students can view their own submission details.

### Teacher Assignment Submission Endpoints

#### 1. Get All Submissions for Assignment
**GET** `/api/submissions/:assignmentId/submissions?page=1&limit=10`

Teachers can view all submissions for their assignments.

#### 2. Grade Submission
**PUT** `/api/submissions/:submissionId/grade`

Request body:
```json
{
  "grade": 85,
  "feedback": "Good work! Minor improvements needed."
}
```

**Validation**: Can only grade submissions where `isSubmitted === true`.

## Quiz API

### Teacher Endpoints

#### 1. Create Quiz
**POST** `/api/quizzes`

Headers:
```
Authorization: Bearer <teacher_token>
Content-Type: multipart/form-data
```

Request body:
- `title` (required): Quiz title
- `description` (required): Quiz description
- `studentIds` (required): JSON array of student IDs
- `document` (optional): PDF or image file (reference material)

#### 2. Get Quizzes
**GET** `/api/quizzes?page=1&limit=10`

- **Teachers**: Get all quizzes they created
- **Students**: Get all quizzes assigned to them

#### 3. Get Quiz by ID
**GET** `/api/quizzes/:quizId`

#### 4. Update Quiz
**PUT** `/api/quizzes/:quizId`

Headers:
```
Authorization: Bearer <teacher_token>
Content-Type: multipart/form-data
```

Request body (all fields optional):
```
title: "Updated Quiz"
description: "Updated description"
studentIds: ["student_id_1"]
document: <optional_file>
```

#### 5. Delete Quiz
**DELETE** `/api/quizzes/:quizId`

Teachers can only delete their own quizzes.

### Student Quiz Submission Endpoints

#### 1. Submit Quiz
**POST** `/api/quizzes/:quizId/submit`

Headers:
```
Authorization: Bearer <student_token>
Content-Type: multipart/form-data
```

Request body:
- `file` (required): Screenshot/image file (JPEG, PNG, GIF, WEBP only)

**Note**: Only image files allowed for quiz submissions (screenshots).

#### 2. Unsubmit Quiz
**POST** `/api/quizzes/:quizId/unsubmit`

#### 3. Replace Quiz Submission
**PUT** `/api/quizzes/:quizId/replace`

Headers:
```
Authorization: Bearer <student_token>
Content-Type: multipart/form-data
```

Request body:
- `file` (required): New screenshot/image file

#### 4. Get My Submission
**GET** `/api/quizzes/:quizId/my-submission`

### Teacher Quiz Submission Endpoints

#### 1. Get All Submissions for Quiz
**GET** `/api/quizzes/:quizId/submissions?page=1&limit=10`

#### 2. Grade Quiz Submission
**PUT** `/api/quizzes/submissions/:submissionId/grade`

Request body:
```json
{
  "grade": 90,
  "feedback": "Excellent work!"
}
```

**Validation**: Can only grade submissions where `isSubmitted === true`.

#### 3. Download Quiz Document/Submission
**GET** `/api/quizzes/files/:fileId`

Download files from GridFS.

## Student API

### Student Endpoints

#### 1. Get Assigned Teacher
**GET** `/api/student/assigned-teacher`

Returns the teacher assigned to the student.

Response:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "firstName": "Jane",
    "lastName": "Teacher",
    "email": "teacher@example.com"
  }
}
```

## Teacher API

### Teacher Endpoints

#### 1. Get Assigned Students
**GET** `/api/teacher/assigned-students?page=1&limit=10`

Returns all students assigned to the teacher.

#### 2. Get Assigned Student by ID
**GET** `/api/teacher/assigned-students/:studentId`

Returns details of a specific assigned student.

## File Storage (GridFS)

The system uses **MongoDB GridFS** for file storage instead of the filesystem:

### Features:
- Files stored directly in MongoDB
- Supports large files
- Automatic file cleanup when assignments/quizzes are deleted
- Secure file access (requires authentication)

### File Types:
- **Assignment documents**: PDF, JPEG, PNG, GIF, WEBP (optional, uploaded by teachers)
- **Assignment submissions**: PDF, JPEG, PNG, GIF, WEBP (uploaded by students)
- **Quiz documents**: PDF, JPEG, PNG, GIF, WEBP (optional, uploaded by teachers)
- **Quiz submissions**: JPEG, PNG, GIF, WEBP only (screenshots uploaded by students)

### File Size Limit:
- Maximum file size: **10MB**

### Downloading Files:
All files can be downloaded using:
```
GET /api/assignments/files/:fileId
GET /api/quizzes/files/:fileId
```

Requires authentication token in headers.

## Data Models

### User Model
- Single `users` collection for all user types
- Fields: `role`, `username`, `email`, `password`, `firstName`, `lastName`, `isActive`, `status`
- Students have optional `assignedTeacher` field

### Assignment Model
- Collection: `assignments`
- Fields: `title`, `description`, `dueDate`, `assignedBy` (teacher), `assignedTo` (students array), `document` (GridFS file ID), `status`

### AssignmentSubmission Model
- Collection: `assignment_submissions`
- Fields: `assignment`, `student`, `submittedDocument` (GridFS file ID), `isSubmitted`, `submittedAt`, `grade`, `feedback`, `gradedAt`

### Quiz Model
- Collection: `quizzes`
- Fields: `title`, `description`, `assignedBy` (teacher), `assignedTo` (students array), `document` (GridFS file ID, optional), `status`

### QuizSubmission Model
- Collection: `quiz_submissions`
- Fields: `quiz`, `student`, `submittedDocument` (GridFS file ID - screenshot), `isSubmitted`, `submittedAt`, `grade`, `feedback`, `gradedAt`

## Error Handling

All API endpoints follow consistent error response format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

