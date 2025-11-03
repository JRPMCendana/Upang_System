"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft,
  GraduationCap,
  BookOpen,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { formatDate, formatDateTime } from "@/utils/date.utils"
import { gradeService, type StudentGradeDetails } from "@/services/grade-service"

export default function StudentGradesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const studentId = params?.id as string

  const [gradeDetails, setGradeDetails] = useState<StudentGradeDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated || user?.role !== "teacher") {
      router.push("/login")
      return
    }
  }, [isAuthenticated, router, authLoading, user])

  useEffect(() => {
    const fetchGradeDetails = async () => {
      if (!studentId) return
      
      try {
        setLoading(true)
        const response = await gradeService.getStudentGradeDetails(studentId)
        setGradeDetails(response.data)
      } catch (error) {
        console.error("Error fetching grade details:", error)
        // Handle error - maybe redirect or show error message
      } finally {
        setLoading(false)
      }
    }

    if (studentId && isAuthenticated && user?.role === "teacher") {
      fetchGradeDetails()
    }
  }, [studentId, isAuthenticated, user])

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-text-secondary">Loading grade details...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== "teacher") return null

  if (!gradeDetails) {
    return (
      <div className="flex h-screen bg-bg-secondary">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-8 flex items-center justify-center">
            <div className="text-center">
              <p className="text-text-secondary">No grade data available</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const getGradeColor = (percentage: number | null) => {
    if (percentage === null) return "text-text-secondary"
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 80) return "text-blue-600"
    if (percentage >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getGradeBadgeColor = (percentage: number | null) => {
    if (percentage === null) return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    if (percentage >= 90) return "bg-green-500/10 text-green-600 border-green-500/20"
    if (percentage >= 80) return "bg-blue-500/10 text-blue-600 border-blue-500/20"
    if (percentage >= 70) return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
    return "bg-red-500/10 text-red-600 border-red-500/20"
  }

  const studentName = gradeDetails.student.firstName && gradeDetails.student.lastName
    ? `${gradeDetails.student.firstName} ${gradeDetails.student.lastName}`
    : gradeDetails.student.username

  return (
    <div className="flex h-screen bg-bg-secondary">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">Student Grade Details</h1>
                <p className="text-text-secondary">View detailed grade breakdown for {studentName}</p>
              </div>
            </div>

            {/* Student Info & Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="p-6">
                <p className="text-sm text-text-secondary mb-2">Student</p>
                <p className="text-xl font-bold">{studentName}</p>
                <p className="text-xs text-text-secondary mt-1">@{gradeDetails.student.username}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-text-secondary mb-2">Overall Average</p>
                <p className="text-3xl font-bold text-primary">{gradeDetails.overallAverage}%</p>
                <p className="text-xs text-text-secondary mt-2">{gradeDetails.gradedItems} graded items</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-text-secondary mb-2">Total Items</p>
                <p className="text-3xl font-bold">{gradeDetails.totalItems}</p>
                <p className="text-xs text-text-secondary mt-2">
                  {gradeDetails.gradedItems} graded, {gradeDetails.pendingItems} pending
                </p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-text-secondary mb-2">Breakdown</p>
                <p className="text-lg font-semibold">{gradeDetails.byType.assignments.length} Assignments</p>
                <p className="text-lg font-semibold">{gradeDetails.byType.quizzes.length} Quizzes</p>
              </Card>
            </div>

            {/* All Grades Table */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                All Grades
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-text-secondary">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-text-secondary">Source</th>
                      <th className="text-left py-3 px-4 font-semibold text-text-secondary">Grade</th>
                      <th className="text-left py-3 px-4 font-semibold text-text-secondary">Percentage</th>
                      <th className="text-left py-3 px-4 font-semibold text-text-secondary">Submitted</th>
                      <th className="text-left py-3 px-4 font-semibold text-text-secondary">Graded</th>
                      <th className="text-left py-3 px-4 font-semibold text-text-secondary">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradeDetails.allGrades.length > 0 ? (
                      gradeDetails.allGrades.map((grade) => (
                        <tr key={grade.id} className="border-b border-border hover:bg-bg-secondary/70">
                          <td className="py-3 px-4 align-middle">
                            <Badge className={grade.type === 'assignment' 
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                            }>
                              {grade.type === 'assignment' ? (
                                <BookOpen className="w-3 h-3 mr-1 inline" />
                              ) : (
                                <FileText className="w-3 h-3 mr-1 inline" />
                              )}
                              {grade.type.charAt(0).toUpperCase() + grade.type.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 align-middle">
                            <div className="flex flex-col">
                              <span className="font-medium">{grade.source}</span>
                              {grade.dueDate && (
                                <span className="text-xs text-text-secondary">
                                  Due: {formatDate(grade.dueDate)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 align-middle">
                            {grade.rawGrade !== null ? (
                              <span className="font-medium">
                                {grade.rawGrade} / {grade.maxScore}
                              </span>
                            ) : (
                              <span className="text-text-secondary">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 align-middle">
                            {grade.percentage !== null ? (
                              <Badge className={getGradeBadgeColor(grade.percentage)}>
                                <span className={getGradeColor(grade.percentage)}>
                                  {grade.percentage}%
                                </span>
                              </Badge>
                            ) : (
                              <span className="text-text-secondary">Not graded</span>
                            )}
                          </td>
                          <td className="py-3 px-4 align-middle text-text-secondary">
                            {grade.submittedAt ? formatDateTime(grade.submittedAt) : "—"}
                          </td>
                          <td className="py-3 px-4 align-middle text-text-secondary">
                            {grade.gradedAt ? formatDateTime(grade.gradedAt) : "—"}
                          </td>
                          <td className="py-3 px-4 align-middle">
                            {grade.percentage !== null ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-text-secondary">Graded</span>
                              </div>
                            ) : grade.isSubmitted ? (
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm text-text-secondary">Pending</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-red-600" />
                                <span className="text-sm text-text-secondary">Not submitted</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-text-secondary">
                          No grades available yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Feedback Section (if any feedback exists) */}
            {gradeDetails.allGrades.some(g => g.feedback) && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Feedback
                </h2>
                <div className="space-y-4">
                  {gradeDetails.allGrades
                    .filter(g => g.feedback)
                    .map((grade) => (
                      <div key={grade.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">{grade.source}</p>
                            <p className="text-xs text-text-secondary">{grade.type.charAt(0).toUpperCase() + grade.type.slice(1)}</p>
                          </div>
                          {grade.percentage !== null && (
                            <Badge className={getGradeBadgeColor(grade.percentage)}>
                              {grade.percentage}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-text-secondary mt-2">{grade.feedback}</p>
                      </div>
                    ))}
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

