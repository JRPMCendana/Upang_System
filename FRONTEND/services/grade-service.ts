// Grade Tracking Service

import { apiClient } from "./api-client"

export interface Grade {
  id: string
  studentId: string
  courseId: string
  score: number
  percentage: number
  feedback?: string
  type: "assignment" | "quiz" | "exam"
  createdAt: string
}

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
