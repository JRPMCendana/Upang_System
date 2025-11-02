import { useState, useCallback } from "react"
import { assignmentService, type Assignment } from "@/services/assignment-service"
import { useToast } from "@/hooks/use-toast"

interface UseAssignmentsOptions {
  courseId?: string
  autoFetch?: boolean
}

export function useAssignments(options: UseAssignmentsOptions = {}) {
  const { courseId, autoFetch = false } = options
  const { toast } = useToast()

  // State
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(autoFetch)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)

  // Fetch assignments
  const fetchAssignments = useCallback(async (filterCourseId?: string) => {
    const targetCourseId = filterCourseId ?? courseId

    if (assignments.length === 0) {
      setInitialLoading(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await assignmentService.getAssignments(targetCourseId)
      setAssignments(response as Assignment[])
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
  }, [courseId, assignments.length, toast])

  // Fetch single assignment
  const fetchAssignmentById = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const response = await assignmentService.getAssignmentById(id)
      setSelectedAssignment(response as Assignment)
      return response as Assignment
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

  // Submit assignment
  const submitAssignment = useCallback(async (id: string, file: File) => {
    setLoading(true)
    try {
      const response = await assignmentService.submitAssignment(id, file)
      
      if (!response.ok) {
        throw new Error("Failed to submit assignment")
      }

      toast({
        title: "Success",
        description: "Assignment submitted successfully!",
      })

      // Refresh assignments
      await fetchAssignments()
      return true
    } catch (error: any) {
      console.error("Error submitting assignment:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit assignment",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [toast, fetchAssignments])

  // Grade assignment (teacher only)
  const gradeAssignment = useCallback(async (id: string, grade: number, feedback: string) => {
    setLoading(true)
    try {
      await assignmentService.gradeAssignment(id, grade, feedback)

      toast({
        title: "Success",
        description: "Assignment graded successfully!",
      })

      // Refresh assignments
      await fetchAssignments()
      return true
    } catch (error: any) {
      console.error("Error grading assignment:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to grade assignment",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [toast, fetchAssignments])

  // Refresh all data
  const refreshAssignments = useCallback(async () => {
    await fetchAssignments()
  }, [fetchAssignments])

  // Auto-fetch on mount if enabled
  useState(() => {
    if (autoFetch) {
      fetchAssignments()
    }
  })

  return {
    // State
    assignments,
    loading,
    initialLoading,
    selectedAssignment,

    // Actions
    fetchAssignments,
    fetchAssignmentById,
    submitAssignment,
    gradeAssignment,
    refreshAssignments,
    setSelectedAssignment,
  }
}
