import { useState, useCallback, useEffect } from "react"
import { quizService, type Quiz, type QuizSubmission, type CreateQuizData, type GradeQuizData } from "@/services/quiz-service"
import { useToast } from "@/hooks/use-toast"

interface UseQuizzesOptions {
  page?: number
  limit?: number
  autoFetch?: boolean
}

/**
 * Hook for managing quizzes (similar to assignments)
 * Handles fetching, creating, submitting, and grading quizzes
 */
export function useQuizzes(options: UseQuizzesOptions = {}) {
  const { page = 1, limit = 10, autoFetch = false } = options
  const { toast } = useToast()

  // State
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(autoFetch)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  })

  // Fetch quizzes
  const fetchQuizzes = useCallback(async (currentPage?: number, currentLimit?: number) => {
    const targetPage = currentPage ?? page
    const targetLimit = currentLimit ?? limit

    if (quizzes.length === 0) {
      setInitialLoading(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await quizService.getQuizzes(targetPage, targetLimit)
      setQuizzes(response.data)
      if (response.pagination) {
        setPagination(response.pagination)
      }
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
  }, [page, limit, quizzes.length, toast])

  // Fetch single quiz
  const fetchQuizById = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const response = await quizService.getQuizById(id)
      setSelectedQuiz(response.data)
      return response.data
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
  const createQuiz = useCallback(async (data: CreateQuizData & { studentIds: string[] }, file?: File) => {
    setLoading(true)
    try {
      const response = await quizService.createQuiz(data, file)
      
      toast({
        title: "Success",
        description: "Quiz created successfully!",
      })

      // Refresh quizzes
      await fetchQuizzes()
      return response.data
    } catch (error: any) {
      console.error("Error creating quiz:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create quiz",
        variant: "destructive",
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [toast, fetchQuizzes])

  // Update quiz (teacher only)
  const updateQuiz = useCallback(async (id: string, data: Partial<Quiz>, file?: File) => {
    setLoading(true)
    try {
      const response = await quizService.updateQuiz(id, data, file)
      
      toast({
        title: "Success",
        description: "Quiz updated successfully!",
      })

      // Refresh quizzes
      await fetchQuizzes()
      return response.data
    } catch (error: any) {
      console.error("Error updating quiz:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update quiz",
        variant: "destructive",
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [toast, fetchQuizzes])

  // Delete quiz (teacher only)
  const deleteQuiz = useCallback(async (id: string) => {
    setLoading(true)
    try {
      await quizService.deleteQuiz(id)
      
      toast({
        title: "Success",
        description: "Quiz deleted successfully!",
      })

      // Refresh quizzes
      await fetchQuizzes()
      return true
    } catch (error: any) {
      console.error("Error deleting quiz:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete quiz",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [toast, fetchQuizzes])

  // Submit quiz (student only)
  const submitQuiz = useCallback(async (id: string, file: File) => {
    setLoading(true)
    try {
      const response = await quizService.submitQuiz(id, file)

      toast({
        title: "Success",
        description: "Quiz submitted successfully!",
      })

      // Refresh quizzes
      await fetchQuizzes()
      return response.data
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

  // Unsubmit quiz (student only)
  const unsubmitQuiz = useCallback(async (id: string) => {
    setLoading(true)
    try {
      await quizService.unsubmitQuiz(id)

      toast({
        title: "Success",
        description: "Quiz unsubmitted successfully!",
      })

      // Refresh quizzes
      await fetchQuizzes()
      return true
    } catch (error: any) {
      console.error("Error unsubmitting quiz:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to unsubmit quiz",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [toast, fetchQuizzes])

  // Replace submission (student only)
  const replaceSubmission = useCallback(async (id: string, file: File) => {
    setLoading(true)
    try {
      const response = await quizService.replaceSubmission(id, file)

      toast({
        title: "Success",
        description: "Submission replaced successfully!",
      })

      // Refresh quizzes
      await fetchQuizzes()
      return response.data
    } catch (error: any) {
      console.error("Error replacing submission:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to replace submission",
        variant: "destructive",
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [toast, fetchQuizzes])

  // Get my submission (student only)
  const getMySubmission = useCallback(async (quizId: string) => {
    setLoading(true)
    try {
      const response = await quizService.getMySubmission(quizId)
      return response.data
    } catch (error: any) {
      console.error("Error fetching submission:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch submission",
        variant: "destructive",
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Get submissions by quiz (teacher only)
  const getSubmissionsByQuiz = useCallback(async (quizId: string, currentPage?: number, currentLimit?: number) => {
    setLoading(true)
    try {
      const response = await quizService.getSubmissionsByQuiz(
        quizId,
        currentPage ?? 1,
        currentLimit ?? 10
      )
      return response.data
    } catch (error: any) {
      console.error("Error fetching submissions:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch submissions",
        variant: "destructive",
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Grade submission (teacher only)
  const gradeSubmission = useCallback(async (submissionId: string, gradeData: GradeQuizData) => {
    setLoading(true)
    try {
      const response = await quizService.gradeSubmission(submissionId, gradeData)

      toast({
        title: "Success",
        description: "Submission graded successfully!",
      })

      return response.data
    } catch (error: any) {
      console.error("Error grading submission:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to grade submission",
        variant: "destructive",
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Download quiz file
  const downloadQuizFile = useCallback(async (fileId: string, fileName: string) => {
    try {
      const blob = await quizService.downloadQuizFile(fileId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error: any) {
      console.error("Error downloading file:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to download file",
        variant: "destructive",
      })
    }
  }, [toast])

  // Download submission file
  const downloadSubmissionFile = useCallback(async (fileId: string, fileName: string) => {
    try {
      const blob = await quizService.downloadSubmissionFile(fileId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error: any) {
      console.error("Error downloading file:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to download file",
        variant: "destructive",
      })
    }
  }, [toast])

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
    pagination,

    // Actions
    fetchQuizzes,
    fetchQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    submitQuiz,
    unsubmitQuiz,
    replaceSubmission,
    getMySubmission,
    getSubmissionsByQuiz,
    gradeSubmission,
    downloadQuizFile,
    downloadSubmissionFile,
    refreshQuizzes,
    setSelectedQuiz,
  }
}
