// Quiz Management Service

import { apiClient } from "./api-client"
import type { Quiz, Question } from "@/types/quiz.types"

// Re-export types for backward compatibility
export type { Quiz, Question } from "@/types/quiz.types"

// Keep QuizResponse for backward compatibility
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
