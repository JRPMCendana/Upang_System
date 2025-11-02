"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FileText, Search, Plus, Calendar, AlertCircle, CheckCircle, Clock, MoreVertical } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AssignmentsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

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
          <FileText className="w-8 h-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  const mockAssignments = [
    {
      id: 1,
      title: "React Hooks Implementation",
      course: "Introduction to React",
      dueDate: "Jan 25, 2025",
      status: "pending",
      submissions: 12,
      totalStudents: 45,
      description: "Create a custom hook that manages form state",
    },
    {
      id: 2,
      title: "CSS Grid Layout Project",
      course: "Web Design Basics",
      dueDate: "Jan 28, 2025",
      status: "submitted",
      submissions: 38,
      totalStudents: 38,
      description: "Build a responsive website using CSS Grid",
    },
    {
      id: 3,
      title: "Async/Await Deep Dive",
      course: "JavaScript Fundamentals",
      dueDate: "Jan 22, 2025",
      status: "overdue",
      submissions: 48,
      totalStudents: 52,
      description: "Solve async programming challenges",
    },
    {
      id: 4,
      title: "Portfolio Website",
      course: "Advanced CSS",
      dueDate: "Feb 5, 2025",
      status: "pending",
      submissions: 8,
      totalStudents: 32,
      description: "Create a personal portfolio using advanced CSS techniques",
    },
    {
      id: 5,
      title: "React Context API",
      course: "Introduction to React",
      dueDate: "Jan 30, 2025",
      status: "pending",
      submissions: 5,
      totalStudents: 45,
      description: "Implement state management with Context API",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return { bg: "bg-warning/10", text: "text-warning", label: "Pending" }
      case "submitted":
        return { bg: "bg-accent/10", text: "text-accent", label: "Submitted" }
      case "overdue":
        return { bg: "bg-danger/10", text: "text-danger", label: "Overdue" }
      default:
        return { bg: "bg-bg-tertiary", text: "text-text-secondary", label: "Unknown" }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "submitted":
        return <CheckCircle className="w-4 h-4" />
      case "overdue":
        return <AlertCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  const filteredAssignments = mockAssignments.filter((assignment) => {
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.course.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || assignment.status === filterStatus
    return matchesSearch && matchesStatus
  })

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
                <h1 className="text-3xl font-bold mb-2">Assignments</h1>
                <p className="text-text-secondary">Manage and track all assignments</p>
              </div>
              {user?.role === "teacher" && (
                <Button className="bg-primary hover:bg-primary-dark gap-2">
                  <Plus className="w-5 h-5" />
                  Create Assignment
                </Button>
              )}
            </div>

            {/* Filters */}
            <Card className="p-4 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
                  <Input
                    placeholder="Search assignments..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  {["all", "pending", "submitted", "overdue"].map((status) => (
                    <Button
                      key={status}
                      variant={filterStatus === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus(status)}
                      className="capitalize"
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Assignments List */}
            <div className="space-y-4">
              {filteredAssignments.length === 0 ? (
                <Card className="p-12 text-center">
                  <FileText className="w-12 h-12 text-text-secondary/20 mx-auto mb-4" />
                  <p className="text-text-secondary">No assignments found</p>
                </Card>
              ) : (
                filteredAssignments.map((assignment) => {
                  const statusColor = getStatusColor(assignment.status)
                  return (
                    <Card key={assignment.id} className="p-6 hover:shadow-lg transition">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center shrink-0 mt-1">
                            <FileText className="w-6 h-6 text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold">{assignment.title}</h3>
                              <Badge className={`${statusColor.bg} ${statusColor.text}`}>
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(assignment.status)}
                                  {statusColor.label}
                                </span>
                              </Badge>
                            </div>
                            <p className="text-sm text-text-secondary mb-2">{assignment.course}</p>
                            <p className="text-sm text-text-secondary line-clamp-1">{assignment.description}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-text-secondary shrink-0">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 text-sm text-text-secondary pt-4 border-t border-border">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {assignment.dueDate}</span>
                        </div>
                        {user?.role === "teacher" && (
                          <div className="flex items-center gap-2">
                            <span>
                              {assignment.submissions}/{assignment.totalStudents} submissions
                            </span>
                          </div>
                        )}
                        <Button
                          className="ml-auto"
                          variant={user?.role === "teacher" ? "outline" : "default"}
                          size="sm"
                        >
                          {user?.role === "teacher" ? "Review Submissions" : "Submit"}
                        </Button>
                      </div>
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
