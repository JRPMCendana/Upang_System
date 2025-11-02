"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { authService } from "@/services/auth-service"

export type UserRole = "student" | "teacher" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  enrolledCourses?: string[]
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (identifier: string, password: string) => Promise<User>
  logout: () => void
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Normalize backend user payload into our User shape
const mapBackendUser = (u: any): User => {
  const role = u.role === "administrator" ? ("admin" as UserRole) : (u.role as UserRole)
  const name = u.firstName || u.lastName ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : u.name || u.username || u.email
  return {
    id: u.id || u._id || `user_${Date.now()}`,
    email: u.email,
    name,
    role: role,
    enrolledCourses: [],
    createdAt: new Date().toISOString(),
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("upanglearn_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem("upanglearn_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (identifier: string, password: string): Promise<User> => {
    setIsLoading(true)
    setError(null)
    try {
      const resp = await authService.login({ email: identifier, password })
      const normalized = mapBackendUser(resp.user)
      setUser(normalized)
      localStorage.setItem("upanglearn_user", JSON.stringify(normalized))
      return normalized
    } catch (err: any) {
      setError("Login failed. Please check your credentials.")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("upanglearn_user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
