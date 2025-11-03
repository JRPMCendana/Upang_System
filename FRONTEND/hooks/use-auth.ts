// Auth Business Logic Hook

import { useState, useEffect, useCallback } from "react"
import { authService } from "@/services/auth-service"
import { useToast } from "@/hooks/use-toast"
import { isTokenExpired } from "@/utils/token.utils"
import {
  saveUser,
  getUser,
  saveToken,
  getToken,
  clearAuthStorage,
  getStoredSession,
} from "@/utils/storage.utils"

export type UserRole = "student" | "teacher" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  enrolledCourses?: string[]
  createdAt: string
}

interface UseAuthReturn {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  login: (identifier: string, password: string) => Promise<User>
  logout: () => void
  refreshSession: () => void
}

/**
 * Map backend user response to frontend User type
 */
function mapBackendUser(u: any): User {
  const role = u.role === "administrator" ? ("admin" as UserRole) : (u.role as UserRole)
  const name = u.firstName || u.lastName 
    ? `${u.firstName || ""} ${u.lastName || ""}`.trim() 
    : u.name || u.username || u.email
  
  return {
    id: u.id || u._id || `user_${Date.now()}`,
    email: u.email,
    name,
    role: role,
    enrolledCourses: [],
    createdAt: new Date().toISOString(),
  }
}

/**
 * Custom hook for authentication business logic
 * Handles login, logout, session restoration, and token validation
 */
export function useAuthLogic(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  /**
   * Restore user session from local storage
   */
  const restoreSession = useCallback(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    const { hasUser, hasToken, user: storedUser, token } = getStoredSession()
    
    console.log('Auth check on mount:', { 
      hasUser, 
      hasToken,
      tokenPreview: token ? token.substring(0, 20) + '...' : null
    })
    
    if (storedUser && token) {
      try {
        const expired = isTokenExpired(token)
        console.log('Token expired:', expired)
        
        if (expired) {
          console.log('Clearing expired session')
          clearAuthStorage()
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          })
        } else {
          // Restore user session
          console.log('Restoring user session')
          console.log('Restored user:', storedUser)
          setUser(storedUser)
        }
      } catch (error) {
        console.error('Error restoring session:', error)
        clearAuthStorage()
      }
    } else {
      console.log('No stored credentials found')
    }
    
    setIsLoading(false)
  }, [toast])

  /**
   * Initialize session on mount
   */
  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  /**
   * Login user with email/username and password
   */
  const login = useCallback(async (identifier: string, password: string): Promise<User> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const resp = await authService.login({ email: identifier, password })
      const normalized = mapBackendUser(resp.user)
      
      // Save to state and storage
      setUser(normalized)
      saveUser(normalized)
      
      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${normalized.name}`,
      })
      
      return normalized
    } catch (err: any) {
      // Handle specific error messages from backend
      const errorMessage = err.message || "Login failed. Please check your credentials."
      const status = err.status
      
      setError(errorMessage)
      
      // Show specific toast based on error status
      if (status === 403 && errorMessage.includes('deleted')) {
        toast({
          title: "Account Deleted",
          description: "Your account has been deleted. Please contact the administrator for assistance.",
          variant: "destructive",
        })
      } else if (status === 403) {
        toast({
          title: "Account Deactivated",
          description: errorMessage,
          variant: "destructive",
        })
      } else if (status === 401) {
        toast({
          title: "Invalid Credentials",
          description: "The email or password you entered is incorrect. Please try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        })
      }
      
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  /**
   * Logout user and clear session
   */
  const logout = useCallback(() => {
    const userName = user?.name || "User"
    
    // Clear state and storage
    setUser(null)
    clearAuthStorage()
    
    toast({
      title: "Logged Out",
      description: `Goodbye, ${userName}! See you next time.`,
    })
  }, [user, toast])

  /**
   * Refresh session (re-validate token and restore user)
   */
  const refreshSession = useCallback(() => {
    restoreSession()
  }, [restoreSession])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    logout,
    refreshSession,
  }
}
