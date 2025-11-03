# UPANG Learning System - Complete Application Flow Guide

## 📚 Table of Contents
- [System Overview](#system-overview)
- [Student Flow](#student-flow)
- [Teacher Flow](#teacher-flow)
- [Administrator Flow](#administrator-flow)
- [Grade Calculation System](#grade-calculation-system)

---

## System Overview

The UPANG Learning System is a comprehensive learning management platform with three distinct user roles:
- **Students**: Submit assignments, take quizzes/exams, view grades
- **Teachers**: Create assignments/quizzes/exams, grade submissions, manage students
- **Administrators**: Manage users, assign teachers to students, view system-wide statistics

**Authentication**: JWT-based authentication with role-based access control (RBAC)

**Test Credentials**:
- Student: `student@test.com` / `password123`
- Teacher: `teacher@test.com` / `password123`
- Admin: `admin@test.com` / `password123`

---

## Student Flow

### 1. **Login & Authentication**
```
Step 1: Navigate to Login Page
URL: http://localhost:3000/login

Step 2: Enter Credentials
- Email: student@test.com
- Password: password123
- Role: Student

Step 3: System authenticates and redirects to dashboard
- Redirects to: /dashboard/student
```

### 2. **Student Dashboard Overview**
```
Dashboard displays:
✓ Pending Assignments (not yet submitted)
✓ Pending Quizzes (not yet taken)
✓ Late Assignments (past due date)
✓ Average Grade (percentage across all graded items)
✓ Completion Rate (submitted/total tasks)
✓ Recent Assignments (next 5 upcoming)
```

### 3. **View and Submit Assignments**

#### A. View Assignments List
```
Navigate to: /dashboard/assignments
- Shows all assignments assigned to the student
- Displays: Title, Due Date, Status (Pending/Submitted/Graded)
- Filter by status
```

#### B. View Assignment Details
```
Click on specific assignment
URL: /dashboard/assignments/[assignmentId]

Shows:
- Assignment title, description, instructions
- Due date and points
- Attached document (if any) - can download
- Current submission status
- Grade and feedback (if graded)
```

#### C. Submit Assignment
```
Step 1: Upload file (PDF, DOCX, images)
Step 2: Click "Submit Assignment"

Student can:
- Unsubmit (if not graded yet)
- Replace submission (if not graded yet)
```

### 4. **Take Quizzes**

#### A. View Quizzes List
```
Navigate to: /dashboard/quizzes
- Shows all quizzes assigned to the student
- Displays: Title, Total Points, Status
```

#### B. Take Quiz
```
Click on quiz to start
URL: /dashboard/quizzes/[quizId]

Shows:
- Quiz title, description, instructions
- Total points
- Quiz document (if attached)
- Submit button
```

#### C. Submit Quiz
```
Step 1: Complete quiz (upload answer file)
Step 2: Click "Submit Quiz"

Student can:
- View own submission
- Unsubmit (if not graded)
- Replace submission
```

### 5. **Take Exams**

#### A. View Exams List
```
Navigate to: /dashboard/exams
- Shows all exams assigned to the student
- Displays: Title, Due Date, Total Points, Status
```

#### B. Take Exam
```
Click on exam
URL: /dashboard/exams/[examId]

Shows:
- Exam title, description
- Due date and total points
- Exam document (download to view questions)
- Submit button
```

#### C. Submit Exam
```
Step 1: Download exam questions (if document attached)
Step 2: Complete exam offline or upload answers
Step 3: Upload submission file
Step 4: Click "Submit Exam"

Student can:
- View own submission
- Unsubmit (if not graded)
```

### 6. **View Grades**

#### A. Overall Grades Overview
```
Navigate to: /dashboard/grades
URL: /dashboard/student/grades

Shows:
- Overall Average (calculated with weighted formula)
- Highest Grade
- Completed vs Total items
- Grade Trend (chart showing performance over time)
- Recent Grades (last 10)
- Pending Tasks (not yet submitted)
```

#### B. Grade Breakdown
```
View detailed grades:
- Assignments: List with individual scores
- Quizzes: List with individual scores
- Exams: List with individual scores

Each shows:
- Name/Title
- Raw Score (e.g., 45/50)
- Percentage (e.g., 90%)
- Date submitted
- Feedback from teacher (if provided)
```

### 7. **View Assigned Teacher**
```
Navigate to: /dashboard/profile or /dashboard/teacher-info

Shows:
- Teacher's name
- Teacher's email
- Contact information
```

---

## Teacher Flow

### 1. **Login & Authentication**
```
Step 1: Navigate to Login Page
URL: http://localhost:3000/login

Step 2: Enter Credentials
- Email: teacher@test.com
- Password: password123
- Role: Teacher

Step 3: System authenticates and redirects
- Redirects to: /dashboard/teacher
```

### 2. **Teacher Dashboard Overview**
```
Dashboard displays:
✓ Total Students (assigned to this teacher)
✓ Total Assignments Created
✓ Total Quizzes Created
✓ Total Exams Created
✓ Pending Grading Count (submitted but not graded)
✓ Total Submissions (all graded + pending)
✓ Average Class Grade (weighted calculation)
✓ Recent Submissions (last 5 needing grading)
✓ Upcoming Exams (next 3)
✓ Upcoming Quizzes (next 3)
```

### 3. **Manage Students**

#### A. View All Assigned Students
```
Navigate to: /dashboard/students
URL: /dashboard/teacher/students

Shows list of students:
- Name
- Email
- Current average grade
- Number of pending submissions
```

#### B. View Individual Student Details
```
Click on specific student
URL: /dashboard/students/[studentId]

Shows:
- Student info (name, email)
- Overall grade average
- Assignment grades (list)
- Quiz grades (list)
- Exam grades (list)
- Recent activity
```

#### C. View Student Grade Details
```
Navigate to: /dashboard/students/[studentId]/grades

Shows comprehensive grade breakdown:
- Overall average (weighted calculation)
- By category:
  * Assignments: Individual scores, percentages, dates
  * Quizzes: Individual scores, percentages, dates
  * Exams: Individual scores, percentages, dates
- Graded items count
- Pending items count
```

### 4. **Create Assignments**

#### A. Navigate to Create Assignment
```
Go to: /dashboard/assignments
Click "Create New Assignment" button
URL: /dashboard/assignments/create
```

#### B. Fill Assignment Details
```
Form fields:
- Title (required)
- Description/Instructions
- Due Date (required)
- Total Points (default: 100)
- Assign to Students (multi-select)
- Attach Document (optional, PDF/DOCX/images)

Step 1: Fill all required fields
Step 2: Select students to assign to
Step 3: (Optional) Upload reference document
Step 4: Click "Create Assignment"
```

#### C. View Assignment Submissions
```
Navigate to: /dashboard/assignments/[assignmentId]

Shows:
- Assignment details
- List of all submissions from assigned students
- Each submission shows:
  * Student name
  * Submission date
  * Status (Pending/Graded)
  * Current grade (if graded)
```

#### D. Edit or Delete Assignment
```
Edit Assignment:
- Update title, description, due date, points
- Add/remove assigned students
- Replace document

Delete Assignment:
- Removes assignment and all related submissions
```

### 5. **Create Quizzes**

#### A. Navigate to Create Quiz
```
Go to: /dashboard/quizzes
Click "Create New Quiz" button
URL: /dashboard/quizzes/create
```

#### B. Fill Quiz Details
```
Form fields:
- Title (required)
- Description/Instructions
- Total Points (required, max 150)
- Due Date (optional)
- Assign to Students (multi-select)
- Attach Document (optional, quiz questions)
```

#### C. View Quiz Submissions
```
Navigate to: /dashboard/quizzes/[quizId]

Shows:
- Quiz details
- Total points
- List of submissions:
  * Student name
  * Submission date
  * Grade (if graded)
  * Status
```

#### D. Edit or Delete Quiz
```
- Edit quiz details
- Delete quiz
```

### 6. **Create Exams**

#### A. Navigate to Create Exam
```
Go to: /dashboard/exams
Click "Create New Exam" button
URL: /dashboard/exams/create
```

#### B. Fill Exam Details
```
Form fields:
- Title (required)
- Description/Instructions
- Total Points (required, max 150)
- Due Date (required)
- Assign to Students (multi-select)
- Attach Document (optional, exam questions)
```

#### C. View Exam Submissions
```
Navigate to: /dashboard/exams/[examId]

Shows:
- Exam details
- List of submissions:
  * Student name
  * Submission date
  * Grade (if graded)
  * Status (Submitted/Pending Grade/Graded)
```

#### D. Edit or Delete Exam
```
- Edit exam details
- Delete exam (if needed)
```

### 7. **Grade Submissions**

#### A. Grade Assignment Submission
```
Navigate to submission detail
URL: /dashboard/assignments/[assignmentId]/submissions/[submissionId]

Shows:
- Student name
- Assignment details
- Submitted file (can download/view)
- Submission date
- Grading form:
  * Grade input (0 to totalPoints)
  * Feedback textarea (max 1000 chars)
  * Character counter

Step 1: Download/view student submission
Step 2: Enter grade (e.g., 45 out of 50)
Step 3: (Optional) Provide feedback
Step 4: Click "Submit Grade"

System calculates:
- Percentage = (45/50) × 100 = 90%
- Stores both raw grade and percentage
```

#### B. Grade Quiz Submission
```
Navigate to quiz submission
URL: /dashboard/quizzes/[quizId]/submissions/[submissionId]

Same process as assignment grading

Grading form:
- Grade input (must be ≤ totalPoints, max 150)
- Feedback textarea (max 1000 chars)
- Character counter
```

#### C. Grade Exam Submission
```
Navigate to exam submission
URL: /dashboard/exams/[examId]/submissions/[submissionId]

Same grading interface

Grading form:
- Grade input (must be ≤ totalPoints, max 150)
- Feedback textarea (max 1000 chars)
```

### 8. **View Grade Statistics**

#### A. Overall Grade Statistics
```
Navigate to: /dashboard/grades
URL: /dashboard/teacher/grades

Shows:
- Class Average (weighted calculation)
- Pass Rate (% of students with ≥70%)
- Passing Students Count
- Grading Status (pending count)
- Grade Distribution Chart:
  * A (90-100%): count and percentage
  * B (80-89%): count and percentage
  * C (70-79%): count and percentage
  * F (<70%): count and percentage
- Performance by Task (top 10):
  * Task name
  * Average score
  * Pass rate
  * Total submissions
```

#### B. Individual Student Grades
```
View from students page
URL: /dashboard/students/[studentId]/grades

Shows detailed breakdown for one student:
- Overall average
- Assignment grades (all)
- Quiz grades (all)
- Exam grades (all)
- Each shows: score, percentage, date, feedback
```

---

## Administrator Flow

### 1. **Login & Authentication**
```
Step 1: Navigate to Login Page
URL: http://localhost:3000/login

Step 2: Enter Credentials
- Email: admin@test.com
- Password: password123
- Role: Administrator

Step 3: System authenticates and redirects
- Redirects to: /dashboard/admin
```

### 2. **Admin Dashboard Overview**
```
Dashboard displays:
✓ Total Users (Students + Teachers + Admins)
✓ Total Students
✓ Total Teachers
✓ Total Administrators
✓ Total Assignments (system-wide)
✓ Total Quizzes (system-wide)
✓ Total Exams (system-wide)
✓ Total Submissions (system-wide)
✓ Recent Activity Log
```

### 3. **User Management**

#### A. View All Users
```
Navigate to: /dashboard/users
URL: /dashboard/admin/users

Shows table of all users:
- Username
- Full Name
- Email
- Role (Student/Teacher/Administrator)
- Status (Active/Inactive)
- Created Date
- Actions (Edit, Assign Teacher, Delete)

Can filter by:
- Role
- Status
- Search by name/email
```

#### B. Create New User Account
```
Navigate to: /dashboard/users/create
Click "Create New User" button

Form fields:
- Username (required, unique)
- Email (required, unique, valid email)
- Password (required, min 8 chars)
- First Name (required)
- Last Name (required)
- Role (required: Student/Teacher/Administrator)
- Assigned Teacher (if role is Student)

Step 1: Fill all required fields
Step 2: Select role
Step 3: If student, optionally assign teacher
Step 4: Click "Create Account"

System actions:
1. Validates all fields
2. Hashes password securely
3. Creates user account
4. Sends email to user with credentials
   - Subject: "Welcome to UPANG Learning System"
   - Body: Contains username, email, temp password
   - Includes link for password change
```

#### C. Edit User Account
```
Click "Edit" button on user row
URL: /dashboard/users/[userId]/edit

Form pre-filled with user data:
- Username
- Email
- First Name
- Last Name
- Role
- Status (Active/Inactive)
- Assigned Teacher (if student)

Can update:
- Basic info (name, email)
- Role (changes permissions)
- Status (activate/deactivate)
- Teacher assignment (for students)
- Password (optional)

Note: Changing role affects:
- Student → Teacher: Loses assigned teacher, gains ability to create assignments
- Teacher → Student: Loses created assignments/quizzes, needs teacher assignment
```

#### D. Assign/Unassign Teacher to Student
```
Method 1: During user creation
- Select teacher from dropdown when creating student account

Method 2: Edit existing student
- Open edit form
- Select teacher from dropdown
- Save

Method 3: Bulk assign
- Navigate to: /dashboard/users/assignments
- Select multiple students
- Choose teacher
- Click "Assign"
```

#### E. Delete User Account
```
Click "Delete" button on user row
- Shows confirmation dialog
- Warns about deleting all associated data:
  * If Student: Deletes submissions, grades
  * If Teacher: Orphans assignments/quizzes/exams
  * If Admin: No dependencies

Warning: This is a destructive action!
```

### 4. **View System-Wide Data**

#### A. View All Assignments
```
Navigate to: /dashboard/admin/assignments

Shows all assignments in system:
- Title
- Created by (Teacher name)
- Due Date
- Assigned to (count)
- Submissions count
- Status

Can filter by:
- Teacher
- Date range
- Status
```

#### B. View All Quizzes
```
Navigate to: /dashboard/admin/quizzes

Shows all quizzes in system:
- Title
- Created by (Teacher)
- Total Points
- Assigned to (count)
- Submissions count
```

#### C. View All Exams
```
Navigate to: /dashboard/admin/exams

Shows all exams in system:
- Title
- Created by (Teacher)
- Due Date
- Total Points
- Submissions count
```

#### D. View All Submissions
```
Navigate to: /dashboard/admin/submissions
URL: /dashboard/admin/submissions

Shows unified view of all submissions:
- Student name
- Task name
- Type (Assignment/Quiz/Exam)
- Submitted date
- Graded date
- Grade
- Status (Pending/Graded)

Can filter by:
- Type (Assignment/Quiz/Exam)
- Status (Pending/Graded)
- Student
- Teacher
- Date range
```

#### E. View Specific Submission Details
```
Click on submission row
URL: /dashboard/admin/submissions/[submissionId]

Shows:
- Student details
- Task details (assignment/quiz/exam)
- Submission file (can download)
- Submission date
- Graded date (if graded)
- Grade and feedback (if graded)
- Teacher who graded
```

### 5. **System Statistics & Reports**

#### A. Dashboard Analytics
```
Main dashboard shows:
- User counts by role
- Total tasks (assignments + quizzes + exams)
- Submission statistics
- Grading status (pending/completed)
- Recent user activity
- Average grade across system
```

#### B. Teacher Performance Report
```
View teacher statistics:
- Number of students assigned
- Number of assignments created
- Number of quizzes created
- Number of exams created
- Grading response time
- Average class grade

Navigate to: /dashboard/admin/teachers/[teacherId]/stats
```

#### C. Student Performance Report
```
View student statistics:
- Overall grade average
- Completion rate
- Submission timeliness
- Grade trend over time
- Assigned teacher

Navigate to: /dashboard/admin/students/[studentId]/stats
```

---

## Grade Calculation System

### Formula Overview
```
Final Grade = (Class Standing × 0.60) + (Exam Average × 0.40)

Where:
Class Standing = (Quiz Average × 0.45) + (Assignment Average × 0.15)

Breakdown:
1. Calculate category averages (Assignments, Quizzes, Exams)
2. Calculate Class Standing = (Quiz avg × 0.45) + (Assignment avg × 0.15)
3. Calculate Final Grade = (Class Standing × 0.60) + (Exam avg × 0.40)
```

### Example Calculation
```
Student has:
- Assignments: 30%, 50% → Average = 40%
- Quiz: 80%
- Exam: 90%

Step 1: Calculate Class Standing
Class Standing = (80 × 0.45) + (40 × 0.15)
              = 36 + 6
              = 42

Step 2: Calculate Final Grade
Final Grade = (42 × 0.60) + (90 × 0.40)
           = 25.2 + 36
           = 61.2 ≈ 61%
```

### Grade Conversion
```
Each submission is graded with raw points:
Example: Assignment scored 45 out of 50

Percentage = (45 / 50) × 100 = 90%

This 90% is used in the weighted calculation
```

### Letter Grades (for display)
```
A: 90-100%
B: 80-89%
C: 70-79%
F: Below 70% (failing)
```

### Special Cases
```
1. No items in category:
   - If no assignments exist: Assignment avg = 100%
   - If no quizzes exist: Quiz avg = 100%
   - If no exams exist: Exam avg = 100%

2. No graded submissions:
   - If category exists but nothing graded: avg = 0%
   - Overall average calculated with 0 for that category

3. Multiple submissions:
   - Each item is graded individually
   - Category average = sum of all percentages / count
   - Example: 3 assignments (80%, 90%, 70%)
     Assignment avg = (80 + 90 + 70) / 3 = 80%
```

### When Grades Update
```
1. Teacher grades submission
   - PUT /api/submissions/:submissionId/grade
   - Immediately recalculates category average
   - Recalculates overall average

2. Student views grades
   - GET /api/grades/student
   - Fetches latest calculations

3. Teacher views class statistics
   - GET /api/grades/teacher
   - Aggregates all student grades
   - Calculates class average using same formula
```

---

## Common User Journeys

### Journey 1: Student Completing Assignment
```
1. Login → Dashboard
2. See "Pending Assignment: Math Homework"
3. Click assignment
4. Read instructions
5. Download reference material
6. Complete work offline
7. Return to assignment page
8. Upload completed file
9. Click "Submit"
10. See "Submitted" status
11. Wait for teacher to grade
12. Receive email notification (if configured)
13. View grade and feedback in Grades page
```

### Journey 2: Teacher Creating and Grading Quiz
```
1. Login → Dashboard
2. Navigate to Quizzes
3. Click "Create New Quiz"
4. Enter title: "Chapter 5 Quiz"
5. Enter description and instructions
6. Set points: 100
7. Select students to assign to
8. Upload quiz questions document (PDF)
9. Click "Create Quiz"
10. Quiz appears in list

[Later, after students submit]
11. Navigate to quiz detail page
12. See list of submissions
13. Click on first submission
14. Download student's answer file
15. Review answers
16. Enter grade: 85
17. Write feedback: "Great work on questions 1-8!"
18. Click "Submit Grade"
19. Grade appears in student's record
20. Repeat for other submissions
```

### Journey 3: Admin Creating Teacher and Assigning Students
```
1. Login → Admin Dashboard
2. Navigate to Users
3. Click "Create New User"
4. Enter details:
   - Username: jane.smith
   - Email: jane.smith@school.com
   - Password: TempPass123
   - First Name: Jane
   - Last Name: Smith
   - Role: Teacher
5. Click "Create Account"
6. System sends email to Jane with credentials

[Later, assign students to Jane]
7. Navigate to Users page
8. Filter by role: Student
9. Select student "John Doe"
10. Click "Edit"
11. Select "Assigned Teacher": Jane Smith
12. Click "Save"
13. John Doe now has access to Jane's assignments

[Or bulk assign]
14. Select multiple students (checkboxes)
15. Click "Assign Teacher"
16. Select Jane Smith
17. Click "Assign"
18. All selected students assigned to Jane
```

---

## File Upload System

### Supported File Types
```
Assignments:
- PDF (.pdf)
- Word Documents (.doc, .docx)
- Images (.jpg, .jpeg, .png)

Quizzes:
- PDF (.pdf)
- Word Documents (.doc, .docx)
- Images (.jpg, .jpeg, .png)

Exams:
- Images (.jpg, .jpeg, .png)
- PDF (.pdf)
- Word Documents (.docx)
```

### File Storage
```
All files stored in MongoDB GridFS:
- Efficient storage for large files
- Streamed to client on download
- Automatic chunking

File metadata includes:
- Original filename
- MIME type
- Upload date
- Uploader (student/teacher)
- Associated task (assignment/quiz/exam)
```

### Download Files
```
API endpoints:
- GET /api/assignments/files/:fileId
- GET /api/quizzes/files/:fileId
- GET /api/exams/files/:fileId
- GET /api/submissions/files/:fileId

Response:
- File stream (binary data)
- Content-Type header (application/pdf, image/jpeg, etc.)
- Content-Disposition: attachment; filename="original_name.pdf"

Browser automatically triggers download
```

---

## Security & Permissions

### Role-Based Access Control (RBAC)
```
Routes are protected by middleware:
1. authMiddleware - Verifies JWT token
2. authorize(roles...) - Checks user role

Example:
router.get(
  '/assigned-students',
  authMiddleware,           // Must be authenticated
  authorize('teacher'),     // Must be a teacher
  TeacherController.getAssignedStudents
);
```

### Permission Matrix
```
| Feature                  | Student | Teacher | Admin |
|--------------------------|---------|---------|-------|
| View own dashboard       | ✓       | ✓       | ✓     |
| View assignments         | ✓ (own) | ✓ (all) | ✓     |
| Create assignments       | ✗       | ✓       | ✓     |
| Submit assignments       | ✓       | ✗       | ✗     |
| Grade submissions        | ✗       | ✓       | ✓     |
| View own grades          | ✓       | ✗       | ✗     |
| View all grades          | ✗       | ✓ (own) | ✓     |
| Create users             | ✗       | ✗       | ✓     |
| Edit users               | ✗       | ✗       | ✓     |
| Assign teachers          | ✗       | ✗       | ✓     |
| View system stats        | ✗       | ✗       | ✓     |
```

### Data Access Rules
```
Students can only:
- View assignments assigned to them
- Submit to their own assignments
- View their own grades
- View their assigned teacher

Teachers can only:
- View students assigned to them
- View/grade submissions from their students
- Create assignments for their students
- View grades for their students

Admins can:
- Access all data system-wide
- Manage all users
- View all assignments/quizzes/exams
- View all submissions and grades
```

---

This comprehensive guide covers all major flows and features of the UPANG Learning System. Each section can be used as a reference for understanding the application workflow and user training.
