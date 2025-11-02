// Grade Domain Types

export interface Grade {
  _id: string
  id: string
  studentId: string
  student?: GradeStudent
  courseId: string
  course?: GradeCourse
  assignmentId?: string
  assignment?: GradeAssignment
  quizId?: string
  quiz?: GradeQuiz
  score: number
  maxScore: number
  percentage: number
  letterGrade?: "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D" | "F"
  feedback?: string
  type: "assignment" | "quiz" | "exam" | "participation" | "project" | "final"
  weight?: number
  status: "pending" | "graded" | "published"
  gradedBy?: string
  gradedByUser?: GradeInstructor
  gradedAt?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface GradeStudent {
  _id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
}

export interface GradeCourse {
  _id: string
  title: string
  code?: string
}

export interface GradeAssignment {
  _id: string
  title: string
  dueDate?: string
}

export interface GradeQuiz {
  _id: string
  title: string
}

export interface GradeInstructor {
  _id: string
  username: string
  firstName?: string
  lastName?: string
}

export interface CreateGradeData {
  studentId: string
  courseId: string
  assignmentId?: string
  quizId?: string
  score: number
  maxScore: number
  feedback?: string
  type: "assignment" | "quiz" | "exam" | "participation" | "project" | "final"
  weight?: number
}

export interface UpdateGradeData {
  score?: number
  maxScore?: number
  percentage?: number
  letterGrade?: "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D" | "F"
  feedback?: string
  weight?: number
  status?: "pending" | "graded" | "published"
}

export interface GradeFilters {
  studentId?: string
  courseId?: string
  type?: "assignment" | "quiz" | "exam" | "participation" | "project" | "final"
  status?: "pending" | "graded" | "published"
  minPercentage?: number
  maxPercentage?: number
}

export interface GetGradesResponse {
  success: boolean
  data: Grade[]
  pagination?: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export interface GetGradeResponse {
  success: boolean
  data: Grade
}

export interface CreateGradeResponse {
  success: boolean
  message: string
  data: Grade
}

export interface UpdateGradeResponse {
  success: boolean
  message: string
  data: Grade
}

// Grade statistics and analytics
export interface GradeStats {
  average: number
  median?: number
  highest: number
  lowest: number
  total: number
  passing: number // >= 70%
  failing: number // < 70%
  gradeDistribution?: GradeDistribution
}

export interface GradeDistribution {
  "A": number // 90-100%
  "B": number // 80-89%
  "C": number // 70-79%
  "D": number // 60-69%
  "F": number // < 60%
}

export interface StudentGradeSummary {
  studentId: string
  student?: GradeStudent
  courseId: string
  course?: GradeCourse
  overallPercentage: number
  overallLetterGrade: string
  totalPoints: number
  maxTotalPoints: number
  gradesByType: {
    type: string
    average: number
    count: number
  }[]
  lastUpdated: string
}

export interface CourseGradeSummary {
  courseId: string
  course?: GradeCourse
  totalStudents: number
  averageGrade: number
  highestGrade: number
  lowestGrade: number
  distribution: GradeDistribution
  passRate: number
  lastUpdated: string
}

// Helper functions types
export type GradeCalculator = (score: number, maxScore: number) => {
  percentage: number
  letterGrade: string
}

export interface GradeWeights {
  assignments?: number
  quizzes?: number
  exams?: number
  participation?: number
  projects?: number
  final?: number
}

// Export utility type for grade calculations
export interface CalculateGradeParams {
  scores: Array<{
    score: number
    maxScore: number
    weight?: number
  }>
}

export interface CalculateGradeResult {
  totalScore: number
  maxTotalScore: number
  percentage: number
  letterGrade: string
}
