# UPANG System Backend - Architecture & Flow Documentation

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Application Flow](#application-flow)
5. [Request Flow Diagram](#request-flow-diagram)
6. [Key Components](#key-components)
7. [Data Models](#data-models)
8. [Authentication Flow](#authentication-flow)
9. [File Handling](#file-handling)
10. [Error Handling](#error-handling)

---

## Architecture Overview

The UPANG System backend follows a **layered architecture (MVC pattern)** with clear separation of concerns:

```
┌─────────────────────────────────────────────────┐
│              SERVER ENTRY POINT                 │
│              (server.js)                        │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│            EXPRESS APP SETUP                    │
│            (app.js)                             │
│  - CORS Middleware                              │
│  - JSON Parser                                  │
│  - URL Encoded Parser                           │
│  - Routes Registration                          │
│  - Error Handlers                               │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│              ROUTES LAYER                       │
│          (src/routes/)                          │
│  - Route Definitions                            │
│  - Middleware Chaining                          │
│  - Database Connection Checks                   │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│            CONTROLLER LAYER                      │
│         (src/controller/)                       │
│  - Request/Response Handling                    │
│  - Input Validation                             │
│  - Calls Service Layer                          │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│             SERVICE LAYER                       │
│          (src/services/)                        │
│  - Business Logic                               │
│  - Data Processing                              │
│  - External Service Integration                  │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│             MODEL LAYER                         │
│           (src/models/)                         │
│  - MongoDB Schemas                              │
│  - Data Validation                              │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│              DATABASE                           │
│         MongoDB + GridFS                        │
└─────────────────────────────────────────────────┘
```

---

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **File Storage**: MongoDB GridFS
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **File Upload**: multer (memory storage for GridFS)
- **Email**: nodemailer
- **Environment**: dotenv

---

## Project Structure

```
BACKEND/
├── src/
│   ├── server.js              # Entry point - starts server
│   ├── app.js                 # Express app configuration
│   │
│   ├── config/                # Configuration files
│   │   ├── config.js          # Environment variables loader
│   │   └── database.js        # MongoDB connection manager
│   │
│   ├── routes/                # API route definitions
│   │   ├── index.js          # Route aggregator
│   │   ├── auth.routes.js
│   │   ├── admin.routes.js
│   │   ├── teacher.routes.js
│   │   ├── student.routes.js
│   │   ├── assignment-task.routes.js
│   │   ├── submission.routes.js
│   │   ├── quiz.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── health.routes.js
│   │   └── home.routes.js
│   │
│   ├── controller/            # Request/Response handlers
│   │   ├── auth.controller.js
│   │   ├── admin.controller.js
│   │   ├── teacher.controller.js
│   │   ├── student.controller.js
│   │   ├── assignment-task.controller.js
│   │   ├── submission.controller.js
│   │   ├── quiz.controller.js
│   │   ├── quiz-submission.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── file.controller.js
│   │   ├── health.controller.js
│   │   └── home.controller.js
│   │
│   ├── services/              # Business logic layer
│   │   ├── auth.service.js
│   │   ├── assignment.service.js
│   │   ├── assignment-task.service.js
│   │   ├── quiz.service.js
│   │   ├── quiz-submission.service.js
│   │   ├── submission.service.js
│   │   ├── dashboard.service.js
│   │   └── email.service.js
│   │
│   ├── models/                # MongoDB schemas
│   │   ├── User.model.js
│   │   ├── Assignment.model.js
│   │   ├── AssignmentSubmission.model.js
│   │   ├── Quiz.model.js
│   │   └── QuizSubmission.model.js
│   │
│   ├── middleware/            # Express middleware
│   │   ├── index.js           # Middleware aggregator
│   │   ├── auth.middleware.js # JWT authentication
│   │   ├── cors.middleware.js # CORS configuration
│   │   ├── database.middleware.js # DB connection check
│   │   └── upload.middleware.js   # File upload (multer + GridFS)
│   │
│   ├── utils/                 # Utility functions
│   │   └── db.utils.js        # Database error handling
│   │
│   ├── services/              # Additional services
│   │   └── email.service.js   # Email notifications
│   │
│   ├── templates/             # Email templates
│   │   └── account-created.html
│   │
│   └── scripts/               # Utility scripts
│       └── createAdmin.js     # Admin creation script
│
├── package.json
├── .env                       # Environment variables (not in repo)
└── README.md
```

---

## Application Flow

### 1. Server Startup (`server.js`)
```
1. Load environment variables (dotenv)
2. Initialize Express app (app.js)
3. Connect to MongoDB (database.js)
   - Retry logic (5 attempts with exponential backoff)
   - Graceful handling if connection fails
4. Start HTTP server on configured port
5. Setup error handlers (unhandled rejections, uncaught exceptions)
```

### 2. Express App Setup (`app.js`)
```
1. Apply global middleware:
   - CORS (cross-origin requests)
   - JSON body parser
   - URL-encoded body parser
2. Register all routes
3. Setup 404 handler (undefined routes)
4. Setup error handler (catches all errors)
```

### 3. Route Registration (`routes/index.js`)
```
Routes are organized by feature:
- Public routes (no DB check needed): /, /api/health
- Protected routes (require DB): /api/auth, /api/admin, etc.

Each route group:
1. Checks database connection (database.middleware)
2. Routes to specific feature routes
3. Applies authentication middleware where needed
4. Applies role authorization where needed
```

### 4. Request Flow Example: Creating an Assignment

```
┌─────────────────────────────────────────────────────────────┐
│ 1. HTTP Request                                             │
│    POST /api/assignments                                    │
│    Headers: Authorization: Bearer <token>                   │
│    Body: multipart/form-data (title, description, file...)  │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│ 2. Routes Layer (routes/index.js)                          │
│    - checkDatabaseConnection() ✓                           │
│    - Routes to assignment-task.routes.js                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│ 3. Route Handler (routes/assignment-task.routes.js)         │
│    - authMiddleware() → Validates JWT token                │
│    - authorize('teacher') → Checks role                     │
│    - upload.single('document') → Handles file upload       │
│    - Calls AssignmentTaskController.createAssignment        │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│ 4. Controller Layer (controller/assignment-task.controller.js)│
│    - Validates request body                                 │
│    - Extracts file from req.file                           │
│    - Calls AssignmentTaskService.createAssignment()         │
│    - Handles response/errors                                │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│ 5. Service Layer (services/assignment-task.service.js)     │
│    - Business logic validation                              │
│    - Upload file to GridFS (if provided)                   │
│    - Create Assignment model instance                       │
│    - Save to MongoDB                                        │
│    - Returns created assignment                             │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│ 6. Model Layer (models/Assignment.model.js)                  │
│    - Mongoose schema validation                             │
│    - Data type checking                                     │
│    - Index management                                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│ 7. Database (MongoDB)                                       │
│    - Stores assignment document                             │
│    - Stores file in GridFS (if file provided)              │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│ 8. Response                                                 │
│    Status: 201 Created                                      │
│    Body: { success: true, data: {...} }                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Components

### 1. Database Configuration (`config/database.js`)
- **Class-based singleton pattern**
- **Features**:
  - Connection retry logic (5 attempts, exponential backoff)
  - Comprehensive error identification and troubleshooting
  - Event handlers for connection/disconnection
  - Graceful shutdown handling
  - Connection state checking

### 2. Authentication Middleware (`middleware/auth.middleware.js`)
- **JWT Token Validation**:
  - Extracts Bearer token from Authorization header
  - Verifies token signature and expiration
  - Attaches user info to `req.user`
  
- **Role Authorization** (`authorize()`):
  - Checks user role against allowed roles
  - Returns 403 if unauthorized

### 3. File Upload Middleware (`middleware/upload.middleware.js`)
- **Multer Configuration**:
  - Memory storage (for GridFS compatibility)
  - File type validation (PDF, images)
  - 10MB file size limit
  - Special filter for quiz submissions (images only)

- **GridFS Integration**:
  - `uploadToGridFS()` - Upload files to MongoDB GridFS
  - `getFileFromGridFS()` - Retrieve files
  - `deleteFileFromGridFS()` - Delete files

### 4. Routes Organization
- **Public Routes**: No authentication required
  - `/` - Home/health check
  - `/api/health` - Server health check

- **Authenticated Routes**: Require JWT token
  - `/api/auth/*` - Authentication endpoints
  - `/api/admin/*` - Admin operations (requires 'administrator' role)
  - `/api/teacher/*` - Teacher operations (requires 'teacher' role)
  - `/api/student/*` - Student operations (requires 'student' role)
  - `/api/assignments/*` - Assignment management
  - `/api/submissions/*` - Submission handling
  - `/api/quizzes/*` - Quiz management
  - `/api/dashboard/*` - Dashboard data

---

## Data Models

### User Model
```javascript
{
  role: 'student' | 'administrator' | 'teacher',
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  isActive: Boolean,
  status: 'active' | 'deactivated' | 'deleted',
  assignedTeacher: ObjectId (ref: User) // Only for students
}
```

### Assignment Model
```javascript
{
  title: String,
  description: String,
  dueDate: Date,
  assignedBy: ObjectId (ref: User) // Teacher
  assignedTo: [ObjectId] // Array of student IDs
  document: ObjectId // GridFS file ID (optional)
  status: 'active' | 'completed' | 'deleted'
}
```

### AssignmentSubmission Model
```javascript
{
  assignment: ObjectId (ref: Assignment),
  student: ObjectId (ref: User),
  submittedDocument: ObjectId // GridFS file ID
  isSubmitted: Boolean,
  submittedAt: Date,
  grade: Number,
  feedback: String,
  gradedAt: Date
}
```

### Quiz Model
Similar to Assignment, but without dueDate

### QuizSubmission Model
Similar to AssignmentSubmission

---

## Authentication Flow

### Login Flow
```
1. POST /api/auth/login
   Body: { email, password }
   
2. AuthController.login()
   - Validates input
   - Calls AuthService.login()
   
3. AuthService.login()
   - Finds user by email
   - Checks user status (must be 'active')
   - Compares password with bcrypt
   - Generates JWT token
   - Returns { token, user }
   
4. Response: { success: true, data: { token, user } }
```

### Protected Route Flow
```
1. Request includes: Authorization: Bearer <token>
   
2. authMiddleware()
   - Extracts token from header
   - Verifies token with JWT
   - Attaches decoded user to req.user
   
3. authorize('role1', 'role2')
   - Checks req.user.role
   - Allows if role matches
   
4. Controller/Service executes
```

### Password Change Flow
```
1. POST /api/auth/change-password
   Headers: Authorization: Bearer <token>
   Body: { currentPassword, newPassword }
   
2. AuthController.changePassword()
   - Validates input
   - Calls AuthService.changePassword()
   
3. AuthService.changePassword()
   - Verifies current password
   - Hashes new password
   - Updates user document
```

---

## File Handling

### File Upload Flow (GridFS)
```
1. Multer middleware processes multipart/form-data
   - Validates file type
   - Stores in memory (Buffer)
   
2. Service layer calls uploadToGridFS()
   - Creates GridFSBucket
   - Opens upload stream
   - Writes buffer to GridFS
   - Returns file ID
   
3. File ID stored in model (e.g., assignment.document)
   
4. File metadata stored:
   - originalName
   - contentType
   - uploadedAt
   - Custom metadata
```

### File Download Flow
```
1. GET /api/assignments/files/:fileId
   Headers: Authorization: Bearer <token>
   
2. FileController.getFile()
   - Validates authentication
   - Calls getFileFromGridFS(fileId)
   
3. getFileFromGridFS()
   - Opens GridFS download stream
   - Reads file buffer
   - Returns { buffer, contentType, metadata }
   
4. Response: Stream file with appropriate Content-Type
```

### File Deletion
- When assignment/quiz is deleted, associated files are removed from GridFS
- Prevents orphaned files in database

---

## Error Handling

### Error Flow
```
1. Error occurs in Controller/Service
   - Throws error object: { status: 400, message: '...' }
   
2. Controller catches error
   - Passes to Express error handler via next(error)
   
3. Global Error Handler (app.js)
   - Logs error
   - Returns JSON response:
     {
       error: error.message || 'Internal Server Error',
       status: error.status || 500,
       stack: ... (development only)
     }
```

### Database Error Handling (`utils/db.utils.js`)
- **ValidationError** → 400 Bad Request
- **CastError** → 400 Invalid ID format
- **Duplicate Key (11000)** → 409 Conflict
- **Generic** → 500 Internal Server Error

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error
- `503` - Service Unavailable (database disconnected)

---

## Middleware Chain

### Global Middleware (app.js)
```
Request → CORS → JSON Parser → URL Encoded → Routes
```

### Route-Specific Middleware
```
Request → Database Check → Auth → Role Check → Upload → Controller
```

### Example: Assignment Creation
```
1. checkDatabaseConnection()
   - Returns 503 if DB disconnected
   
2. authMiddleware()
   - Validates JWT token
   - Returns 401 if invalid
   
3. authorize('teacher')
   - Checks user role
   - Returns 403 if not teacher
   
4. upload.single('document')
   - Processes file upload
   - Validates file type/size
   - Attaches file to req.file
   
5. Controller
   - Processes request
```

---

## Database Connection Strategy

### Connection Management
- **Singleton Pattern**: Single database instance shared across app
- **Connection State**: Tracks MongoDB connection state
- **Retry Logic**: Automatic retries on connection failure
- **Graceful Degradation**: Server can start without DB (limited mode)

### Connection Flow
```
1. server.js calls database.connect()
2. Checks if already connected
3. Attempts MongoDB connection with options:
   - serverSelectionTimeoutMS: 10000
   - socketTimeoutMS: 45000
   - family: 4 (IPv4)
4. On failure:
   - Identifies error type
   - Provides troubleshooting steps
   - Retries with exponential backoff
   - Max 5 retries
5. On success:
   - Sets up event handlers
   - Returns connection
6. Routes use database.isConnected() check
```

---

## Service Layer Patterns

### Service Responsibilities
1. **Business Logic**: Core application logic
2. **Data Validation**: Business rule validation
3. **Database Operations**: CRUD operations via models
4. **File Operations**: GridFS file handling
5. **External Integrations**: Email, third-party APIs

### Error Handling in Services
```javascript
try {
  // Business logic
  if (validation fails) {
    throw { status: 400, message: 'Validation error' };
  }
  
  // Database operation
  const result = await Model.create(data);
  return result;
  
} catch (error) {
  if (error.status) {
    throw error; // Re-throw business errors
  }
  
  // Handle database errors
  const dbError = DbUtils.handleError(error);
  throw {
    status: dbError.status,
    message: dbError.message
  };
}
```

---

## Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Authentication**: Token-based auth with expiration
3. **Role-Based Access Control**: Fine-grained permissions
4. **Input Validation**: Multiple layers (controller, service, model)
5. **File Type Validation**: Strict MIME type checking
6. **File Size Limits**: 10MB maximum
7. **CORS Configuration**: Restricted origin access
8. **SQL Injection Prevention**: Mongoose parameterization
9. **XSS Prevention**: Input sanitization (trim, validation)

---

## Email Service

### Account Creation Email
- Triggered when admin creates user account
- HTML template (`templates/account-created.html`)
- Contains:
  - Welcome message
  - Credentials (email, password)
  - Password change link
  - Frontend URL from config

### Email Configuration
- SMTP settings from `.env`
- Supports Gmail, Outlook, custom SMTP
- Non-blocking (errors logged, don't fail account creation)

---

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "limit": 10,
      "totalItems": 100,
      "totalPages": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## Environment Variables

Required `.env` variables:
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - Token expiration (default: 7d)
- `CORS_ORIGIN` - Allowed CORS origin
- `FRONTEND_URL` - Frontend URL for email links
- `SMTP_*` - Email configuration (host, port, user, password, etc.)

---

## Scripts

### Available NPM Scripts
- `npm start` - Start server (production)
- `npm run dev` - Start with nodemon (development)
- `npm run create-admin` - Create admin user script

---

## Best Practices Implemented

1. **Separation of Concerns**: Clear layer separation
2. **Error Handling**: Comprehensive error handling at all levels
3. **Validation**: Multiple validation layers
4. **Security**: Authentication, authorization, input validation
5. **Scalability**: Modular structure, easy to extend
6. **Maintainability**: Clear naming, organized structure
7. **Documentation**: README and inline comments
8. **Error Messages**: User-friendly error messages
9. **Logging**: Console logging for debugging
10. **Graceful Degradation**: Server can run without DB

---

This architecture provides a robust, scalable, and maintainable backend system for the UPANG Learning Management System.

