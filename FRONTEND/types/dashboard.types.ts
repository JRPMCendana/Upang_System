// Dashboard Domain Types

export interface StudentDashboardStats {
  pendingAssignments: number
  pendingQuizzes: number
  lateAssignments: number
  averageGrade: number
  completionRate: number
  totalAssignments: number
  totalQuizzes: number
  completedAssignments: number
  completedQuizzes: number
  recentAssignments: RecentAssignment[]
}

export interface RecentAssignment {
  _id: string
  title: string
  description: string
  dueDate: string
  assignedBy: {
    _id: string
    firstName: string
    lastName: string
  }
  status: 'pending' | 'submitted' | 'graded' | 'late'
  submission: {
    _id: string
    isSubmitted: boolean
    submittedAt?: string
    grade?: number | null
    feedback?: string | null
    gradedAt?: string | null
  } | null
}

export interface TeacherDashboardStats {
  totalStudents: number
  totalAssignments: number
  totalQuizzes: number
  totalTasks: number
  pendingGrading: number
  pendingAssignmentGrading: number
  pendingQuizGrading: number
  totalSubmissions: number
  gradedSubmissions: number
  averageClassGrade: number
  recentSubmissions: RecentSubmission[]
  students: StudentInfo[]
}

export interface RecentSubmission {
  _id: string
  assignment: {
    _id: string
    title: string
    dueDate: string
  }
  student: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  submittedAt: string
  type: 'assignment' | 'quiz'
}

export interface StudentInfo {
  _id: string
  name: string
  email: string
}
