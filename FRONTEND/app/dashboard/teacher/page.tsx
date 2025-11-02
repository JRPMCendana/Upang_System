"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Users, FileText, TrendingUp, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function TeacherDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated || user?.role !== "teacher") {
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

  if (!isAuthenticated || user?.role !== "teacher") return null

  return (
    <div className="flex h-screen bg-bg-secondary">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
                <p className="text-text-secondary">Manage your courses, assignments, and student progress.</p>
              </div>
              <Button className="bg-primary hover:bg-primary-dark">Create Assignment</Button>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Active Courses</p>
                    <p className="text-2xl font-bold">4</p>
                  </div>
                  <BookOpen className="w-10 h-10 text-primary/20" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Total Students</p>
                    <p className="text-2xl font-bold">124</p>
                  </div>
                  <Users className="w-10 h-10 text-accent/20" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Pending Reviews</p>
                    <p className="text-2xl font-bold">18</p>
                  </div>
                  <FileText className="w-10 h-10 text-warning/20" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Class Avg. Grade</p>
                    <p className="text-2xl font-bold">84%</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-danger/20" />
                </div>
              </Card>
            </div>

            {/* Assignments Needing Grading */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Assignments Awaiting Review</h2>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-accent" />
                      <div>
                        <p className="font-medium">
                          Assignment {i}:{" "}
                          {["Math Problem Set", "Essay Writing", "Science Project", "History Report"][i - 1]}
                        </p>
                        <p className="text-sm text-text-secondary">{Math.floor(Math.random() * 20) + 10} submissions</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Grade
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Courses */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Your Courses</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <BookOpen className="w-6 h-6 text-primary" />
                      <span className="text-sm text-text-secondary">{20 + i * 5} students</span>
                    </div>
                    <p className="font-semibold mb-2">
                      Course {i}:{" "}
                      {["Introduction to React", "Web Design Basics", "JavaScript Fundamentals", "Advanced CSS"][i - 1]}
                    </p>
                    <p className="text-sm text-text-secondary mb-3">
                      Next class: {["Today", "Tomorrow", "In 2 days", "Next week"][i - 1]}
                    </p>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      View Course
                    </Button>
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
