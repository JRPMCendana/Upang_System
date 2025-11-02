import { useState, useCallback, useEffect } from "react"
import { assignmentService, type Assignment, type AssignmentSubmission, type CreateAssignmentData, type GradeAssignmentData } from "@/services/assignment-service"
import { useToast } from "@/hooks/use-toast"

interface UseAssignmentsOptions {
  page?: number
  limit?: number
  autoFetch?: boolean
}

export function useAssignments(options: UseAssignmentsOptions = {}) {
  const { page = 1, limit = 10, autoFetch = false } = options
  const { toast } = useToast()

  // State
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(autoFetch)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  })

  // Fetch assignments
  const fetchAssignments = useCallback(async (currentPage?: number, currentLimit?: number) => {
    const targetPage = currentPage ?? page
    const targetLimit = currentLimit ?? limit

    if (assignments.length === 0) {
      setInitialLoading(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await assignmentService.getAssignments(targetPage, targetLimit)
      setAssignments(response.data)
      if (response.pagination) {
        setPagination(response.pagination)
      }
    } catch (error: any) {
      console.error("Error fetching assignments:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch assignments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [page, limit, assignments.length, toast])

  // Fetch single assignment
  const fetchAssignmentById = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const response = await assignmentService.getAssignmentById(id)
      setSelectedAssignment(response.data)
      return response.data
    } catch (error: any) {
      console.error("Error fetching assignment:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch assignment details",
        variant: "destructive",
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Create assignment (teacher only)
  const createAssignment = useCallback(async (data: CreateAssignmentData & { studentIds: string[] }, file?: File) => {
    setLoading(true)
    try {
      const response = await assignmentService.createAssignment(data, file)
      
      toast({
        title: "Success",
        description: "Assignment created successfully!",
      })

      // Refresh assignments
      await fetchAssignments()
      return response.data
    } catch (error: any) {
      console.error("Error creating assignment:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create assignment",
        variant: "destructive",
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [toast, fetchAssignments])

  // Update assignment (teacher only)
  const updateAssignment = useCallback(async (id: string, data: Partial<Assignment>, file?: File) => {
    setLoading(true)
    try {
      const response = await assignmentService.updateAssignment(id, data, file)
      
      toast({
        title: "Success",
        description: "Assignment updated successfully!",
      })

      // Refresh assignments
      await fetchAssignments()
      return response.data
    } catch (error: any) {
      console.error("Error updating assignment:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update assignment",
        variant: "destructive",
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [toast, fetchAssignments])

  // Delete assignment (teacher only)
  const deleteAssignment = useCallback(async (id: string) => {
    setLoading(true)
    try {
      await assignmentService.deleteAssignment(id)
      
      toast({
        title: "Success",
        description: "Assignment deleted successfully!",
      })

      // Refresh assignments
      await fetchAssignments()
      return true
    } catch (error: any) {
      console.error("Error deleting assignment:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete assignment",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [toast, fetchAssignments])

  // Submit assignment (student only)
  const submitAssignment = useCallback(async (id: string, file: File) => {
    setLoading(true)
    try {
      const response = await assignmentService.submitAssignment(id, file)

      toast({
        title: "Success",
        description: "Assignment submitted successfully!",
      })

      // Refresh assignments
      await fetchAssignments()
      return response.data
    } catch (error: any) {
      console.error("Error submitting assignment:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit assignment",
        variant: "destructive",
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [toast, fetchAssignments])

  // Unsubmit assignment (student only)
  const unsubmitAssignment = useCallback(async (id: string) => {
    setLoading(true)
    try {
      await assignmentService.unsubmitAssignment(id)

      toast({
        title: "Success",
        description: "Assignment unsubmitted successfully!",
      })

      // Refresh assignments
      await fetchAssignments()
      return true
    } catch (error: any) {
      console.error("Error unsubmitting assignment:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to unsubmit assignment",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [toast, fetchAssignments])

  // Replace submission (student only)
  const replaceSubmission = useCallback(async (id: string, file: File) => {
    setLoading(true)
    try {
      const response = await assignmentService.replaceSubmission(id, file)

      toast({
        title: "Success",
        description: "Submission replaced successfully!",
      })

      // Refresh assignments
      await fetchAssignments()
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
  }, [toast, fetchAssignments])

  // Get my submission (student only)
  const getMySubmission = useCallback(async (assignmentId: string) => {
    setLoading(true)
    try {
      const response = await assignmentService.getMySubmission(assignmentId)
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

  // Get submissions by assignment (teacher only)
  const getSubmissionsByAssignment = useCallback(async (assignmentId: string, currentPage?: number, currentLimit?: number) => {
    setLoading(true)
    try {
      const response = await assignmentService.getSubmissionsByAssignment(
        assignmentId,
        currentPage ?? 1,
        currentLimit ?? 10
      )
      return response
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
  const gradeSubmission = useCallback(async (submissionId: string, gradeData: GradeAssignmentData) => {
    setLoading(true)
    try {
      const response = await assignmentService.gradeSubmission(submissionId, gradeData)

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

  // Download assignment file
  const downloadAssignmentFile = useCallback(async (fileId: string, fileName: string) => {
    try {
      const blob = await assignmentService.downloadAssignmentFile(fileId)
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
      const blob = await assignmentService.downloadSubmissionFile(fileId)
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
  const refreshAssignments = useCallback(async () => {
    await fetchAssignments()
  }, [fetchAssignments])

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchAssignments()
    }
  }, [autoFetch, fetchAssignments])

  return {
    // State
    assignments,
    loading,
    initialLoading,
    selectedAssignment,
    pagination,

    // Actions
    fetchAssignments,
    fetchAssignmentById,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    submitAssignment,
    unsubmitAssignment,
    replaceSubmission,
    getMySubmission,
    getSubmissionsByAssignment,
    gradeSubmission,
    downloadAssignmentFile,
    downloadSubmissionFile,
    refreshAssignments,
    setSelectedAssignment,
  }
}
