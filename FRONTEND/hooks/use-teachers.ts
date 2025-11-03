// Teachers Hook - For fetching list of teachers
// Used for filtering teacher activities

import { useState, useCallback, useEffect } from "react"
import { apiClient } from "@/services/api-client"
import { useToast } from "@/hooks/use-toast"

interface Teacher {
  _id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  role: string
}

interface UseTeachersReturn {
  teachers: Teacher[]
  loading: boolean
  fetchTeachers: () => Promise<void>
}

/**
 * Custom hook for fetching teachers list
 * Used in admin pages for filtering by teacher
 */
export function useTeachers(autoFetch: boolean = true): UseTeachersReturn {
  const { toast } = useToast()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(false)

  /**
   * Fetch all teachers
   */
  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiClient.request<{
        success: boolean
        data: Teacher[]
        pagination: any
      }>("/admin/users", {
        params: { role: "teacher", limit: 100 },
      })
      setTeachers(response.data)
    } catch (error: any) {
      console.error("Error fetching teachers:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load teachers.",
        variant: "destructive",
      })
      setTeachers([])
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchTeachers()
    }
  }, [autoFetch, fetchTeachers])

  return {
    teachers,
    loading,
    fetchTeachers,
  }
}
