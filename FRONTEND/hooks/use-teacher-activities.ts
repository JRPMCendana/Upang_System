// Teacher Activities Hook - Domain/Use Case Layer
// Handles business logic for viewing teacher assignments and quizzes

import { useState, useCallback } from "react"
import { teacherActivityService } from "@/services/teacher-activity-service"
import { useToast } from "@/hooks/use-toast"

interface UseTeacherActivitiesReturn {
  // State
  assignments: any[]
  quizzes: any[]
  exams: any[]
  loading: boolean
  assignmentsTotal: number
  quizzesTotal: number
  examsTotal: number
  combinedActivities: any[]

  // Actions
  fetchAssignments: (page?: number, limit?: number, teacherId?: string) => Promise<void>
  fetchQuizzes: (page?: number, limit?: number, teacherId?: string) => Promise<void>
  fetchExams: (page?: number, limit?: number, teacherId?: string) => Promise<void>
  fetchAll: (teacherId?: string) => Promise<void>
}

/**
 * Custom hook for admin to view teacher activities
 * Manages assignments and quizzes created by teachers
 */
export function useTeacherActivities(): UseTeacherActivitiesReturn {
  const { toast } = useToast()

  // State
  const [assignments, setAssignments] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [assignmentsTotal, setAssignmentsTotal] = useState(0)
  const [quizzesTotal, setQuizzesTotal] = useState(0)
  const [examsTotal, setExamsTotal] = useState(0)

  /**
   * Fetch all assignments
   */
  const fetchAssignments = useCallback(
    async (page: number = 1, limit: number = 100, teacherId?: string) => {
      try {
        setLoading(true)
        const response = await teacherActivityService.getAllAssignments(page, limit, teacherId)
        setAssignments(response.data)
        setAssignmentsTotal(response.pagination.totalItems)
      } catch (error: any) {
        console.error("Error fetching assignments:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to load assignments.",
          variant: "destructive",
        })
        setAssignments([])
      } finally {
        setLoading(false)
      }
    },
    [toast]
  )

  /**
   * Fetch all quizzes
   */
  const fetchQuizzes = useCallback(
    async (page: number = 1, limit: number = 100, teacherId?: string) => {
      try {
        setLoading(true)
        const response = await teacherActivityService.getAllQuizzes(page, limit, teacherId)
        setQuizzes(response.data)
        setQuizzesTotal(response.pagination.totalItems)
      } catch (error: any) {
        console.error("Error fetching quizzes:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to load quizzes.",
          variant: "destructive",
        })
        setQuizzes([])
      } finally {
        setLoading(false)
      }
    },
    [toast]
  )

  /**
   * Fetch all exams
   */
  const fetchExams = useCallback(
    async (page: number = 1, limit: number = 100, teacherId?: string) => {
      try {
        setLoading(true)
        const response = await teacherActivityService.getAllExams(page, limit, teacherId)
        setExams(response.data)
        setExamsTotal(response.pagination.totalItems)
      } catch (error: any) {
        console.error("Error fetching exams:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to load exams.",
          variant: "destructive",
        })
        setExams([])
      } finally {
        setLoading(false)
      }
    },
    [toast]
  )

  /**
   * Fetch all assignments, quizzes, and exams
   */
  const fetchAll = useCallback(async (teacherId?: string) => {
    setLoading(true)
    await Promise.all([
      fetchAssignments(1, 100, teacherId), 
      fetchQuizzes(1, 100, teacherId),
      fetchExams(1, 100, teacherId)
    ])
    setLoading(false)
  }, [fetchAssignments, fetchQuizzes, fetchExams])

  // Combine and sort by creation date
  const combinedActivities = [...assignments, ...quizzes, ...exams]
    .map((item) => ({
      ...item,
      type: item.quizLink !== undefined ? "quiz" : (item.document !== undefined && !item.maxGrade ? "exam" : "assignment"),
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return {
    // State
    assignments,
    quizzes,
    exams,
    loading,
    assignmentsTotal,
    quizzesTotal,
    examsTotal,
    combinedActivities,

    // Actions
    fetchAssignments,
    fetchQuizzes,
    fetchExams,
    fetchAll,
  }
}
