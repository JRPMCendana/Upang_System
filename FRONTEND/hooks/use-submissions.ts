// Submissions Hook - Domain/Use Case Layer
// Handles business logic for admin submissions management

import { useState, useCallback } from "react"
import { submissionService, type Submission } from "@/services/submission-service"
import { useToast } from "@/hooks/use-toast"

interface UseSubmissionsReturn {
  // State
  submissions: Submission[]
  loading: boolean
  totalItems: number
  totalPages: number
  currentPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
  breakdown: {
    totalAssignments: number
    totalQuizzes: number
    total: number
  }

  // Actions
  fetchSubmissions: (
    page?: number,
    limit?: number,
    type?: string,
    status?: string,
    search?: string
  ) => Promise<void>
  
  getSubmissionDetail: (submissionId: string, type: "assignment" | "quiz") => Promise<any>
}

/**
 * Custom hook for admin submissions management
 * Manages submissions list with filtering and pagination
 */
export function useSubmissions(): UseSubmissionsReturn {
  const { toast } = useToast()

  // State
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(false)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPrevPage, setHasPrevPage] = useState(false)
  const [breakdown, setBreakdown] = useState({
    totalAssignments: 0,
    totalQuizzes: 0,
    total: 0
  })

  /**
   * Fetch submissions with filtering and pagination
   */
  const fetchSubmissions = useCallback(
    async (
      page: number = 1,
      limit: number = 10,
      type: string = "all",
      status: string = "all",
      search: string = ""
    ) => {
      try {
        setLoading(true)
        const response = await submissionService.getAllSubmissions(
          page,
          limit,
          type,
          status,
          search
        )

        setSubmissions(response.data)
        setTotalItems(response.pagination.totalItems)
        setTotalPages(response.pagination.totalPages)
        setCurrentPage(response.pagination.currentPage)
        setHasNextPage(response.pagination.hasNextPage)
        setHasPrevPage(response.pagination.hasPrevPage)
        setBreakdown(response.breakdown)
      } catch (error: any) {
        console.error("Error fetching submissions:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to load submissions.",
          variant: "destructive",
        })
        setSubmissions([])
      } finally {
        setLoading(false)
      }
    },
    [toast]
  )

  /**
   * Get detailed submission information
   */
  const getSubmissionDetail = useCallback(
    async (submissionId: string, type: "assignment" | "quiz") => {
      try {
        const submission = await submissionService.getSubmissionById(
          submissionId,
          type
        )
        return submission
      } catch (error: any) {
        console.error("Error fetching submission detail:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to load submission details.",
          variant: "destructive",
        })
        throw error
      }
    },
    [toast]
  )

  return {
    // State
    submissions,
    loading,
    totalItems,
    totalPages,
    currentPage,
    hasNextPage,
    hasPrevPage,
    breakdown,

    // Actions
    fetchSubmissions,
    getSubmissionDetail,
  }
}
