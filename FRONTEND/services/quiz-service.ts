// Quiz Management Service
// Aligned with backend quiz.service.js and quiz-submission.service.js

import { apiClient } from "./api-client"
import type {
  Quiz,
  QuizSubmission,
  CreateQuizData,
  UpdateQuizData,
  GradeQuizData,
  GetQuizzesResponse,
} from "@/types/quiz.types"

// Re-export types for backward compatibility
export type {
  Quiz,
  QuizSubmission,
  CreateQuizData,
  UpdateQuizData,
  GradeQuizData,
} from "@/types/quiz.types"

class QuizService {
  private getBaseURL(): string {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
  }

  private getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken")
    }
    return null
  }

  /**
   * Get all quizzes with pagination
   */
  async getQuizzes(page: number = 1, limit: number = 10): Promise<GetQuizzesResponse> {
    return apiClient.request<GetQuizzesResponse>("/quizzes", {
      params: { page, limit },
    })
  }

  /**
   * Get quiz by ID
   */
  async getQuizById(quizId: string): Promise<{ success: boolean; data: Quiz }> {
    return apiClient.request<{ success: boolean; data: Quiz }>(`/quizzes/${quizId}`)
  }

  /**
   * Create new quiz (Teacher only)
   */
  async createQuiz(
    data: CreateQuizData & { studentIds: string[] },
    file?: File
  ): Promise<{ success: boolean; message: string; data: Quiz }> {
    const formData = new FormData()

    formData.append("title", data.title)
    formData.append("description", data.description)
    formData.append("studentIds", JSON.stringify(data.studentIds))

    if (file) {
      formData.append("file", file)
    }

    const token = this.getAuthToken()
    const response = await fetch(`${this.getBaseURL()}/quizzes`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create quiz")
    }

    return response.json()
  }

  /**
   * Update quiz (Teacher only)
   */
  async updateQuiz(
    id: string,
    data: Partial<Quiz>,
    file?: File
  ): Promise<{ success: boolean; message: string; data: Quiz }> {
    const formData = new FormData()

    if (data.title) formData.append("title", data.title)
    if (data.description) formData.append("description", data.description)
    if (data.status) formData.append("status", data.status)

    if (file) {
      formData.append("file", file)
    }

    const token = this.getAuthToken()
    const response = await fetch(`${this.getBaseURL()}/quizzes/${id}`, {
      method: "PUT",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update quiz")
    }

    return response.json()
  }

  /**
   * Delete quiz (Teacher only)
   */
  async deleteQuiz(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.request<{ success: boolean; message: string }>(`/quizzes/${id}`, {
      method: "DELETE",
    })
  }

  /**
   * Submit quiz (Student only)
   */
  async submitQuiz(id: string, file: File): Promise<{ success: boolean; message: string; data: QuizSubmission }> {
    const formData = new FormData()
    formData.append("file", file)

    const token = this.getAuthToken()
    const response = await fetch(`${this.getBaseURL()}/quiz-submissions/${id}/submit`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to submit quiz")
    }

    return response.json()
  }

  /**
   * Unsubmit quiz (Student only)
   */
  async unsubmitQuiz(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.request<{ success: boolean; message: string }>(
      `/quiz-submissions/${id}/unsubmit`,
      {
        method: "POST",
      }
    )
  }

  /**
   * Replace quiz submission (Student only)
   */
  async replaceSubmission(
    id: string,
    file: File
  ): Promise<{ success: boolean; message: string; data: QuizSubmission }> {
    const formData = new FormData()
    formData.append("file", file)

    const token = this.getAuthToken()
    const response = await fetch(`${this.getBaseURL()}/quiz-submissions/${id}/replace`, {
      method: "PUT",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to replace submission")
    }

    return response.json()
  }

  /**
   * Get student's own submission (Student only)
   */
  async getMySubmission(
    quizId: string
  ): Promise<{ success: boolean; data: QuizSubmission | null }> {
    return apiClient.request<{ success: boolean; data: QuizSubmission | null }>(
      `/quiz-submissions/${quizId}/my-submission`
    )
  }

  /**
   * Get all submissions for a quiz (Teacher only)
   */
  async getSubmissionsByQuiz(
    quizId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    success: boolean
    data: QuizSubmission[]
    pagination: {
      currentPage: number
      limit: number
      totalItems: number
      totalPages: number
    }
  }> {
    return apiClient.request(
      `/quiz-submissions/${quizId}/submissions`,
      {
        params: { page, limit },
      }
    )
  }

  /**
   * Grade a quiz submission (Teacher only)
   */
  async gradeSubmission(
    submissionId: string,
    gradeData: GradeQuizData
  ): Promise<{ success: boolean; message: string; data: QuizSubmission }> {
    return apiClient.request<{ success: boolean; message: string; data: QuizSubmission }>(
      `/quiz-submissions/${submissionId}/grade`,
      {
        method: "PUT",
        body: gradeData,
      }
    )
  }

  /**
   * Download quiz file
   */
  async downloadQuizFile(fileId: string): Promise<Blob> {
    const token = this.getAuthToken()
    const response = await fetch(`${this.getBaseURL()}/files/download/${fileId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to download file")
    }

    return response.blob()
  }

  /**
   * Download submission file
   */
  async downloadSubmissionFile(fileId: string): Promise<Blob> {
    const token = this.getAuthToken()
    const response = await fetch(`${this.getBaseURL()}/files/download/${fileId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to download file")
    }

    return response.blob()
  }
}

export const quizService = new QuizService()
