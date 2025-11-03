// Submission Service - Infrastructure Layer
// Handles API communication for admin submission operations

import { apiClient } from "./api-client"

export interface Submission {
  _id: string
  type: "assignment" | "quiz" | "exam"
  activity: string
  activityId: string
  description?: string
  student: string
  studentId: string
  studentEmail?: string
  studentUsername?: string
  submittedAt: string
  grade: number | null
  maxGrade: number
  feedback?: string | null
  gradedAt?: string | null
  status: "pending" | "submitted" | "graded" | "due"
  dueDate?: string
  submittedDocument?: string
  submittedDocumentName?: string
  assignedBy?: {
    _id: string
    firstName: string
    lastName: string
    email: string
    username: string
  }
}

export interface SubmissionsResponse {
  success: boolean
  data: Submission[]
  pagination: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  breakdown: {
    totalAssignments: number
    totalQuizzes: number
    totalExams: number
    total: number
  }
}

export interface SubmissionDetailResponse {
  success: boolean
  data: any
}

class SubmissionService {
  /**
   * Get all submissions with filtering and pagination
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   * @param type - Filter by type: 'assignment', 'quiz', or 'all' (default: 'all')
   * @param status - Filter by status: 'graded', 'pending', or 'all' (default: 'all')
   * @param search - Search query for student name or activity title
   */
  async getAllSubmissions(
    page: number = 1,
    limit: number = 10,
    type: string = "all",
    status: string = "all",
    search: string = ""
  ): Promise<SubmissionsResponse> {
    const params: Record<string, any> = { page, limit }
    
    if (type && type !== "all") params.type = type
    if (status && status !== "all") params.status = status
    if (search && search.trim() !== "") params.search = search.trim()

    const response = await apiClient.request<SubmissionsResponse>(
      "/admin/submissions",
      { method: "GET", params }
    )
    return response
  }

  /**
   * Get submission detail by ID
   * @param submissionId - Submission ID
   * @param type - Type: 'assignment', 'quiz', or 'exam'
   */
  async getSubmissionById(
    submissionId: string,
    type: "assignment" | "quiz" | "exam"
  ): Promise<any> {
    const response = await apiClient.request<SubmissionDetailResponse>(
      `/admin/submissions/${submissionId}`,
      { method: "GET", params: { type } }
    )
    return response.data
  }
}

export const submissionService = new SubmissionService()
