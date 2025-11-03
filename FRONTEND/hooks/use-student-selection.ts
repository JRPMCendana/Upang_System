import { useState, useCallback, useEffect, useMemo } from "react"
import { userService } from "@/services/user-service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { filterStudents } from "@/utils/student.utils"
import type { User } from "@/types/user.types"

interface UseStudentSelectionOptions {
  autoFetch?: boolean
  initialSelectedIds?: string[]
}

/**
 * Hook for managing student selection with search and filtering
 * Handles fetching students, search filtering, and multi-selection logic
 */
export function useStudentSelection(options: UseStudentSelectionOptions = {}) {
  const { autoFetch = false, initialSelectedIds = [] } = options
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()

  // State
  const [students, setStudents] = useState<User[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(autoFetch)

  // Computed values
  const filteredStudents = useMemo(
    () => filterStudents(students, searchQuery),
    [students, searchQuery]
  )

  const selectedStudents = useMemo(
    () => students.filter(s => selectedIds.includes(s._id)),
    [students, selectedIds]
  )

  // Fetch students from API
  const fetchStudents = useCallback(async () => {
    if (!isAuthenticated) return

    if (students.length === 0) {
      setInitialLoading(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await userService.getAssignedStudents(1, 100)
      setStudents(response.data)
    } catch (error: any) {
      console.error("Error fetching students:", error)
      if (!error.message?.includes("authentication token")) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch students",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [isAuthenticated, students.length, toast])

  // Toggle single student selection
  const toggleStudent = useCallback((studentId: string) => {
    setSelectedIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }, [])

  // Remove student from selection
  const removeStudent = useCallback((studentId: string) => {
    setSelectedIds(prev => prev.filter(id => id !== studentId))
  }, [])

  // Toggle all filtered students
  const toggleAllFiltered = useCallback(() => {
    const filteredIds = filteredStudents.map(s => s._id)
    const allFilteredSelected = filteredIds.every(id => selectedIds.includes(id))

    if (allFilteredSelected) {
      // Deselect all filtered students
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)))
    } else {
      // Select all filtered students (merge with existing selections)
      setSelectedIds(prev => [...new Set([...prev, ...filteredIds])])
    }
  }, [filteredStudents, selectedIds])

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedIds([])
  }, [])

  // Set selection to specific IDs
  const setSelection = useCallback((ids: string[]) => {
    setSelectedIds(ids)
  }, [])

  // Reset search query
  const clearSearch = useCallback(() => {
    setSearchQuery("")
  }, [])

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && isAuthenticated) {
      fetchStudents()
    }
  }, [autoFetch, isAuthenticated, fetchStudents])

  return {
    // Data
    students: filteredStudents,
    allStudents: students,
    selectedIds,
    selectedStudents,
    
    // Search
    searchQuery,
    setSearchQuery,
    clearSearch,
    
    // Loading states
    loading,
    initialLoading,
    
    // Actions
    fetchStudents,
    toggleStudent,
    removeStudent,
    toggleAllFiltered,
    clearSelection,
    setSelection,
  }
}
