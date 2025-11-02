"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { authService } from "@/services/auth-service"
import { useToast } from "@/hooks/use-toast"

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

const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (!payload.exp) return false // If no expiration, treat as valid
    const expirationTime = payload.exp * 1000
    return Date.now() >= expirationTime
  } catch (error) {
    console.error('Error checking token expiration:', error)
    return true
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    const storedUser = localStorage.getItem("upanglearn_user")
    const storedToken = localStorage.getItem("authToken")
    
    console.log('Auth check on mount:', { 
      hasUser: !!storedUser, 
      hasToken: !!storedToken,
      tokenPreview: storedToken ? storedToken.substring(0, 20) + '...' : null
    })
    
    if (storedUser && storedToken) {
      try {
        const expired = isTokenExpired(storedToken)
        console.log('Token expired:', expired)
        
        if (expired) {
          console.log('Clearing expired session')
          localStorage.removeItem("upanglearn_user")
          localStorage.removeItem("authToken")
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          })
        } else {
          // Restore user and token in apiClient
          console.log('Restoring user session')
          const parsedUser = JSON.parse(storedUser)
          console.log('Restored user:', parsedUser)
          setUser(parsedUser)
        }
      } catch (error) {
        console.error('Error restoring session:', error)
        localStorage.removeItem("upanglearn_user")
        localStorage.removeItem("authToken")
      }
    } else {
      console.log('No stored credentials found')
    }
    setIsLoading(false)
  }, [toast])

  const login = async (identifier: string, password: string): Promise<User> => {
    setIsLoading(true)
    setError(null)
    try {
      const resp = await authService.login({ email: identifier, password })
      const normalized = mapBackendUser(resp.user)
      setUser(normalized)
      localStorage.setItem("upanglearn_user", JSON.stringify(normalized))
      
      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${normalized.name}`,
      })
      
      return normalized
    } catch (err: any) {
      setError("Login failed. Please check your credentials.")
      toast({
        title: "Login Failed",
        description: "Please check your email and password.",
        variant: "destructive",
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    const userName = user?.name || "User"
    setUser(null)
    localStorage.removeItem("upanglearn_user")
    localStorage.removeItem("authToken")
    
    toast({
      title: "Logged Out",
      description: `Goodbye, ${userName}! See you next time.`,
    })
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