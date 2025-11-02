// User Management Service - Infrastructure Layer
// Pure API calls, no business logic

import { apiClient } from "./api-client"
import type {
  User,
  CreateUserData,
  UpdateUserData,
  GetUsersResponse,
  CreateUserResponse,
  UpdateUserResponse,
} from "@/types/user.types"

// Re-export types for backward compatibility
export type { User, CreateUserData, UpdateUserData }

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
}

export const userService = new UserService()
