import { useState, useCallback, useEffect } from "react"
import { quizService, type Quiz, type QuizResponse } from "@/services/quiz-service"
import { useToast } from "@/hooks/use-toast"

interface UseQuizzesOptions {
  courseId?: string
  autoFetch?: boolean
}

export function useQuizzes(options: UseQuizzesOptions = {}) {
  const { courseId, autoFetch = false } = options
  const { toast } = useToast()

  // State
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(autoFetch)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)

  // Fetch quizzes
  const fetchQuizzes = useCallback(async (filterCourseId?: string) => {
    const targetCourseId = filterCourseId ?? courseId

    if (quizzes.length === 0) {
      setInitialLoading(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await quizService.getQuizzes(targetCourseId)
      setQuizzes(response as Quiz[])
    } catch (error: any) {
      console.error("Error fetching quizzes:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch quizzes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [courseId, quizzes.length, toast])

  // Fetch single quiz
  const fetchQuizById = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const response = await quizService.getQuizById(id)
      setSelectedQuiz(response)
      return response
    } catch (error: any) {
      console.error("Error fetching quiz:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch quiz details",
        variant: "destructive",
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Create quiz (teacher only)
  const createQuiz = useCallback(async (data: Partial<Quiz>) => {
    setLoading(true)
    try {
      await quizService.createQuiz(data)

      toast({
        title: "Success",
        description: "Quiz created successfully!",
      })

      // Refresh quizzes
      await fetchQuizzes()
      return true
    } catch (error: any) {
      console.error("Error creating quiz:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create quiz",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [toast, fetchQuizzes])

  // Submit quiz (student)
  const submitQuiz = useCallback(async (data: QuizResponse) => {
    setLoading(true)
    try {
      const response = await quizService.submitQuiz(data)

      toast({
        title: "Success",
        description: `Quiz submitted! Your score: ${data.score}`,
      })

      // Refresh quizzes
      await fetchQuizzes()
      return response
    } catch (error: any) {
      console.error("Error submitting quiz:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit quiz",
        variant: "destructive",
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [toast, fetchQuizzes])

  // Refresh all data
  const refreshQuizzes = useCallback(async () => {
    await fetchQuizzes()
  }, [fetchQuizzes])

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchQuizzes()
    }
  }, [autoFetch, fetchQuizzes])

  return {
    // State
    quizzes,
    loading,
    initialLoading,
    selectedQuiz,

    // Actions
    fetchQuizzes,
    fetchQuizById,
    createQuiz,
    submitQuiz,
    refreshQuizzes,
    setSelectedQuiz,
  }
}
