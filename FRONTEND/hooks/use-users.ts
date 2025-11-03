// User Management Hook - Domain/Use Case Layer
// Handles business logic and state management for user operations

import { useState, useCallback } from "react"
import { userService } from "@/services/user-service"
import type { User, CreateUserData, UpdateUserData } from "@/types/user.types"
import { useToast } from "@/hooks/use-toast"

interface UseUsersOptions {
  role?: "admin" | "teacher"
  autoFetch?: boolean
}

interface UseUsersReturn {
  // State
  users: User[]
  loading: boolean
  initialLoading: boolean
  currentPage: number
  totalPages: number
  totalItems: number
  
  // Actions
  fetchUsers: (page?: number, filters?: UserFilters) => Promise<void>
  createUser: (userData: CreateUserData) => Promise<boolean>
  updateUser: (userId: string, updateData: UpdateUserData) => Promise<boolean>
  deleteUser: (userId: string) => Promise<boolean>
  changeUserStatus: (userId: string, status: User["status"]) => Promise<boolean>
  assignTeacher: (studentId: string, teacherId: string) => Promise<boolean>
  unassignTeacher: (studentId: string) => Promise<boolean>
  
  // Pagination
  setPage: (page: number) => void
  nextPage: () => void
  previousPage: () => void
}

interface UserFilters {
  role?: "student" | "teacher"
  status?: "active" | "deactivated" | "deleted"
  limit?: number
}

export function useUsers(options: UseUsersOptions = {}): UseUsersReturn {
  const { role = "admin", autoFetch = false } = options
  const { toast } = useToast()
  
  // State
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(autoFetch)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  /**
   * Fetch users based on role and filters
   */
  const fetchUsers = useCallback(async (
    page: number = currentPage,
    filters: UserFilters = {}
  ) => {
    try {
      setLoading(true)
      
      const { role: roleFilter, status: statusFilter, limit = 10 } = filters
      
      let response
      if (role === "teacher") {
        // Teachers only see their assigned students
        response = await userService.getAssignedStudents(page, limit)
      } else {
        // Admins see all users with filters
        response = await userService.getUsers(
          page,
          limit,
          roleFilter,
          statusFilter
        )
      }
      
      setUsers(response.data)
      setTotalPages(response.pagination.totalPages)
      setTotalItems(response.pagination.totalItems)
      setCurrentPage(page)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load users. Please try again.",
        variant: "destructive",
      })
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [currentPage, role, toast])

  /**
   * Create a new user
   */
  const createUser = useCallback(async (userData: CreateUserData): Promise<boolean> => {
    try {
      const response = await userService.createUser(userData)
      
      toast({
        title: "Success",
        description: response.message || "User created successfully",
      })
      
      // Refresh the user list
      await fetchUsers()
      return true
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      })
      return false
    }
  }, [fetchUsers, toast])

  /**
   * Update an existing user
   */
  const updateUser = useCallback(async (
    userId: string,
    updateData: UpdateUserData
  ): Promise<boolean> => {
    try {
      const response = await userService.updateUser(userId, updateData)
      
      toast({
        title: "Success",
        description: response.message || "User updated successfully",
      })
      
      // Refresh the user list
      await fetchUsers()
      return true
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      })
      return false
    }
  }, [fetchUsers, toast])

  /**
   * Delete a user (mark as deleted)
   */
  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    return changeUserStatus(userId, "deleted")
  }, [])

  /**
   * Change user status
   */
  const changeUserStatus = useCallback(async (
    userId: string,
    status: User["status"]
  ): Promise<boolean> => {
    try {
      await userService.updateUser(userId, { status })
      
      const statusMessages = {
        active: "User activated successfully",
        deactivated: "User deactivated successfully",
        deleted: "User deleted successfully",
      }
      
      toast({
        title: "Success",
        description: statusMessages[status],
      })
      
      // Refresh the user list
      await fetchUsers()
      return true
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      })
      return false
    }
  }, [fetchUsers, toast])

  /**
   * Assign a teacher to a student
   */
  const assignTeacher = useCallback(async (
    studentId: string,
    teacherId: string
  ): Promise<boolean> => {
    try {
      const response = await userService.assignTeacher(studentId, teacherId)
      
      toast({
        title: "Success",
        description: response.message || "Teacher assigned successfully",
      })
      
      // Refresh the user list
      await fetchUsers()
      return true
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign teacher",
        variant: "destructive",
      })
      return false
    }
  }, [fetchUsers, toast])

  /**
   * Unassign a teacher from a student
   */
  const unassignTeacher = useCallback(async (studentId: string): Promise<boolean> => {
    try {
      const response = await userService.unassignTeacher(studentId)
      
      toast({
        title: "Success",
        description: response.message || "Teacher unassigned successfully",
      })
      
      // Refresh the user list
      await fetchUsers()
      return true
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to unassign teacher",
        variant: "destructive",
      })
      return false
    }
  }, [fetchUsers, toast])

  /**
   * Set current page
   */
  const setPage = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  /**
   * Go to next page
   */
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }, [currentPage, totalPages])

  /**
   * Go to previous page
   */
  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }, [currentPage])

  return {
    // State
    users,
    loading,
    initialLoading,
    currentPage,
    totalPages,
    totalItems,
    
    // Actions
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    changeUserStatus,
    assignTeacher,
    unassignTeacher,
    
    // Pagination
    setPage,
    nextPage,
    previousPage,
  }
}
