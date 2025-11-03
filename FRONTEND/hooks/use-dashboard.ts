import { useState, useCallback, useEffect } from "react"
import { dashboardService, type StudentDashboardStats, type TeacherDashboardStats } from "@/services/dashboard-service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

interface UseDashboardOptions {
  role: "student" | "teacher"
  autoFetch?: boolean
}

/**
 * Hook for fetching dashboard statistics
 * Handles role-specific dashboard data
 */
export function useDashboard(options: UseDashboardOptions) {
  const { role, autoFetch = false } = options
  const { toast } = useToast()
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  // State
  const [studentStats, setStudentStats] = useState<StudentDashboardStats | null>(null)
  const [teacherStats, setTeacherStats] = useState<TeacherDashboardStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(autoFetch)

  // Fetch student dashboard
  const fetchStudentDashboard = useCallback(async () => {
    // Don't fetch if not authenticated
    if (!isAuthenticated) {
      return
    }

    if (studentStats === null) {
      setInitialLoading(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await dashboardService.getStudentDashboard()
      setStudentStats(response.data)
    } catch (error: any) {
      console.error("Error fetching student dashboard:", error)
      // Only show toast if it's not an auth error
      if (!error.message.includes("authentication token")) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch dashboard statistics",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [toast, isAuthenticated])

  // Fetch teacher dashboard
  const fetchTeacherDashboard = useCallback(async () => {
    // Don't fetch if not authenticated
    if (!isAuthenticated) {
      return
    }

    if (teacherStats === null) {
      setInitialLoading(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await dashboardService.getTeacherDashboard()
      // Debug: inspect fetched teacher dashboard payload
      console.log('[Dashboard] Teacher stats fetched:', response.data)
      setTeacherStats(response.data)
    } catch (error: any) {
      console.error("Error fetching teacher dashboard:", error)
      // Only show toast if it's not an auth error
      if (!error.message.includes("authentication token")) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch dashboard statistics",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [toast, isAuthenticated])

  // Refresh dashboard data
  const refreshDashboard = useCallback(async () => {
    if (role === "student") {
      await fetchStudentDashboard()
    } else if (role === "teacher") {
      await fetchTeacherDashboard()
    }
  }, [role, fetchStudentDashboard, fetchTeacherDashboard])

  // Auto-fetch on mount if enabled - but only after authentication is complete
  useEffect(() => {
    if (!autoFetch) return
    if (authLoading) return
    if (!isAuthenticated) return
    if (role !== 'student' && role !== 'teacher') return
    // Fire once per mount based on role; dependencies exclude dashboard state to avoid loops
    void refreshDashboard()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, isAuthenticated, authLoading, role])

  return {
    // State
    studentStats,
    teacherStats,
    loading,
    initialLoading,

    // Actions
    fetchStudentDashboard,
    fetchTeacherDashboard,
    refreshDashboard,
  }
}
