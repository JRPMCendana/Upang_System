// Quiz Domain Types
// Aligned with backend Quiz.model.js schema

export interface Quiz {
  _id: string
  title: string
  description: string
  quizLink?: string
  dueDate?: string
  totalPoints?: number
  assignedBy: {
    _id: string
    firstName: string
    lastName: string
    email: string
    username: string
  }
  assignedTo: Array<{
    _id: string
    firstName: string
    lastName: string
    email: string
    username: string
  }>
  document: string | null
  documentName: string | null
  documentType: string | null
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
  
  // Aggregated fields from submissions (for student view)
  submission?: {
    _id: string
    isSubmitted: boolean
    submittedAt?: string
    grade?: number | null
    feedback?: string | null
    gradedAt?: string | null
    submittedDocument?: string
    submittedDocumentName?: string
    submittedDocumentType?: string
  } | null
  
  // Statistics (for teacher view)
  submissionStats?: {
    total: number
    submitted: number
    graded: number
    pending: number
  }
}

export interface QuizSubmission {
  _id: string
  quiz: string | Quiz
  student: {
    _id: string
    firstName: string
    lastName: string
    email: string
    username: string
  }
  submittedDocument: string | null
  submittedDocumentName: string | null
  submittedDocumentType: string | null
  fileUrl?: string // Legacy field
  isSubmitted: boolean
  submittedAt: string | null
  grade: number | null
  feedback: string | null
  gradedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateQuizData {
  title: string
  description: string
  quizLink?: string
  dueDate?: string
  totalPoints?: number
  studentIds: string[]
}

export interface UpdateQuizData {
  title?: string
  description?: string
  quizLink?: string
  dueDate?: string
  totalPoints?: number
  studentIds?: string[]
  status?: "active" | "inactive"
}

export interface SubmitQuizData {
  file: File
}

export interface GradeQuizData {
  grade: number
  feedback?: string
}

export interface GetQuizzesResponse {
  success: boolean
  data: Quiz[]
  pagination?: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
  }
}
