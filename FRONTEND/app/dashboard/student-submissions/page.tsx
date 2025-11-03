"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Search, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSubmissions } from "@/hooks/use-submissions"
import { formatRelativeTime } from "@/utils/date.utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function StudentSubmissionsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Use custom hook for submissions
  const {
    submissions,
    loading,
    totalItems,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    breakdown,
    fetchSubmissions,
  } = useSubmissions()

  useEffect(() => {
    if (authLoading) return
    
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    if (user && user.role !== "admin") {
      router.push(`/dashboard/${user.role}`)
    }
  }, [isAuthenticated, router, user, authLoading])

  // Fetch submissions on mount and when filters change
  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      fetchSubmissions(1, 10, typeFilter, statusFilter, searchQuery)
    }
  }, [isAuthenticated, user, typeFilter, statusFilter, fetchSubmissions])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated && user?.role === "admin") {
        fetchSubmissions(1, 10, typeFilter, statusFilter, searchQuery)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handlePageChange = (newPage: number) => {
    fetchSubmissions(newPage, 10, typeFilter, statusFilter, searchQuery)
  }

  const getScoreColor = (grade: number | null, maxGrade: number) => {
    if (grade === null) return "bg-gray-500/10 text-gray-500"
    const percentage = (grade / maxGrade) * 100
    if (percentage >= 90) return "bg-green-500/10 text-green-500"
    if (percentage >= 75) return "bg-blue-500/10 text-blue-500"
    if (percentage >= 60) return "bg-yellow-500/10 text-yellow-500"
    return "bg-red-500/10 text-red-500"
  }

  const getTypeIcon = (type: string) => {
    if (type === "quiz") return "🧠"
    if (type === "exam") return "📝"
    return "📄"
  }

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-text-secondary">Loading submissions...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || (user && user.role !== "admin")) return null

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
                <h1 className="text-3xl font-bold mb-2">Student Submissions</h1>
                <p className="text-text-secondary">
                  Review and manage submissions • {totalItems} total
                </p>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4">
                <p className="text-sm text-text-secondary mb-1">Total Submissions</p>
                <p className="text-2xl font-bold">{breakdown.total}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-text-secondary mb-1">Assignments</p>
                <p className="text-2xl font-bold">{breakdown.totalAssignments}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-text-secondary mb-1">Quizzes</p>
                <p className="text-2xl font-bold">{breakdown.totalQuizzes}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-text-secondary mb-1">Exams</p>
                <p className="text-2xl font-bold">{breakdown.totalExams || 0}</p>
              </Card>
            </div>

            {/* Filters */}
            <Card className="p-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
                  <Input
                    placeholder="Search by student or activity..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="assignment">Assignments</SelectItem>
                    <SelectItem value="quiz">Quizzes</SelectItem>
                    <SelectItem value="exam">Exams</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="graded">Graded</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Submissions list */}
            <div className="space-y-4">
              {loading && (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-text-secondary">Loading submissions...</p>
                </div>
              )}

              {!loading && submissions.length === 0 && (
                <Card className="p-12 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-text-secondary" />
                  <h3 className="text-lg font-semibold mb-2">No submissions found</h3>
                  <p className="text-text-secondary">
                    {searchQuery || typeFilter !== "all" || statusFilter !== "all"
                      ? "Try adjusting your filters"
                      : "No submissions have been submitted yet"}
                  </p>
                </Card>
              )}

              {!loading && submissions.map((s) => (
                <Card key={s._id} className="p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 text-2xl">
                        {getTypeIcon(s.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">{s.activity}</h3>
                          <Badge variant="outline" className="text-xs">
                            {s.type === "quiz" ? "Quiz" : "Assignment"}
                          </Badge>
                        </div>
                        {s.description && (
                          <p className="text-sm text-text-secondary mb-2 line-clamp-1">
                            {s.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                          <span className="font-medium">{s.student}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatRelativeTime(s.submittedAt)}
                          </span>
                          {s.grade !== null ? (
                            <Badge className={getScoreColor(s.grade, s.maxGrade)}>
                              Score: {s.grade}/{s.maxGrade}
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-500/10 text-gray-500">
                              Pending Grade
                            </Badge>
                          )}
                          {s.submittedDocumentName && (
                            <span className="text-xs">📎 {s.submittedDocumentName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {!loading && submissions.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-secondary">
                  Page {currentPage} of {totalPages} • Showing {submissions.length} of {totalItems} submissions
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPrevPage}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
