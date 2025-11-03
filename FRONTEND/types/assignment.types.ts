// Assignment Domain Types

export interface AssignmentUser {
  _id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
}

export interface Assignment {
  _id: string
  id: string
  courseId: string
  course?: AssignmentCourse
  title: string
  description: string
  instructions?: string
  dueDate: string
  totalPoints?: number
  status: "pending" | "submitted" | "graded" | "late" // Updated to match backend
  attachments?: string[]
  submissionType: "file" | "text" | "link"
  allowLateSubmission?: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
  // Backend-specific properties
  assignedBy?: string | AssignmentUser
  assignedTo?: string[] | AssignmentUser[]
  document?: string
  documentName?: string
  documentType?: string
  // Student-specific properties
  submission?: {
    _id: string
    isSubmitted: boolean
    submittedAt?: string
    grade?: number | null
    feedback?: string | null
    gradedAt?: string | null
    submittedDocument?: string
    submittedDocumentName?: string
  } | null
  submissionStats?: {
    total: number
    submitted: number
    graded: number
    pending: number
  }
}

export interface AssignmentCourse {
  _id: string
  title: string
  code?: string
}

export interface AssignmentSubmission {
  _id: string
  assignmentId: string
  studentId: string
  student?: SubmissionStudent
  submittedAt: string
  fileUrl?: string
  textContent?: string
  linkUrl?: string
  status: "submitted" | "graded" | "late"
  grade?: number
  feedback?: string
  gradedAt?: string
  gradedBy?: string
}

export interface SubmissionStudent {
  _id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
}

export interface CreateAssignmentData {
  courseId: string
  title: string
  description: string
  instructions?: string
  dueDate: string
  totalPoints?: number
  submissionType?: "file" | "text" | "link"
  allowLateSubmission?: boolean
}

export interface UpdateAssignmentData {
  title?: string
  description?: string
  instructions?: string
  dueDate?: string
  totalPoints?: number
  status?: "pending" | "submitted" | "graded" | "late" // Updated to match backend
  allowLateSubmission?: boolean
}

export interface SubmitAssignmentData {
  file?: File
  textContent?: string
  linkUrl?: string
}

export interface GradeAssignmentData {
  grade: number
  feedback?: string
}

export interface AssignmentFilters {
  courseId?: string
  status?: "pending" | "submitted" | "graded" | "overdue"
  dueAfter?: string
  dueBefore?: string
}

export interface GetAssignmentsResponse {
  success: boolean
  data: Assignment[]
  pagination?: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export interface GetAssignmentResponse {
  success: boolean
  data: Assignment
}

export interface CreateAssignmentResponse {
  success: boolean
  message: string
  data: Assignment
}

export interface UpdateAssignmentResponse {
  success: boolean
  message: string
  data: Assignment
}

export interface SubmitAssignmentResponse {
  success: boolean
  message: string
  data: AssignmentSubmission
}

export interface GradeAssignmentResponse {
  success: boolean
  message: string
  data: AssignmentSubmission
}

export interface GetSubmissionsResponse {
  success: boolean
  data: AssignmentSubmission[]
}

// Assignment statistics
export interface AssignmentStats {
  totalAssignments: number
  pending: number
  submitted: number
  graded: number
  overdue: number
  averageGrade?: number
}
