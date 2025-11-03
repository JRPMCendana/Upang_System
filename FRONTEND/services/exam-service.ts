import { apiClient } from "./api-client"
import type { Exam, ExamSubmission, CreateExamData, GetExamsResponse, GetExamSubmissionsResponse } from "@/types/exam.types"

// Re-export types for backward compatibility
export type { Exam, ExamSubmission, CreateExamData, GetExamsResponse, GetExamSubmissionsResponse } from "@/types/exam.types"

class ExamService {
  async getExams(page = 1, limit = 10): Promise<GetExamsResponse> {
    return apiClient.request<GetExamsResponse>(`/exams?page=${page}&limit=${limit}`, { method: "GET" })
  }

  // deleteExam removed (undo)

  async createExam(data: CreateExamData, file?: File): Promise<{ success: boolean; message: string; data: Exam }> {
    const formData = new FormData()
    formData.append("title", data.title)
    formData.append("description", data.description)
    if (data.dueDate) formData.append("dueDate", data.dueDate)
    formData.append("totalPoints", String(data.totalPoints || 100))
    formData.append("studentIds", JSON.stringify(data.studentIds))
    if (file) formData.append("document", file)
    
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
    const response = await fetch(`${this.getBaseURL()}/exams`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      const error: any = new Error(errorData.message || errorData.error || "Failed to create exam")
      error.status = response.status
      throw error
    }

    return response.json()
  }

  async updateExam(examId: string, data: Partial<CreateExamData>, file?: File): Promise<{ success: boolean; message: string; data: Exam }> {
    const formData = new FormData()
    if (data.title) formData.append('title', data.title)
    if (data.description) formData.append('description', data.description)
    if (typeof data.dueDate !== 'undefined' && data.dueDate !== null) formData.append('dueDate', data.dueDate)
    if (typeof (data as any).totalPoints !== 'undefined' && (data as any).totalPoints !== null) formData.append('totalPoints', String((data as any).totalPoints))
    if (file) formData.append('document', file)

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    const response = await fetch(`${this.getBaseURL()}/exams/${examId}`, {
      method: 'PUT',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error: any = new Error(errorData.message || errorData.error || 'Failed to update exam')
      error.status = response.status
      throw error
    }

    return response.json()
  }

  async getSubmissionsByExam(examId: string, page = 1, limit = 10): Promise<GetExamSubmissionsResponse> {
    return apiClient.request<GetExamSubmissionsResponse>(`/exams/${examId}/submissions?page=${page}&limit=${limit}`, {
      method: "GET",
    })
  }

  async getMySubmission(examId: string) {
    return apiClient.request<{ data: any }>(`/exams/${examId}/my-submission`, { method: "GET" })
  }

  async unsubmitExam(examId: string) {
    return apiClient.request(`/exams/${examId}/unsubmit`, { method: "POST" })
  }

  async submitExam(examId: string, file: File) {
    const formData = new FormData()
    formData.append("file", file)
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
    const response = await fetch(`${this.getBaseURL()}/exams/${examId}/submit`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error: any = new Error(errorData.message || errorData.error || "Failed to submit exam")
      error.status = response.status
      throw error
    }
    return response.json()
  }

  async gradeSubmission(submissionId: string, grade: number, feedback?: string) {
    return apiClient.request(`/exams/submissions/${submissionId}/grade`, {
      method: "PUT",
      body: { grade, feedback },
    })
  }

  private getBaseURL(): string {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
  }

  getSubmissionFileUrl(fileId: string): string {    
    const baseURL = this.getBaseURL()
    return `${baseURL}/exams/files/${fileId}`
  }

  async downloadSubmissionFile(fileId: string): Promise<Blob> {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    const response = await fetch(this.getSubmissionFileUrl(fileId), { headers })
    if (!response.ok) throw new Error('Failed to download file')
    return response.blob()
  }
}

export const examService = new ExamService()


