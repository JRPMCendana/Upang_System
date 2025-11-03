import { useState, useCallback, useEffect } from "react"
import { gradeService, type Grade } from "@/services/grade-service"
import { useToast } from "@/hooks/use-toast"

interface UseGradesOptions {
  filters?: Record<string, any>
  studentId?: string
  courseId?: string
  autoFetch?: boolean
}

interface GradeStats {
  average: number
  highest: number
  lowest: number
  total: number
  passing: number
  failing: number
}

export function useGrades(options: UseGradesOptions = {}) {
  const { filters, studentId, courseId, autoFetch = false } = options
  const { toast } = useToast()

  // State
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(autoFetch)
  const [stats, setStats] = useState<GradeStats>({
    average: 0,
    highest: 0,
    lowest: 0,
    total: 0,
    passing: 0,
    failing: 0,
  })

  // Calculate statistics
  const calculateStats = useCallback((gradeList: Grade[]): GradeStats => {
    if (gradeList.length === 0) {
      return {
        average: 0,
        highest: 0,
        lowest: 0,
        total: 0,
        passing: 0,
        failing: 0,
      }
    }

    const percentages = gradeList.map(g => g.percentage)
    const sum = percentages.reduce((acc, val) => acc + val, 0)
    const average = sum / percentages.length

    return {
      average: Math.round(average * 100) / 100,
      highest: Math.max(...percentages),
      lowest: Math.min(...percentages),
      total: gradeList.length,
      passing: gradeList.filter(g => g.percentage >= 70).length,
      failing: gradeList.filter(g => g.percentage < 70).length,
    }
  }, [])

  // Fetch grades
  const fetchGrades = useCallback(async (customFilters?: Record<string, any>) => {
    const targetFilters = customFilters ?? filters

    if (grades.length === 0) {
      setInitialLoading(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await gradeService.getGrades(targetFilters)
      const gradeList = response as Grade[]
      setGrades(gradeList)
      setStats(calculateStats(gradeList))
    } catch (error: any) {
      console.error("Error fetching grades:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch grades",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [filters, grades.length, toast, calculateStats])

  // Fetch student grades
  const fetchStudentGrades = useCallback(async (targetStudentId?: string) => {
    const id = targetStudentId ?? studentId

    if (!id) {
      toast({
        title: "Error",
        description: "Student ID is required",
        variant: "destructive",
      })
      return
    }

    if (grades.length === 0) {
      setInitialLoading(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await gradeService.getStudentGrades(id)
      const gradeList = response as Grade[]
      setGrades(gradeList)
      setStats(calculateStats(gradeList))
    } catch (error: any) {
      console.error("Error fetching student grades:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch student grades",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [studentId, grades.length, toast, calculateStats])

  // Fetch course grades
  const fetchCourseGrades = useCallback(async (targetCourseId?: string) => {
    const id = targetCourseId ?? courseId

    if (!id) {
      toast({
        title: "Error",
        description: "Course ID is required",
        variant: "destructive",
      })
      return
    }

    if (grades.length === 0) {
      setInitialLoading(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await gradeService.getCourseGrades(id)
      const gradeList = response as Grade[]
      setGrades(gradeList)
      setStats(calculateStats(gradeList))
    } catch (error: any) {
      console.error("Error fetching course grades:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch course grades",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [courseId, grades.length, toast, calculateStats])

  // Update grade
  const updateGrade = useCallback(async (id: string, data: Partial<Grade>) => {
    setLoading(true)
    try {
      await gradeService.updateGrade(id, data)

      toast({
        title: "Success",
        description: "Grade updated successfully!",
      })

      // Refresh grades based on current context
      if (studentId) {
        await fetchStudentGrades()
      } else if (courseId) {
        await fetchCourseGrades()
      } else {
        await fetchGrades()
      }
      return true
    } catch (error: any) {
      console.error("Error updating grade:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update grade",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [toast, studentId, courseId, fetchStudentGrades, fetchCourseGrades, fetchGrades])

  // Refresh all data
  const refreshGrades = useCallback(async () => {
    if (studentId) {
      await fetchStudentGrades()
    } else if (courseId) {
      await fetchCourseGrades()
    } else {
      await fetchGrades()
    }
  }, [studentId, courseId, fetchStudentGrades, fetchCourseGrades, fetchGrades])

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      if (studentId) {
        fetchStudentGrades()
      } else if (courseId) {
        fetchCourseGrades()
      } else {
        fetchGrades()
      }
    }
  }, [autoFetch, studentId, courseId, fetchStudentGrades, fetchCourseGrades, fetchGrades])

  return {
    // State
    grades,
    loading,
    initialLoading,
    stats,

    // Actions
    fetchGrades,
    fetchStudentGrades,
    fetchCourseGrades,
    updateGrade,
    refreshGrades,
  }
}
