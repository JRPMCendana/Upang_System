"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { useAuthLogic, type User, type UserRole } from "@/hooks/use-auth"

// Re-export types for backward compatibility
export type { User, UserRole }

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (identifier: string, password: string) => Promise<User>
  logout: () => void
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Auth Provider Component
 * Provides authentication context to the entire application
 * Uses useAuthLogic hook for business logic (Clean Architecture)
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Delegate all business logic to the custom hook
  const auth = useAuthLogic()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * useAuth Hook
 * Access authentication context from any component
 * Must be used within an AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}