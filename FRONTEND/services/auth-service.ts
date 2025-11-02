// Authentication Service

import { apiClient } from "./api-client"

export interface LoginCredentials {
  email: string
  password: string
  role: "student" | "teacher" | "admin"
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
    name: string
    email: string
    role: string
  }
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: credentials,
    })
    apiClient.setToken(response.token)
    return response
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: credentials,
    })
    apiClient.setToken(response.token)
    return response
  }

  async logout(): Promise<void> {
    await apiClient.request("/auth/logout", { method: "POST" })
    apiClient.clearToken()
  }

  async getCurrentUser() {
    return apiClient.request("/auth/me", { method: "GET" })
  }
}

export const authService = new AuthService()
