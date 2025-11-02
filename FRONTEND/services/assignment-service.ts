// Assignment Management Service

import { apiClient } from "./api-client"
import type { Assignment } from "@/types/assignment.types"

// Re-export types for backward compatibility
export type { Assignment } from "@/types/assignment.types"

class AssignmentService {
  async getAssignments(courseId?: string) {
    return apiClient.request<Assignment[]>("/assignments", {
      params: courseId ? { courseId } : undefined,
    })
  }

  async getAssignmentById(id: string) {
    return apiClient.request(`/assignments/${id}`)
  }

  async submitAssignment(id: string, file: File) {
    const formData = new FormData()
    formData.append("file", file)

    return fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/assignments/${id}/submit`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
  }

  async gradeAssignment(id: string, grade: number, feedback: string) {
    return apiClient.request(`/assignments/${id}/grade`, {
      method: "PUT",
      body: { grade, feedback },
    })
  }
}

export const assignmentService = new AssignmentService()
