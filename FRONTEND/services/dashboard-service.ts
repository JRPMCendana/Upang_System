import { apiClient } from "./api-client"
import type { StudentDashboardStats, TeacherDashboardStats } from "@/types/dashboard.types"
import { getToken } from "@/utils/storage.utils"

class DashboardService {
  /**
   * Get student dashboard statistics
   */
  async getStudentDashboard(): Promise<{ data: StudentDashboardStats }> {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      throw new Error("Cannot access localStorage on server")
    }

    const token = getToken()
    if (!token) {
      throw new Error("No authentication token found")
    }

    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const response = await fetch(`${baseURL}/api/dashboard/student`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch student dashboard")
    }

    return response.json()
  }

  /**
   * Get teacher dashboard statistics
   */
  async getTeacherDashboard(): Promise<{ data: TeacherDashboardStats }> {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      throw new Error("Cannot access localStorage on server")
    }

    const token = getToken()
    if (!token) {
      throw new Error("No authentication token found")
    }

    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const response = await fetch(`${baseURL}/dashboard/teacher`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch teacher dashboard")
    }

    return response.json()
  }
}

export const dashboardService = new DashboardService()
export type { StudentDashboardStats, TeacherDashboardStats }
