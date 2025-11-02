"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { BarChart3, BookOpen, FileText, TrendingUp, Clock } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function StudentDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated || user?.role !== "student") {
      router.push("/login")
    }
  }, [isAuthenticated, user, router, authLoading])

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <BookOpen className="w-8 h-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== "student") return null

  return (
    <div className="flex h-screen bg-bg-secondary">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Welcome Section */}
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
              <p className="text-text-secondary">Here's your learning overview for this week.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Active Courses</p>
                    <p className="text-2xl font-bold">5</p>
                  </div>
                  <BookOpen className="w-10 h-10 text-primary/20" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Pending Assignments</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <FileText className="w-10 h-10 text-accent/20" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Average Grade</p>
                    <p className="text-2xl font-bold">87%</p>
                  </div>
                  <BarChart3 className="w-10 h-10 text-warning/20" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Completion Rate</p>
                    <p className="text-2xl font-bold">72%</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-danger/20" />
                </div>
              </Card>
            </div>

            {/* Pending Assignments */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Pending Assignments</h2>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-warning" />
                      <div>
                        <p className="font-medium">
                          Assignment {i}: {["Math Problem Set", "Essay Writing", "Science Project"][i - 1]}
                        </p>
                        <p className="text-sm text-text-secondary">Due in {5 - i} days</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-warning/10 text-warning rounded-full text-sm font-medium">
                      Due Soon
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Completed Courses */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Courses</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <BookOpen className="w-6 h-6 text-primary" />
                      <span className="text-sm text-text-secondary">{60 + i * 10}% Complete</span>
                    </div>
                    <p className="font-semibold mb-2">
                      Course {i}: {["Introduction to React", "Web Design Basics", "JavaScript Fundamentals"][i - 1]}
                    </p>
                    <div className="w-full bg-bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${60 + i * 10}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
