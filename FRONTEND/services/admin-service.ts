// Admin Service - Infrastructure Layer
// Handles API communication for admin operations

import { apiClient } from "./api-client"

export interface SystemStatistics {
  filesUploaded: number
  totalSubmissions: number
  averageScore: number
  breakdown?: {
    assignmentSubmissions: number
    quizSubmissions: number
    gradedAssignments: number
    gradedQuizzes: number
  }
}

interface SystemStatisticsResponse {
  success: boolean
  data: SystemStatistics
}

class AdminService {
  /**
   * Get system-wide statistics (files, submissions, average score)
   */
  async getSystemStatistics(): Promise<SystemStatistics> {
    const response = await apiClient.request<SystemStatisticsResponse>(
      "/admin/statistics",
      { method: "GET" }
    )
    return response.data
  }
}

export const adminService = new AdminService()
