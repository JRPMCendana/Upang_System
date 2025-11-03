// User Domain Types

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
