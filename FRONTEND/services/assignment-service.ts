// Assignment Management Service

import { apiClient } from "./api-client"
import type {
  Assignment,
  AssignmentSubmission,
  CreateAssignmentData,
  UpdateAssignmentData,
  SubmitAssignmentData,
  GradeAssignmentData,
  GetAssignmentsResponse,
} from "@/types/assignment.types"

// Re-export types for backward compatibility
export type {
  Assignment,
  AssignmentSubmission,
  CreateAssignmentData,
  UpdateAssignmentData,
  SubmitAssignmentData,
  GradeAssignmentData,
} from "@/types/assignment.types"

class AssignmentService {
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
   * Get all assignments with pagination
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   */
  async getAssignments(page: number = 1, limit: number = 10): Promise<GetAssignmentsResponse> {
    return apiClient.request<GetAssignmentsResponse>("/assignments", {
      params: { page, limit },
    })
  }

  /**
   * Get assignment by ID
   * @param assignmentId - Assignment ID
   */
  async getAssignmentById(assignmentId: string): Promise<{ success: boolean; data: Assignment }> {
    return apiClient.request<{ success: boolean; data: Assignment }>(`/assignments/${assignmentId}`)
  }

  /**
   * Create new assignment (Teacher only)
   * @param data - Assignment data
   * @param file - Optional file attachment
   */
  async createAssignment(
    data: CreateAssignmentData & { studentIds: string[] },
    file?: File
  ): Promise<{ success: boolean; message: string; data: Assignment }> {
    const formData = new FormData()

    // Append assignment data
    formData.append("title", data.title)
    formData.append("description", data.description)
    formData.append("dueDate", data.dueDate)
    formData.append("studentIds", JSON.stringify(data.studentIds))

    if (data.instructions) formData.append("instructions", data.instructions)
    if (data.maxGrade) formData.append("maxGrade", data.maxGrade.toString())
    if (data.submissionType) formData.append("submissionType", data.submissionType)
    if (data.allowLateSubmission !== undefined)
      formData.append("allowLateSubmission", data.allowLateSubmission.toString())

    // Append file if provided
    if (file) {
      formData.append("file", file)
    }

    const token = this.getAuthToken()
    const response = await fetch(`${this.getBaseURL()}/assignments`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create assignment")
    }

    return response.json()
  }

  /**
   * Update assignment (Teacher only)
   * @param assignmentId - Assignment ID
   * @param data - Updated assignment data
   * @param file - Optional new file attachment
   */
  async updateAssignment(
    assignmentId: string,
    data: UpdateAssignmentData,
    file?: File
  ): Promise<{ success: boolean; message: string; data: Assignment }> {
    const formData = new FormData()

    // Append only provided fields
    if (data.title) formData.append("title", data.title)
    if (data.description) formData.append("description", data.description)
    if (data.instructions) formData.append("instructions", data.instructions)
    if (data.dueDate) formData.append("dueDate", data.dueDate)
    if (data.maxGrade !== undefined) formData.append("maxGrade", data.maxGrade.toString())
    if (data.status) formData.append("status", data.status)
    if (data.allowLateSubmission !== undefined)
      formData.append("allowLateSubmission", data.allowLateSubmission.toString())

    // Append file if provided
    if (file) {
      formData.append("file", file)
    }

    const token = this.getAuthToken()
    const response = await fetch(`${this.getBaseURL()}/assignments/${assignmentId}`, {
      method: "PUT",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update assignment")
    }

    return response.json()
  }

  /**
   * Delete assignment (Teacher only)
   * @param assignmentId - Assignment ID
   */
  async deleteAssignment(assignmentId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.request<{ success: boolean; message: string }>(`/assignments/${assignmentId}`, {
      method: "DELETE",
    })
  }

  /**
   * Download assignment file
   * @param fileId - File ID from GridFS
   */
  async downloadAssignmentFile(fileId: string): Promise<Blob> {
    const token = this.getAuthToken()
    const response = await fetch(`${this.getBaseURL()}/assignments/files/${fileId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to download file")
    }

    return response.blob()
  }

  // ==================== SUBMISSION ENDPOINTS ====================

  /**
   * Submit assignment (Student only)
   * @param assignmentId - Assignment ID
   * @param file - File to submit (required)
   */
  async submitAssignment(
    assignmentId: string,
    file: File
  ): Promise<{ success: boolean; message: string; data: AssignmentSubmission }> {
    const formData = new FormData()
    formData.append("file", file)

    const token = this.getAuthToken()
    const response = await fetch(`${this.getBaseURL()}/submissions/${assignmentId}/submit`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to submit assignment")
    }

    return response.json()
  }

  /**
   * Unsubmit assignment (Student only)
   * @param assignmentId - Assignment ID
   */
  async unsubmitAssignment(assignmentId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.request<{ success: boolean; message: string }>(
      `/submissions/${assignmentId}/unsubmit`,
      {
        method: "POST",
      }
    )
  }

  /**
   * Replace submission (Student only)
   * @param assignmentId - Assignment ID
   * @param file - New file to submit (required)
   */
  async replaceSubmission(
    assignmentId: string,
    file: File
  ): Promise<{ success: boolean; message: string; data: AssignmentSubmission }> {
    const formData = new FormData()
    formData.append("file", file)

    const token = this.getAuthToken()
    const response = await fetch(`${this.getBaseURL()}/submissions/${assignmentId}/replace`, {
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
   * @param assignmentId - Assignment ID
   */
  async getMySubmission(
    assignmentId: string
  ): Promise<{ success: boolean; data: AssignmentSubmission | null }> {
    return apiClient.request<{ success: boolean; data: AssignmentSubmission | null }>(
      `/submissions/${assignmentId}/my-submission`
    )
  }

  /**
   * Get all submissions for an assignment (Teacher only)
   * @param assignmentId - Assignment ID
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   */
  async getSubmissionsByAssignment(
    assignmentId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    success: boolean
    data: AssignmentSubmission[]
    pagination: {
      currentPage: number
      limit: number
      totalItems: number
      totalPages: number
    }
  }> {
    return apiClient.request(
      `/submissions/${assignmentId}/submissions`,
      {
        params: { page, limit },
      }
    )
  }

  /**
   * Grade a submission (Teacher only)
   * @param submissionId - Submission ID
   * @param gradeData - Grade and feedback
   */
  async gradeSubmission(
    submissionId: string,
    gradeData: GradeAssignmentData
  ): Promise<{ success: boolean; message: string; data: AssignmentSubmission }> {
    return apiClient.request<{ success: boolean; message: string; data: AssignmentSubmission }>(
      `/submissions/${submissionId}/grade`,
      {
        method: "PUT",
        body: gradeData,
      }
    )
  }

  /**
   * Download submission file
   * @param fileId - File ID from GridFS
   */
  async downloadSubmissionFile(fileId: string): Promise<Blob> {
    const token = this.getAuthToken()
    // Use submission file route
    const response = await fetch(`${this.getBaseURL()}/submissions/files/${fileId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to download submission file")
    }

    return response.blob()
  }

  /**
   * Get submission file URL for viewing (requires auth header, not query param)
   * Note: This URL needs Authorization header, so use downloadSubmissionFile for actual access
   */
  getSubmissionFileUrl(fileId: string): string {
    const baseURL = this.getBaseURL()
    return `${baseURL}/submissions/files/${fileId}`
  }
}

export const assignmentService = new AssignmentService()
