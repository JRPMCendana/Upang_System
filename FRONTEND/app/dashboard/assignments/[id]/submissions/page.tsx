"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  FileText, 
  ArrowLeft, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Calendar
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect } from "react"
import { useAssignmentSubmissions } from "@/hooks/use-assignment-submissions"
import { formatDate } from "@/utils/date.utils"
import type { AssignmentSubmission } from "@/types/assignment.types"

export default function AssignmentSubmissionsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const assignmentId = params.id as string

  // Use the dedicated submissions hook
  const {
    submissions,
    assignment,
    loading,
    initialLoading,
    gradingSubmissionId,
    gradeFormData,
    startGrading,
    cancelGrading,
    updateGradeForm,
    submitGrade,
    downloadSubmission,
  } = useAssignmentSubmissions({ assignmentId, autoFetch: true })

  // Handle authentication and authorization
  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    if (user?.role !== "teacher") {
      router.push("/dashboard/assignments")
      return
    }
  }, [isAuthenticated, authLoading, user, router])

  // Event handlers - simple, no business logic
  const handleGradeSubmission = async (submissionId: string) => {
    await submitGrade(submissionId)
  }

  const handleDownloadSubmission = (fileId: string, fileName: string) => {
    downloadSubmission(fileId, fileName)
  }

  const handleStartGrading = (submission: AssignmentSubmission) => {
    startGrading(submission._id, submission.grade, submission.feedback)
  }

  const handleCancelGrading = () => {
    cancelGrading()
  }

  const handleGradeChange = (grade: number) => {
    updateGradeForm({ grade })
  }

  const handleFeedbackChange = (feedback: string) => {
    updateGradeForm({ feedback })
  }

  // UI helper function (pure presentation logic)
  const getSubmissionStatusBadge = (submission: AssignmentSubmission) => {
    if (submission.status === "graded") {
      return (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          Graded
        </Badge>
      )
    }
    if (submission.status === "late") {
      return (
        <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
          <Clock className="w-3 h-3 mr-1" />
          Late
        </Badge>
      )
    }
    return (
      <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
        <Clock className="w-3 h-3 mr-1" />
        Submitted
      </Badge>
    )
  }

  // Loading state
  if (authLoading || initialLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <FileText className="w-8 h-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-text-secondary">Loading submissions...</p>
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
                <h1 className="text-3xl font-bold mb-2">
                  {assignment?.title || "Assignment"} - Submissions
                </h1>
                <p className="text-text-secondary">
                  Review and grade student submissions ({submissions.length} total)
                </p>
              </div>
            </div>

            {/* Submissions List */}
            <div className="space-y-4">
              {submissions.length === 0 ? (
                <Card className="p-12 text-center">
                  <FileText className="w-12 h-12 text-text-secondary/20 mx-auto mb-4" />
                  <p className="text-text-secondary">No submissions yet</p>
                </Card>
              ) : (
                submissions.map((submission) => (
                  <Card key={submission._id} className="p-6">
                    <div className="space-y-4">
                      {/* Student Info and Status */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">
                              {submission.student?.firstName} {submission.student?.lastName}
                            </h3>
                            <p className="text-sm text-text-secondary">{submission.student?.email}</p>
                            <div className="flex items-center gap-2 mt-2 text-sm text-text-secondary">
                              <Calendar className="w-4 h-4" />
                              <span>Submitted: {formatDate(submission.submittedAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSubmissionStatusBadge(submission)}
                          {submission.grade !== null && submission.grade !== undefined && (
                            <Badge className="bg-accent/10 text-accent border-accent/20">
                              {submission.grade}/100
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Submission File */}
                      {submission.fileUrl && (
                        <div className="flex items-center gap-3 p-4 bg-bg-secondary rounded-lg">
                          <FileText className="w-5 h-5 text-primary" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Submitted File</p>
                            <p className="text-xs text-text-secondary">
                              Click download to view submission
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadSubmission(submission.fileUrl!, `submission-${submission.student?.username}.pdf`)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      )}

                      {/* Existing Feedback */}
                      {submission.feedback && (
                        <div className="p-4 bg-bg-secondary rounded-lg">
                          <p className="text-sm font-medium mb-2">Feedback</p>
                          <p className="text-sm text-text-secondary">{submission.feedback}</p>
                        </div>
                      )}

                      {/* Grading Form */}
                      {gradingSubmissionId === submission._id ? (
                        <div className="border-t border-border pt-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`grade-${submission._id}`}>Grade (0-100)</Label>
                              <Input
                                id={`grade-${submission._id}`}
                                type="number"
                                min="0"
                                max="100"
                                value={gradeFormData.grade}
                                onChange={(e) => handleGradeChange(parseInt(e.target.value) || 0)}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`feedback-${submission._id}`}>Feedback</Label>
                            <Textarea
                              id={`feedback-${submission._id}`}
                              rows={4}
                              placeholder="Provide feedback for the student..."
                              value={gradeFormData.feedback}
                              onChange={(e) => handleFeedbackChange(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleGradeSubmission(submission._id)}
                              disabled={!gradeFormData.grade || loading}
                            >
                              Submit Grade
                            </Button>
                            <Button
                              variant="outline"
                              onClick={handleCancelGrading}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-t border-border pt-4">
                          <Button
                            variant="outline"
                            onClick={() => handleStartGrading(submission)}
                          >
                            {submission.grade ? "Update Grade" : "Grade Submission"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
