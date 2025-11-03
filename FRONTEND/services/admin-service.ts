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

  /**
   * Export data to CSV
   * @param endpoint - The export endpoint (e.g., 'users', 'assignments', 'student-grades')
   * @param filename - The filename for the downloaded file
   */
  async exportToCSV(endpoint: string, filename: string): Promise<void> {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
    
    if (!token) {
      throw new Error("No authentication token found")
    }

    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
    const url = `${baseURL}/admin/export/${endpoint}`

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`)
      }

      // Get the blob from response
      const blob = await response.blob()
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error("Export error:", error)
      throw error
    }
  }

  /**
   * Export all users to CSV
   */
  async exportUsers(): Promise<void> {
    return this.exportToCSV("users", "users")
  }

  /**
   * Export all assignments to CSV
   */
  async exportAssignments(): Promise<void> {
    return this.exportToCSV("assignments", "assignments")
  }

  /**
   * Export all quizzes to CSV
   */
  async exportQuizzes(): Promise<void> {
    return this.exportToCSV("quizzes", "quizzes")
  }

  /**
   * Export all exams to CSV
   */
  async exportExams(): Promise<void> {
    return this.exportToCSV("exams", "exams")
  }

  /**
   * Export all assignment submissions to CSV
   */
  async exportAssignmentSubmissions(): Promise<void> {
    return this.exportToCSV("assignment-submissions", "assignment-submissions")
  }

  /**
   * Export all quiz submissions to CSV
   */
  async exportQuizSubmissions(): Promise<void> {
    return this.exportToCSV("quiz-submissions", "quiz-submissions")
  }

  /**
   * Export all exam submissions to CSV
   */
  async exportExamSubmissions(): Promise<void> {
    return this.exportToCSV("exam-submissions", "exam-submissions")
  }

  /**
   * Export comprehensive student grades report to CSV
   */
  async exportStudentGrades(): Promise<void> {
    return this.exportToCSV("student-grades", "student-grades")
  }

  /**
   * Export system statistics to CSV
   */
  async exportSystemStatistics(): Promise<void> {
    return this.exportToCSV("system-statistics", "system-statistics")
  }

  /**
   * Export teacher activity summary to CSV
   */
  async exportTeacherActivity(): Promise<void> {
    return this.exportToCSV("teacher-activity", "teacher-activity")
  }

  // ============================================
  // KPI-SPECIFIC EXPORTS
  // ============================================

  /**
   * KPI #1: Export quiz performance by topic (Bar Chart data)
   * Single CSV with all quiz topics and average scores
   */
  async exportKPI_QuizPerformanceByTopic(): Promise<void> {
    return this.exportToCSV("kpi/quiz-performance-by-topic", "kpi-quiz-performance-by-topic")
  }

  /**
   * KPI #2: Export submission timeliness (Doughnut Chart data)
   * Single CSV with on-time, late, not submitted counts
   */
  async exportKPI_SubmissionTimeliness(): Promise<void> {
    return this.exportToCSV("kpi/submission-timeliness", "kpi-submission-timeliness")
  }

  /**
   * KPI #3: Export weekly content activity (Column Chart data)
   * Single CSV with assignments/quizzes/exams per week
   * @param weeks - Number of weeks to include (default: 12)
   */
  async exportKPI_WeeklyContentActivity(weeks: number = 12): Promise<void> {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
    
    if (!token) {
      throw new Error("No authentication token found")
    }

    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
    const url = `${baseURL}/admin/export/kpi/weekly-content-activity?weeks=${weeks}`

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`)
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = `kpi-weekly-content-activity-${weeks}weeks-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error("Export error:", error)
      throw error
    }
  }
}

export const adminService = new AdminService()
