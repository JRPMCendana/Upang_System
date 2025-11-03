import { useState, useCallback, useEffect } from "react"
import { examService, type Exam, type ExamSubmission } from "@/services/exam-service"
import { useToast } from "@/hooks/use-toast"

interface UseExamsOptions {
  page?: number
  limit?: number
  autoFetch?: boolean
}

/**
 * Hook for managing exams
 * Handles fetching and creating exams
 */
export function useExams(options: UseExamsOptions = {}) {
  const { page = 1, limit = 10, autoFetch = false } = options
  const { toast } = useToast()

  // State
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(autoFetch)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  })

  // Fetch exams
  const fetchExams = useCallback(async (currentPage?: number, currentLimit?: number) => {
    const targetPage = currentPage ?? page
    const targetLimit = currentLimit ?? limit

    if (exams.length === 0) {
      setInitialLoading(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await examService.getExams(targetPage, targetLimit)
      setExams(response.data)
      if (response.pagination) {
        setPagination(response.pagination)
      }
    } catch (error: any) {
      console.error("Error fetching exams:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch exams",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [page, limit, exams.length, toast])

  // Create exam (teacher only)
  const createExam = useCallback(async (data: { title: string; description: string; dueDate?: string; totalPoints?: number; studentIds: string[] }, file?: File) => {
    setLoading(true)
    try {
      const response = await examService.createExam(data, file)
      
      toast({
        title: "Success",
        description: "Exam created successfully!",
      })

      // Refresh exams
      await fetchExams()
      return response.data
    } catch (error: any) {
      console.error("Error creating exam:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create exam",
        variant: "destructive",
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchExams, toast])

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchExams()
    }
  }, [autoFetch, fetchExams])

  return {
    exams,
    loading,
    initialLoading,
    pagination,
    fetchExams,
    createExam,
  }
}

