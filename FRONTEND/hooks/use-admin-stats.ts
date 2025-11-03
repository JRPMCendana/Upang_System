// Admin Statistics Hook - Domain/Use Case Layer
// Handles business logic for admin dashboard statistics

import { useState, useCallback, useEffect } from "react"
import { userService } from "@/services/user-service"
import { adminService } from "@/services/admin-service"
import type { User } from "@/types/user.types"
import { useToast } from "@/hooks/use-toast"

interface UseAdminStatsReturn {
  // Recent users state
  recentUsers: User[]
  recentUsersLoading: boolean
  
  // Stats state
  totalStudents: number
  totalTeachers: number
  filesUploaded: number
  totalSubmissions: number
  averageScore: number
  statsLoading: boolean
  systemStatsLoading: boolean
  
  // Actions
  fetchRecentUsers: () => Promise<void>
  fetchUserStats: () => Promise<void>
  fetchSystemStats: () => Promise<void>
  refreshAll: () => Promise<void>
}

/**
 * Custom hook for admin dashboard statistics
 * Manages recent users list and user count statistics
 */
export function useAdminStats(): UseAdminStatsReturn {
  const { toast } = useToast()
  
  // State
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [recentUsersLoading, setRecentUsersLoading] = useState(true)
  const [totalStudents, setTotalStudents] = useState(0)
  const [totalTeachers, setTotalTeachers] = useState(0)
  const [filesUploaded, setFilesUploaded] = useState(0)
  const [totalSubmissions, setTotalSubmissions] = useState(0)
  const [averageScore, setAverageScore] = useState(0)
  const [statsLoading, setStatsLoading] = useState(true)
  const [systemStatsLoading, setSystemStatsLoading] = useState(true)

  /**
   * Fetch recent users (most recently created active users)
   */
  const fetchRecentUsers = useCallback(async () => {
    try {
      setRecentUsersLoading(true)
      // Fetch first 5 active users sorted by creation date (most recent)
      const response = await userService.getUsers(1, 5, undefined, "active")
      setRecentUsers(response.data)
    } catch (error: any) {
      console.error("Error fetching recent users:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load recent users.",
        variant: "destructive",
      })
    } finally {
      setRecentUsersLoading(false)
    }
  }, [toast])

  /**
   * Fetch user statistics (student and teacher counts)
   */
  const fetchUserStats = useCallback(async () => {
    try {
      setStatsLoading(true)
      
      // Fetch counts in parallel for better performance
      const [studentsResponse, teachersResponse] = await Promise.all([
        userService.getUsers(1, 1, "student", "active"),
        userService.getUsers(1, 1, "teacher", "active"),
      ])

      setTotalStudents(studentsResponse.pagination.totalItems)
      setTotalTeachers(teachersResponse.pagination.totalItems)
    } catch (error: any) {
      console.error("Error fetching user stats:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load statistics.",
        variant: "destructive",
      })
    } finally {
      setStatsLoading(false)
    }
  }, [toast])

  /**
   * Fetch system statistics (files, submissions, average score)
   */
  const fetchSystemStats = useCallback(async () => {
    try {
      setSystemStatsLoading(true)
      
      const stats = await adminService.getSystemStatistics()
      
      setFilesUploaded(stats.filesUploaded)
      setTotalSubmissions(stats.totalSubmissions)
      setAverageScore(stats.averageScore)
    } catch (error: any) {
      console.error("Error fetching system stats:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load system statistics.",
        variant: "destructive",
      })
    } finally {
      setSystemStatsLoading(false)
    }
  }, [toast])

  /**
   * Refresh all data (recent users and stats)
   */
  const refreshAll = useCallback(async () => {
    await Promise.all([fetchRecentUsers(), fetchUserStats(), fetchSystemStats()])
  }, [fetchRecentUsers, fetchUserStats, fetchSystemStats])

  return {
    // State
    recentUsers,
    recentUsersLoading,
    totalStudents,
    totalTeachers,
    filesUploaded,
    totalSubmissions,
    averageScore,
    statsLoading,
    systemStatsLoading,
    
    // Actions
    fetchRecentUsers,
    fetchUserStats,
    fetchSystemStats,
    refreshAll,
  }
}
