import { useState, useCallback, useEffect } from "react"
import { dashboardService, type StudentDashboardStats, type TeacherDashboardStats } from "@/services/dashboard-service"
import { useToast } from "@/hooks/use-toast"

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

  // State
  const [studentStats, setStudentStats] = useState<StudentDashboardStats | null>(null)
  const [teacherStats, setTeacherStats] = useState<TeacherDashboardStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(autoFetch)

  // Fetch student dashboard
  const fetchStudentDashboard = useCallback(async () => {
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
      toast({
        title: "Error",
        description: error.message || "Failed to fetch dashboard statistics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [studentStats, toast])

  // Fetch teacher dashboard
  const fetchTeacherDashboard = useCallback(async () => {
    if (teacherStats === null) {
      setInitialLoading(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await dashboardService.getTeacherDashboard()
      setTeacherStats(response.data)
    } catch (error: any) {
      console.error("Error fetching teacher dashboard:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch dashboard statistics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [teacherStats, toast])

  // Refresh dashboard data
  const refreshDashboard = useCallback(async () => {
    if (role === "student") {
      await fetchStudentDashboard()
    } else if (role === "teacher") {
      await fetchTeacherDashboard()
    }
  }, [role, fetchStudentDashboard, fetchTeacherDashboard])

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      refreshDashboard()
    }
  }, [autoFetch, refreshDashboard])

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
