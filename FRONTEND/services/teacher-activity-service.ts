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
   * @param page - Page number
   * @param limit - Items per page
   * @param teacherId - Optional teacher ID to filter by
   */
  async getAllAssignments(page: number = 1, limit: number = 10, teacherId?: string): Promise<any> {
    const params: any = { page, limit }
    if (teacherId) {
      params.teacherId = teacherId
    }
    const response = await apiClient.request<any>(
      "/admin/assignments",
      { method: "GET", params }
    )
    return response
  }

  /**
   * Get all quizzes created by teachers
   * @param page - Page number
   * @param limit - Items per page
   * @param teacherId - Optional teacher ID to filter by
   */
  async getAllQuizzes(page: number = 1, limit: number = 10, teacherId?: string): Promise<any> {
    const params: any = { page, limit }
    if (teacherId) {
      params.teacherId = teacherId
    }
    const response = await apiClient.request<any>(
      "/admin/quizzes",
      { method: "GET", params }
    )
    return response
  }
}

export const teacherActivityService = new TeacherActivityService()
