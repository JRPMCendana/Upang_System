// User Management Service

import { apiClient } from "./api-client"

export interface User {
  _id: string
  username: string
  email: string
  role: "student" | "teacher" | "administrator"
  firstName?: string
  lastName?: string
  isActive: boolean
  status: "active" | "deactivated" | "deleted"
  assignedTeacher?: User | string | null
  createdAt: string
  updatedAt: string
}

export interface CreateUserData {
  email: string
  password: string
  username: string
  role: "student" | "teacher"
  firstName?: string
  lastName?: string
}

export interface UpdateUserData {
  email?: string
  password?: string
  username?: string
  firstName?: string
  lastName?: string
  status?: "active" | "deactivated" | "deleted"
}

export interface PaginationInfo {
  currentPage: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface GetUsersResponse {
  success: boolean
  data: User[]
  pagination: PaginationInfo
}

export interface CreateUserResponse {
  success: boolean
  message: string
  data: User
}

export interface UpdateUserResponse {
  success: boolean
  message: string
  data: User
}

class UserService {
  /**
   * Get all users with pagination and filters (Admin only)
   */
  async getUsers(
    page: number = 1,
    limit: number = 10,
    role?: "student" | "teacher",
    status?: "active" | "deactivated" | "deleted"
  ): Promise<GetUsersResponse> {
    const params: Record<string, any> = { page, limit }
    if (role) params.role = role
    if (status) params.status = status

    return apiClient.request<GetUsersResponse>("/admin/users", {
      method: "GET",
      params,
    })
  }

  /**
   * Create a new user account (Admin only)
   */
  async createUser(userData: CreateUserData): Promise<CreateUserResponse> {
    return apiClient.request<CreateUserResponse>("/admin/create-account", {
      method: "POST",
      body: userData,
    })
  }

  /**
   * Update an existing user (Admin only)
   */
  async updateUser(userId: string, updateData: UpdateUserData): Promise<UpdateUserResponse> {
    return apiClient.request<UpdateUserResponse>(`/admin/update-user/${userId}`, {
      method: "PUT",
      body: updateData,
    })
  }

  /**
   * Change current user's password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return apiClient.request("/auth/change-password", {
      method: "POST",
      body: { currentPassword, newPassword },
    })
  }

  /**
   * Assign a teacher to a student (Admin only)
   */
  async assignTeacher(studentId: string, teacherId: string): Promise<{ success: boolean; message: string; data: User }> {
    return apiClient.request(`/admin/assign-teacher/${studentId}`, {
      method: "POST",
      body: { teacherId },
    })
  }

  /**
   * Unassign a teacher from a student (Admin only)
   */
  async unassignTeacher(studentId: string): Promise<{ success: boolean; message: string; data: User }> {
    return apiClient.request(`/admin/unassign-teacher/${studentId}`, {
      method: "DELETE",
    })
  }

  /**
   * Get assigned students for a teacher (Teacher only)
   */
  async getAssignedStudents(
    page: number = 1,
    limit: number = 10
  ): Promise<GetUsersResponse> {
    const params: Record<string, any> = { page, limit }

    return apiClient.request<GetUsersResponse>("/teacher/assigned-students", {
      method: "GET",
      params,
    })
  }

  /**
   * Get a specific assigned student by ID (Teacher only)
   */
  async getAssignedStudent(studentId: string): Promise<{ success: boolean; data: User }> {
    return apiClient.request(`/teacher/assigned-students/${studentId}`, {
      method: "GET",
    })
  }

  /**
   * Get user's full name
   */
  getUserFullName(user: User): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    if (user.firstName) return user.firstName
    if (user.lastName) return user.lastName
    return user.username
  }

  /**
   * Get user initials for avatar
   */
  getUserInitials(user: User): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    if (user.firstName) return user.firstName[0].toUpperCase()
    if (user.lastName) return user.lastName[0].toUpperCase()
    return user.username.substring(0, 2).toUpperCase()
  }
}

export const userService = new UserService()
