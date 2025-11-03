// Grade Tracking Service

import { apiClient } from "./api-client"
import type { Grade } from "@/types/grade.types"

// Re-export types for backward compatibility
export type { Grade } from "@/types/grade.types"

class GradeService {
  async getGrades(filters?: Record<string, any>) {
    return apiClient.request<Grade[]>("/grades", {
      params: filters,
    })
  }

  async getStudentGrades(studentId: string) {
    return apiClient.request<Grade[]>(`/grades/student/${studentId}`)
  }

  async getCourseGrades(courseId: string) {
    return apiClient.request<Grade[]>(`/grades/course/${courseId}`)
  }

  async updateGrade(id: string, data: Partial<Grade>) {
    return apiClient.request(`/grades/${id}`, {
      method: "PUT",
      body: data,
    })
  }
}

export const gradeService = new GradeService()
