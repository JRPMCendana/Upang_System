import { useState, useCallback, useEffect, useRef } from "react"
import { gradeService, type TeacherGradeStats, type StudentGradeStats } from "@/services/grade-service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

interface UseGradeStatsOptions {
  autoFetch?: boolean
}

export function useGradeStats(options: UseGradeStatsOptions = {}) {
  const { autoFetch = false } = options
  const { toast } = useToast()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  // State
  const [teacherStats, setTeacherStats] = useState<TeacherGradeStats | null>(null)
  const [studentStats, setStudentStats] = useState<StudentGradeStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(autoFetch)
  
  // Track if we've loaded data before (for refresh vs initial load)
  const hasLoadedTeacherStats = useRef(false)
  const hasLoadedStudentStats = useRef(false)

  // Fetch teacher grade stats
  const fetchTeacherStats = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'teacher') {
      return
    }

    // Set loading state based on whether we've loaded before
    if (!hasLoadedTeacherStats.current) {
      setInitialLoading(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await gradeService.getTeacherGradeStats()
      setTeacherStats(response.data)
      hasLoadedTeacherStats.current = true
    } catch (error: any) {
      console.error("Error fetching teacher grade stats:", error)
      if (!error.message.includes("authentication token")) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch grade statistics",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [isAuthenticated, user, toast])

  // Fetch student grade stats
  const fetchStudentStats = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'student') {
      return
    }

    // Set loading state based on whether we've loaded before
    if (!hasLoadedStudentStats.current) {
      setInitialLoading(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await gradeService.getStudentGradeStats()
      setStudentStats(response.data)
      hasLoadedStudentStats.current = true
    } catch (error: any) {
      console.error("Error fetching student grade stats:", error)
      if (!error.message.includes("authentication token")) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch grade statistics",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [isAuthenticated, user, toast])

  // Refresh stats based on role
  const refreshStats = useCallback(async () => {
    if (user?.role === 'teacher') {
      await fetchTeacherStats()
    } else if (user?.role === 'student') {
      await fetchStudentStats()
    }
  }, [user, fetchTeacherStats, fetchStudentStats])

  // Auto-fetch on mount if enabled (only once)
  useEffect(() => {
    if (authLoading || !autoFetch || !isAuthenticated) return
    
    // Only auto-fetch if we haven't loaded stats yet
    const shouldFetch = (user?.role === 'teacher' && !hasLoadedTeacherStats.current) ||
                       (user?.role === 'student' && !hasLoadedStudentStats.current)
    
    if (!shouldFetch) return
    
    const timer = setTimeout(() => {
      if (user?.role === 'teacher') {
        fetchTeacherStats()
      } else if (user?.role === 'student') {
        fetchStudentStats()
      }
    }, 100)
    
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, isAuthenticated, authLoading, user?.role])

  return {
    // State
    teacherStats,
    studentStats,
    loading,
    initialLoading,

    // Actions
    fetchTeacherStats,
    fetchStudentStats,
    refreshStats,
  }
}

