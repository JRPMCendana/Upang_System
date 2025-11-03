// Grade Tracking Service

import { apiClient } from "./api-client"

// Teacher grade statistics
export interface TeacherGradeStats {
  classAverage: number
  passRate: number
  passingStudents: string
  avgSubmissions: number
  gradingStatus: string
  pendingGrading: number
  gradeDistribution: Array<{
    name: string
    value: number
    color: string
    count: number
  }>
  performanceByTask: Array<{
    name: string
    type: 'assignment' | 'quiz'
    average: number
    passed: number
    total: number
  }>
  totalStudents: number
  totalAssignments: number
  totalQuizzes: number
  totalGraded: number
}

// Student grade statistics
export interface StudentGradeStats {
  overallAverage: number
  highestGrade: number
  highestGradeItem: string | null
  completed: number
  total: number
  gradeTrend: Array<{
    month: string
    average: number
  }>
  recentGrades: Array<{
    id: string
    name: string
    grade: number | null
    type: 'assignment' | 'quiz'
    status: string
    date: string | Date
  }>
  pendingTasks: Array<{
    id: string
    name: string
    grade: number | null
    type: 'assignment' | 'quiz'
    status: string
    date: string | Date | null
  }>
}

class GradeService {
  /**
   * Get teacher grade statistics
   */
  async getTeacherGradeStats(): Promise<{ data: TeacherGradeStats }> {
    return apiClient.request<{ data: TeacherGradeStats }>("/grades/teacher", {
      method: "GET",
    })
  }

  /**
   * Get student grade statistics
   */
  async getStudentGradeStats(): Promise<{ data: StudentGradeStats }> {
    return apiClient.request<{ data: StudentGradeStats }>("/grades/student", {
      method: "GET",
    })
  }

  /**
   * Get detailed grade breakdown for a specific student (teacher view)
   */
  async getStudentGradeDetails(studentId: string): Promise<{ data: StudentGradeDetails }> {
    return apiClient.request<{ data: StudentGradeDetails }>(`/grades/student/${studentId}`, {
      method: "GET",
    })
  }
}

// Student grade details (for teacher view)
export interface StudentGradeDetails {
  student: {
    id: string
    username: string
    firstName?: string
    lastName?: string
    email: string
  }
  overallAverage: number
  totalItems: number
  gradedItems: number
  pendingItems: number
  byType: {
    assignments: Array<GradeItem>
    quizzes: Array<GradeItem>
  }
  allGrades: Array<GradeItem>
}

export interface GradeItem {
  id: string
  type: 'assignment' | 'quiz'
  source: string // Assignment/Quiz title
  sourceId: string
  rawGrade: number | null
  maxScore: number
  percentage: number | null
  submittedAt: string | Date
  gradedAt: string | Date | null
  dueDate: string | Date | null
  isSubmitted: boolean
  feedback: string | null
}

export const gradeService = new GradeService()
