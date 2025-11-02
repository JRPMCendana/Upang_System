"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, Search, Plus, Clock, MoreVertical } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function QuizzesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router, authLoading])

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <ClipboardList className="w-8 h-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  const mockQuizzes = [
    {
      id: 1,
      title: "React Hooks Quiz",
      course: "Introduction to React",
      questions: 10,
      timeLimit: 30,
      passingScore: 70,
      status: "active",
      totalAttempts: 38,
      averageScore: 78,
      dueDate: "Jan 25, 2025",
      type: "auto-graded",
    },
    {
      id: 2,
      title: "CSS Grid Concepts",
      course: "Web Design Basics",
      questions: 8,
      timeLimit: 20,
      passingScore: 75,
      status: "active",
      totalAttempts: 32,
      averageScore: 82,
      dueDate: "Jan 28, 2025",
      type: "auto-graded",
    },
    {
      id: 3,
      title: "JavaScript Async/Await",
      course: "JavaScript Fundamentals",
      questions: 12,
      timeLimit: 45,
      passingScore: 65,
      status: "closed",
      totalAttempts: 50,
      averageScore: 76,
      dueDate: "Jan 22, 2025",
      type: "auto-graded",
    },
    {
      id: 4,
      title: "Advanced CSS Animations",
      course: "Advanced CSS",
      questions: 6,
      timeLimit: 15,
      passingScore: 80,
      status: "draft",
      totalAttempts: 0,
      averageScore: 0,
      dueDate: "Feb 5, 2025",
      type: "auto-graded",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return { bg: "bg-accent/10", text: "text-accent", label: "Active" }
      case "closed":
        return { bg: "bg-danger/10", text: "text-danger", label: "Closed" }
      case "draft":
        return { bg: "bg-warning/10", text: "text-warning", label: "Draft" }
      default:
        return { bg: "bg-bg-tertiary", text: "text-text-secondary", label: "Unknown" }
    }
  }

  const filteredQuizzes = mockQuizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.course.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex h-screen bg-bg-secondary">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Quizzes</h1>
                <p className="text-text-secondary">Create and manage interactive quizzes</p>
              </div>
              {user?.role === "teacher" && (
                <Button className="bg-primary hover:bg-primary-dark gap-2">
                  <Plus className="w-5 h-5" />
                  Create Quiz
                </Button>
              )}
            </div>

            {/* Search */}
            <Card className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
                <Input
                  placeholder="Search quizzes..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </Card>

            {/* Quizzes List */}
            <div className="space-y-4">
              {filteredQuizzes.map((quiz) => {
                const statusColor = getStatusColor(quiz.status)
                return (
                  <Card key={quiz.id} className="p-6 hover:shadow-lg transition">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center shrink-0 mt-1">
                          <ClipboardList className="w-6 h-6 text-warning" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-lg font-semibold">{quiz.title}</h3>
                            <Badge className={`${statusColor.bg} ${statusColor.text}`}>{statusColor.label}</Badge>
                          </div>
                          <p className="text-sm text-text-secondary mb-2">{quiz.course}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-text-secondary shrink-0">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-5 gap-4 py-4 border-y border-border">
                      <div>
                        <p className="text-xs text-text-secondary mb-1">Questions</p>
                        <p className="font-semibold text-lg">{quiz.questions}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary mb-1">Time Limit</p>
                        <p className="font-semibold text-lg">{quiz.timeLimit}m</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary mb-1">Passing Score</p>
                        <p className="font-semibold text-lg">{quiz.passingScore}%</p>
                      </div>
                      {user?.role === "teacher" && (
                        <>
                          <div>
                            <p className="text-xs text-text-secondary mb-1">Attempts</p>
                            <p className="font-semibold text-lg">{quiz.totalAttempts}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-secondary mb-1">Avg. Score</p>
                            <p className="font-semibold text-lg">{quiz.averageScore}%</p>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary pt-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Due: {quiz.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-bg-secondary rounded text-xs">{quiz.type}</span>
                      </div>
                      <Button className="ml-auto" variant={user?.role === "teacher" ? "outline" : "default"} size="sm">
                        {user?.role === "teacher" ? "View Results" : "Take Quiz"}
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
