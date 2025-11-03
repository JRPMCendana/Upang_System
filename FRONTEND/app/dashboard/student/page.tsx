"use client"

import { BookOpen } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function StudentDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return
    
    // Redirect to main dashboard (which has real student data)
    if (isAuthenticated && user?.role === "student") {
      router.push("/dashboard")
      return
    }
    
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, user, router, authLoading])

  // Show loading state while redirecting
  return (
    <div className="flex h-screen items-center justify-center bg-bg-secondary">
      <div className="text-center">
        <BookOpen className="w-8 h-8 animate-pulse mx-auto mb-4 text-primary" />
        <p className="text-text-secondary">Redirecting to dashboard...</p>
      </div>
    </div>
  )
}
