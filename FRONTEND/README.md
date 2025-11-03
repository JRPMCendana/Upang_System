# UPANG Learning System - Frontend

A modern, responsive web application built with Next.js 16 for the UPANG Learning Management System. This frontend provides intuitive interfaces for students, teachers, and administrators to manage assignments, quizzes, exams, and grades.

## 🚀 Features

### For Students
- 📚 View and submit assignments, quizzes, and exams
- 📊 Track grades and academic performance
- 📈 Visualize grade trends over time
- 👨‍🏫 View assigned teacher information
- 📝 Access learning materials and course content

### For Teachers
- ✍️ Create and manage assignments, quizzes, and exams
- 👥 Manage assigned students
- ✅ Grade student submissions with feedback
- 📊 View class performance statistics
- 📈 Track student progress and grade distributions
- 📅 Upcoming activities dashboard

### For Administrators
- 👤 Manage user accounts (students, teachers, admins)
- 🔗 Assign teachers to students
- 📊 View system-wide statistics and reports
- 📋 Monitor all submissions and grades
- 🔍 Access comprehensive analytics

## 🛠️ Technology Stack

- **Framework**: [Next.js 16.0.0](https://nextjs.org/) with App Router
- **Language**: TypeScript 5
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS 4.1.9 + shadcn/ui components
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Animations**: Framer Motion
- **HTTP Client**: Custom API client with fetch
- **State Management**: React Context API
- **Package Manager**: pnpm (recommended) or npm

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.17.0 or higher (v20+ recommended)
- **pnpm**: v8.0.0 or higher (recommended) or npm
- **Backend Server**: The backend API must be running (see [BACKEND/README.md](../BACKEND/README.md))

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/JRPMCendana/Upang_System.git
cd Upang_System/FRONTEND
```

### 2. Install Dependencies

Using **pnpm** (recommended):
```bash
pnpm install
```

Or using **npm**:
```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the FRONTEND directory:

```bash
# Copy the example environment file
cp .env.local.example .env.local
```

Or create it manually with the following content:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Optional: Analytics (if using Vercel Analytics)
# NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

**Environment Variables Explained:**

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000/api` |

> **Note**: The `NEXT_PUBLIC_` prefix makes the variable accessible in the browser. Never put sensitive secrets here.

### 4. Verify Backend Connection

Ensure your backend server is running:

```bash
# In a separate terminal, navigate to BACKEND directory
cd ../BACKEND
npm run dev
```

The backend should be running on `http://localhost:5000` (or the port specified in your backend `.env` file).

## 🚀 Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
pnpm dev
```

Or with npm:
```bash
npm run dev
```

The application will be available at **http://localhost:3000**

### Production Build

Build the application for production:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

### Linting

Run ESLint to check for code quality issues:

```bash
pnpm lint
```

## 🧪 Test Accounts

Use these accounts to test different user roles:

### Student Account
- **Email**: `student@test.com`
- **Password**: `password123`
- **Access**: Submit assignments, take quizzes/exams, view grades

### Teacher Account
- **Email**: `teacher@test.com`
- **Password**: `password123`
- **Access**: Create assignments/quizzes/exams, grade submissions, view student performance

### Administrator Account
- **Email**: `admin@test.com`
- **Password**: `password123`
- **Access**: Full system access, user management, system statistics

## 📁 Project Structure

```
FRONTEND/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Authentication pages (login, register)
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Dashboard layout wrapper
│   │   └── layout.tsx           # Shared dashboard layout
│   ├── dashboard/               # Protected dashboard pages
│   │   ├── admin/              # Admin-specific pages
│   │   ├── teacher/            # Teacher-specific pages
│   │   ├── student/            # Student-specific pages
│   │   ├── assignments/        # Assignment management
│   │   ├── quizzes/            # Quiz management
│   │   ├── exams/              # Exam management
│   │   ├── grades/             # Grade viewing pages
│   │   ├── students/           # Student management
│   │   └── users/              # User management (admin)
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
│
├── components/                  # React components
│   ├── ui/                     # shadcn/ui components (buttons, inputs, dialogs, etc.)
│   ├── dashboard/              # Dashboard-specific components
│   │   ├── header.tsx         # Dashboard header
│   │   └── sidebar.tsx        # Navigation sidebar
│   ├── dialogs/                # Modal dialogs
│   │   ├── create-assignment-dialog.tsx
│   │   ├── create-quiz-dialog.tsx
│   │   ├── create-exam-dialog.tsx
│   │   ├── edit-*.tsx         # Edit dialogs
│   │   └── submit-*.tsx       # Submission dialogs
│   ├── forms/                  # Form components
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   └── ...
│   └── skeletons/              # Loading skeleton components
│
├── hooks/                       # Custom React hooks
│   ├── use-auth.ts             # Authentication hook
│   ├── use-assignments.ts      # Assignments data hook
│   ├── use-quizzes.ts          # Quizzes data hook
│   ├── use-exams.ts            # Exams data hook
│   ├── use-grades.ts           # Grades data hook
│   ├── use-users.ts            # User management hook
│   └── ...
│
├── lib/                         # Utility libraries
│   ├── auth-context.tsx        # Authentication context provider
│   └── utils.ts                # Utility functions (cn helper, etc.)
│
├── services/                    # API service layer
│   ├── api-client.ts           # Base API client (fetch wrapper)
│   ├── auth-service.ts         # Authentication API calls
│   ├── assignment-service.ts   # Assignment API calls
│   ├── quiz-service.ts         # Quiz API calls
│   ├── exam-service.ts         # Exam API calls
│   ├── grade-service.ts        # Grade API calls
│   ├── user-service.ts         # User management API calls
│   └── ...
│
├── types/                       # TypeScript type definitions
│   ├── user.types.ts           # User-related types
│   ├── assignment.types.ts     # Assignment types
│   ├── quiz.types.ts           # Quiz types
│   ├── exam.types.ts           # Exam types
│   ├── grade.types.ts          # Grade types
│   └── api.types.ts            # API response types
│
├── utils/                       # Utility functions
│   ├── date.utils.ts           # Date formatting helpers
│   ├── grade.utils.ts          # Grade calculation helpers
│   ├── token.utils.ts          # JWT token utilities
│   ├── storage.utils.ts        # LocalStorage helpers
│   └── validation.utils.ts     # Form validation helpers
│
├── public/                      # Static assets
│   └── res/                    # Resources (images, logos)
│       └── PHINMA-Logo.png
│
├── .env.local                   # Environment variables (not in git)
├── .gitignore                  # Git ignore rules
├── components.json             # shadcn/ui configuration
├── next.config.mjs             # Next.js configuration
├── package.json                # Dependencies and scripts
├── postcss.config.mjs          # PostCSS configuration
├── tailwind.config.ts          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

## 🎨 UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) - a collection of beautifully designed, accessible components built with Radix UI and Tailwind CSS.

### Available Components

The following shadcn/ui components are installed and ready to use:

- **Form Controls**: Button, Input, Label, Select, Checkbox, Radio Group, Switch, Slider, Textarea
- **Data Display**: Table, Card, Badge, Avatar, Separator, Tabs, Accordion
- **Feedback**: Toast, Alert Dialog, Dialog, Dropdown Menu, Popover, Tooltip, Progress
- **Navigation**: Navigation Menu, Menubar, Breadcrumb, Pagination
- **Overlays**: Sheet, Drawer, Command, Context Menu
- **Layout**: Scroll Area, Resizable Panels, Collapsible
- **Charts**: Recharts integration for data visualization

### Adding New Components

To add a new shadcn/ui component:

```bash
pnpm dlx shadcn@latest add [component-name]
```

Example:
```bash
pnpm dlx shadcn@latest add calendar
```

## 🔐 Authentication Flow

### 1. User Login
```typescript
import { useAuth } from '@/lib/auth-context'

function LoginComponent() {
  const { login } = useAuth()
  
  const handleLogin = async (email: string, password: string, role: UserRole) => {
    await login(email, password, role)
    // Redirects to appropriate dashboard based on role
  }
}
```

### 2. Protected Routes

Protected routes automatically redirect unauthenticated users to the login page:

```typescript
// app/dashboard/layout.tsx
'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardLayout({ children }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) return <LoadingScreen />
  if (!user) return null

  return <>{children}</>
}
```

### 3. JWT Token Management

Tokens are automatically managed by the API client:

```typescript
// services/api-client.ts
class ApiClient {
  setToken(token: string) {
    localStorage.setItem('token', token)
  }

  getToken() {
    return localStorage.getItem('token')
  }

  clearToken() {
    localStorage.removeItem('token')
  }
}
```

## 📡 API Integration

### API Client

The application uses a centralized API client for all HTTP requests:

```typescript
// services/api-client.ts
import { apiClient } from './api-client'

// Example GET request
const assignments = await apiClient.request('/assignments', {
  method: 'GET'
})

// Example POST request
const newAssignment = await apiClient.request('/assignments', {
  method: 'POST',
  body: {
    title: 'Homework 1',
    description: 'Complete exercises 1-10',
    dueDate: '2025-11-10',
    totalPoints: 100
  }
})
```

### Custom Hooks for Data Fetching

Use custom hooks for consistent data fetching patterns:

```typescript
// hooks/use-assignments.ts
import { useAssignments } from '@/hooks/use-assignments'

function AssignmentsList() {
  const { assignments, loading, error, refetch } = useAssignments()

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorMessage error={error} />

  return (
    <div>
      {assignments.map(assignment => (
        <AssignmentCard key={assignment.id} assignment={assignment} />
      ))}
    </div>
  )
}
```

## 🎯 Key Features Implementation

### Grade Calculation Display

Grades are calculated using a weighted formula:
- **Class Standing (60%)**: 45% Quizzes + 15% Assignments
- **Exams (40%)**

The calculation is performed on the backend, and the frontend displays the results:

```typescript
// components/grades/grade-summary.tsx
import { useGradeStats } from '@/hooks/use-grade-stats'

function GradeSummary() {
  const { stats, loading } = useGradeStats()

  return (
    <div>
      <h2>Overall Average: {stats.overallAverage}%</h2>
      <p>Class Standing: {stats.classStanding}%</p>
      <p>Exam Average: {stats.examAverage}%</p>
    </div>
  )
}
```

### File Upload

File uploads use FormData for multipart form submissions:

```typescript
// Example: Submitting an assignment with file
const handleSubmit = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  await apiClient.request(`/submissions/${assignmentId}/submit`, {
    method: 'POST',
    body: formData,
    headers: {
      // Don't set Content-Type - browser will set it with boundary
    }
  })
}
```

### Real-time Toast Notifications

Toast notifications provide user feedback:

```typescript
import { useToast } from '@/hooks/use-toast'

function Component() {
  const { toast } = useToast()

  const handleSuccess = () => {
    toast({
      title: "Success",
      description: "Assignment submitted successfully!",
      variant: "default"
    })
  }

  const handleError = () => {
    toast({
      title: "Error",
      description: "Failed to submit assignment. Please try again.",
      variant: "destructive"
    })
  }
}
```

## 🎨 Styling Guidelines

### Tailwind CSS Classes

Use Tailwind utility classes for styling:

```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
  <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
  <Button className="bg-primary hover:bg-primary/90">Create New</Button>
</div>
```

### Custom CSS Variables

Theme colors are defined in `globals.css`:

```css
:root {
  --primary: 217.2 91.2% 59.8%;
  --secondary: 142.1 76.2% 36.3%;
  --accent: 142.1 70.6% 45.3%;
  /* ... more colors */
}
```

### Dark Mode Support

The application supports dark mode via `next-themes`:

```tsx
import { useTheme } from 'next-themes'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  )
}
```

## 🧪 Development Tips

### Hot Reload

Next.js supports automatic hot reload. Changes to files will automatically refresh the browser.

### TypeScript Checking

Run TypeScript type checking:

```bash
pnpm tsc --noEmit
```

### Code Formatting

Use Prettier for consistent code formatting:

```bash
pnpm prettier --write .
```

### Component Development

When creating new components:

1. Place in appropriate directory (`components/`, `components/ui/`, `components/forms/`)
2. Use TypeScript for type safety
3. Export as default or named export
4. Add JSDoc comments for complex components
5. Use React.memo() for performance when needed

### Custom Hook Development

When creating custom hooks:

1. Place in `hooks/` directory
2. Prefix with `use-` (e.g., `use-assignments.ts`)
3. Return consistent data structure: `{ data, loading, error, refetch }`
4. Handle loading and error states
5. Use React Query pattern if implementing caching

## 📦 Building for Production

### Build the Application

```bash
pnpm build
```

This creates an optimized production build in the `.next` directory.

### Analyze Bundle Size

Inspect the bundle size:

```bash
pnpm build
# Next.js automatically shows bundle analysis
```

### Production Checklist

Before deploying to production:

- [ ] Set `NEXT_PUBLIC_API_URL` to production backend URL
- [ ] Enable `typescript.ignoreBuildErrors: false` in `next.config.mjs`
- [ ] Test all user flows (student, teacher, admin)
- [ ] Verify authentication and authorization
- [ ] Test file uploads and downloads
- [ ] Check responsive design on mobile/tablet
- [ ] Verify environment variables are set correctly
- [ ] Run production build locally: `pnpm build && pnpm start`
- [ ] Test in different browsers (Chrome, Firefox, Safari, Edge)

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
Error: Port 3000 is already in use
```

**Solution**: Kill the process or use a different port:
```bash
# Use different port
PORT=3001 pnpm dev

# Or kill existing process (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### API Connection Failed
```bash
Error: Failed to fetch from http://localhost:5000/api
```

**Solution**: 
1. Ensure backend server is running
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Verify CORS is configured in backend

#### Environment Variables Not Working
```bash
Error: NEXT_PUBLIC_API_URL is undefined
```

**Solution**:
1. Restart dev server after changing `.env.local`
2. Verify variable name has `NEXT_PUBLIC_` prefix
3. Check file is named `.env.local` (not `.env`)

#### Build Errors
```bash
Type error: Property 'X' does not exist on type 'Y'
```

**Solution**:
1. Check type definitions in `types/` directory
2. Install missing type packages: `pnpm add -D @types/package-name`
3. Temporarily ignore with `// @ts-ignore` (not recommended)

## 🤝 Contributing

### Development Workflow

1. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit:
```bash
git add .
git commit -m "feat: add new feature"
```

3. Push to your branch:
```bash
git push origin feature/your-feature-name
```

4. Create a Pull Request on GitHub

### Commit Message Convention

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)

## 📄 License

This project is private and confidential. Unauthorized copying or distribution is prohibited.

## 👥 Support

For issues, questions, or contributions:

- Create an issue on GitHub
- Contact the development team
- Refer to the [Application Flow Guide](../APP_FLOW_GUIDE.md) for detailed user flows

---

**Built with ❤️ using Next.js, React, and TypeScript**
