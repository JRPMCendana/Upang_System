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
MONGODB_URI=mongodb://localhost:27017/upang_system
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

### MongoDB Connection

- **Local MongoDB**: `mongodb://localhost:27017/upang_system`
- **MongoDB Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/upang_system`
- **Docker MongoDB**: `mongodb://mongodb:27017/upang_system`

The server will automatically connect to MongoDB on startup. Make sure MongoDB is running before starting the server.

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

