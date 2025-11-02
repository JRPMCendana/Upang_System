"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

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
  login: (email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Generate display names based on role
const getDisplayName = (email: string, role: UserRole) => {
  const roleNames: Record<UserRole, string> = {
    student: "Student User",
    teacher: "Teacher User",
    admin: "Admin User",
  }
  return roleNames[role]
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

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true)
    setError(null)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const userData: User = {
        id: `user_${Date.now()}`,
        email,
        name: getDisplayName(email, role),
        role,
        enrolledCourses: [],
        createdAt: new Date().toISOString(),
      }

      setUser(userData)
      localStorage.setItem("upanglearn_user", JSON.stringify(userData))
    } catch (err) {
      setError("Login failed. Please try again.")
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
