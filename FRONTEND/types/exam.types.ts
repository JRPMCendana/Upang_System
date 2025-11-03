// Exam Domain Types

export interface Exam {
  _id: string
  title: string
  description: string
  dueDate: string | null
  totalPoints: number
  assignedBy: {
    _id: string
    firstName?: string
    lastName?: string
    email?: string
    username?: string
  }
  assignedTo: string[]
  document?: string | null
  documentName?: string | null
  documentType?: string | null
  createdAt: string
  updatedAt?: string
}

export interface ExamSubmission {
  _id: string
  exam: string | Exam
  student: {
    _id: string
    firstName?: string
    lastName?: string
    username?: string
    email?: string
  }
  isSubmitted: boolean
  submittedAt: string | null
  grade: number | null
  gradedAt: string | null
  feedback: string | null
  submittedDocument?: string | null
  submittedDocumentName?: string | null
  submittedDocumentType?: string | null
  status?: 'pending' | 'submitted' | 'graded' | 'due'
  createdAt?: string
  updatedAt?: string
}

export interface CreateExamData {
  title: string
  description: string
  dueDate?: string | null
  totalPoints?: number
  studentIds: string[]
}

export interface UpdateExamData {
  title?: string
  description?: string
  dueDate?: string | null
  totalPoints?: number
  studentIds?: string[]
}

export interface SubmitExamData {
  file: File
}

export interface GradeExamData {
  grade: number
  feedback?: string | null
}

export interface GetExamsResponse {
  data: Exam[]
  pagination: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage?: boolean
    hasPrevPage?: boolean
  }
}

export interface GetExamSubmissionsResponse {
  data: ExamSubmission[]
  pagination: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage?: boolean
    hasPrevPage?: boolean
  }
}

