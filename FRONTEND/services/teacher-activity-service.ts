// Teacher Activity Service - Infrastructure Layer
// Handles API communication for teacher assignments and quizzes

import { apiClient } from "./api-client"

export interface TeacherActivity {
  _id: string
  type: "assignment" | "quiz"
  title: string
  description?: string
  dueDate?: string
  createdAt: string
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
  totalPoints?: number
  maxGrade?: number
  quizLink?: string
  document?: string
  documentName?: string
}

export interface TeacherActivitiesResponse {
  success: boolean
  assignments: any[]
  quizzes: any[]
  assignmentsPagination: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  quizzesPagination: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

class TeacherActivityService {
  /**
   * Get all assignments created by teachers
   */
  async getAllAssignments(page: number = 1, limit: number = 10): Promise<any> {
    const response = await apiClient.request<any>(
      "/admin/assignments",
      { method: "GET", params: { page, limit } }
    )
    return response
  }

  /**
   * Get all quizzes created by teachers
   */
  async getAllQuizzes(page: number = 1, limit: number = 10): Promise<any> {
    const response = await apiClient.request<any>(
      "/admin/quizzes",
      { method: "GET", params: { page, limit } }
    )
    return response
  }
}

export const teacherActivityService = new TeacherActivityService()
