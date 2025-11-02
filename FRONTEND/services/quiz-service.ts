// Quiz Management Service

import { apiClient } from "./api-client"

export interface Quiz {
  id: string
  courseId: string
  title: string
  questions: Question[]
  timeLimit: number
  passingScore: number
}

export interface Question {
  id: string
  text: string
  type: "multiple-choice" | "short-answer"
  options?: string[]
  correctAnswer?: string | string[]
}

export interface QuizResponse {
  quizId: string
  answers: Record<string, string>
  score: number
}

class QuizService {
  async getQuizzes(courseId?: string) {
    return apiClient.request<Quiz[]>("/quizzes", {
      params: courseId ? { courseId } : undefined,
    })
  }

  async getQuizById(id: string) {
    return apiClient.request<Quiz>(`/quizzes/${id}`)
  }

  async submitQuiz(data: QuizResponse) {
    return apiClient.request("/quizzes/submit", {
      method: "POST",
      body: data,
    })
  }

  async createQuiz(data: Partial<Quiz>) {
    return apiClient.request("/quizzes", {
      method: "POST",
      body: data,
    })
  }
}

export const quizService = new QuizService()
