import { useState, useCallback, useEffect } from "react"
import { useAssignments } from "@/hooks/use-assignments"
import { assignmentService } from "@/services/assignment-service"
import type { AssignmentSubmission, Assignment } from "@/types/assignment.types"

interface GradeFormData {
  grade: number
  feedback: string
}

interface UseAssignmentSubmissionsOptions {
  assignmentId: string
  autoFetch?: boolean
}

/**
 * Hook for managing assignment submissions (Teacher view)
 * Handles fetching, grading, and downloading student submissions
 */
export function useAssignmentSubmissions(options: UseAssignmentSubmissionsOptions) {
  const { assignmentId, autoFetch = true } = options
  
  const {
    getSubmissionsByAssignment,
    gradeSubmission: gradeSubmissionService,
    fetchAssignmentById,
    loading: assignmentsLoading,
  } = useAssignments({ autoFetch: false })

  // State
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([])
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(autoFetch)
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null)
  const [gradeFormData, setGradeFormData] = useState<GradeFormData>({
    grade: 0,
    feedback: ""
  })

  // Fetch submissions for the assignment
  const fetchSubmissions = useCallback(async () => {
    const isFirstLoad = submissions.length === 0
    if (isFirstLoad) {
      setInitialLoading(true)
    } else {
      setLoading(true)
    }

    try {
      const result = await getSubmissionsByAssignment(assignmentId)
      if (result && result.data) {
        setSubmissions(result.data)
      }
    } catch (error) {
      console.error("Error fetching submissions:", error)
      // Error is already handled by the hook with toast
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [assignmentId, getSubmissionsByAssignment])

  // Fetch assignment details
  const fetchAssignmentDetails = useCallback(async () => {
    try {
      const result = await fetchAssignmentById(assignmentId)
      if (result) {
        setAssignment(result)
      }
    } catch (error) {
      console.error("Error fetching assignment:", error)
    }
  }, [assignmentId, fetchAssignmentById])

  // Start grading a submission
  const startGrading = useCallback((submissionId: string, currentGrade?: number, currentFeedback?: string) => {
    setGradingSubmissionId(submissionId)
    setGradeFormData({
      grade: currentGrade || 0,
      feedback: currentFeedback || ""
    })
  }, [])

  // Cancel grading
  const cancelGrading = useCallback(() => {
    setGradingSubmissionId(null)
    setGradeFormData({ grade: 0, feedback: "" })
  }, [])

  // Update grade form data
  const updateGradeForm = useCallback((data: Partial<GradeFormData>) => {
    setGradeFormData(prev => ({ ...prev, ...data }))
  }, [])

  // Submit grade for a submission
  const submitGrade = useCallback(async (submissionId: string) => {
    const result = await gradeSubmissionService(submissionId, gradeFormData)
    if (result) {
      // Reset grading state
      setGradingSubmissionId(null)
      setGradeFormData({ grade: 0, feedback: "" })
      
      // Refresh submissions to get updated data
      await fetchSubmissions()
      return true
    }
    return false
  }, [gradeSubmissionService, gradeFormData, fetchSubmissions])

  // Download submission file (just downloads, no viewing)
  const downloadSubmission = useCallback(async (fileId: string, fileName: string) => {
    try {
      const blob = await assignmentService.downloadSubmissionFile(fileId)
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading file:', error)
      throw error
    }
  }, [])

  // Refresh all data
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchSubmissions(),
      fetchAssignmentDetails()
    ])
  }, [fetchSubmissions, fetchAssignmentDetails])

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && assignmentId) {
      fetchSubmissions()
      fetchAssignmentDetails()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, assignmentId]) // Only depend on config, not the functions

  return {
    // State
    submissions,
    assignment,
    loading: loading || assignmentsLoading,
    initialLoading,
    gradingSubmissionId,
    gradeFormData,

    // Actions
    fetchSubmissions,
    fetchAssignmentDetails,
    startGrading,
    cancelGrading,
    updateGradeForm,
    submitGrade,
    downloadSubmission,
    refresh,
  }
}
