// Authentication Service

import { apiClient } from "./api-client"

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
  role: "student" | "teacher"
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    name?: string
    username?: string
    firstName?: string
    lastName?: string
    email: string
    role: string
    isActive?: boolean
  }
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const raw = await apiClient.request<any>("/auth/login", {
        method: "POST",
        body: credentials,
      })

      const wrapped = raw && raw.data && raw.data.token
      const token: string | undefined = wrapped ? raw.data.token : raw.token
      let user = wrapped ? raw.data.user : raw.user

      if (!token) {
        throw new Error("Invalid auth response from server: missing token")
      }

      apiClient.setToken(token)
      if (!user) {
        const me = await apiClient.request<any>("/auth/me", { method: "GET" })
        user = me?.data || me?.user || null
      }

      if (!user) {
        throw new Error("Invalid auth response from server: missing user")
      }

      return { token, user }
    } catch (error: any) {
      throw error
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const raw = await apiClient.request<any>("/auth/register", {
      method: "POST",
      body: credentials,
    })
    const wrapped = raw && raw.data && raw.data.token
    const token: string = wrapped ? raw.data.token : raw.token
    const user = wrapped ? raw.data.user : raw.user
    if (!token || !user) throw new Error("Invalid auth response from server")
    apiClient.setToken(token)
    return { token, user }
  }

  async logout(): Promise<void> {
    await apiClient.request("/auth/logout", { method: "POST" })
    apiClient.clearToken()
  }

  async getCurrentUser() {
    return apiClient.request("/auth/me", { method: "GET" })
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return apiClient.request("/auth/change-password", {
      method: "POST",
      body: { currentPassword, newPassword },
    })
  }
}

export const authService = new AuthService()
