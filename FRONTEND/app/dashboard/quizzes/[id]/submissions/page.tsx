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
  Clock,
  User,
  Calendar,
  Eye,
  Image as ImageIcon
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { quizService } from "@/services/quiz-service"
import { formatDate } from "@/utils/date.utils"
import { useToast } from "@/hooks/use-toast"
import type { QuizSubmission } from "@/types/quiz.types"
import { FileViewerDialog } from "@/components/dialogs/file-viewer-dialog"

export default function QuizSubmissionsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string
  const { toast } = useToast()

  const [submissions, setSubmissions] = useState<QuizSubmission[]>([])
  const [quiz, setQuiz] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null)
  const [gradeFormData, setGradeFormData] = useState({ grade: 0, feedback: "" })
  
  // File viewer state
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewingFile, setViewingFile] = useState<{
    fileId: string
    fileName: string
    fileType: string
  } | null>(null)

  // Fetch submissions
  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    try {
      const response = await quizService.getSubmissionsByQuiz(quizId)
      if (response && response.data) {
        setSubmissions(response.data)
      }
      
      // Fetch quiz details
      const quizResponse = await quizService.getQuizById(quizId)
      if (quizResponse && quizResponse.data) {
        setQuiz(quizResponse.data)
      }
    } catch (error: any) {
      console.error("Error fetching submissions:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch submissions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [quizId, toast])

  // View file in modal
  const handleViewFile = useCallback((fileId: string, fileName: string, fileType?: string) => {
    setViewingFile({
      fileId,
      fileName: fileName || "Quiz Submission",
      fileType: fileType || "image/png"
    })
    setViewerOpen(true)
  }, [])

  // Download submission file
  const handleDownloadSubmission = useCallback(async (fileId: string, fileName: string) => {
    try {
      const blob = await quizService.downloadSubmissionFile(fileId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName || 'quiz-submission'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to download file",
        variant: "destructive",
      })
    }
  }, [toast])

  // Grade submission
  const handleGradeSubmission = useCallback(async (submissionId: string) => {
    if (!gradeFormData.grade) {
      toast({
        title: "Validation Error",
        description: "Please enter a grade",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await quizService.gradeSubmission(submissionId, {
        grade: gradeFormData.grade,
        feedback: gradeFormData.feedback || undefined
      })
      
      toast({
        title: "Success",
        description: "Submission graded successfully",
      })
      
      setGradingSubmissionId(null)
      setGradeFormData({ grade: 0, feedback: "" })
      await fetchSubmissions()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to grade submission",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [gradeFormData, fetchSubmissions, toast])

  // Handle authentication and authorization
  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    if (user?.role !== "teacher") {
      router.push("/dashboard/quizzes")
      return
    }
  }, [isAuthenticated, authLoading, user, router])

  useEffect(() => {
    if (quizId && isAuthenticated && user?.role === "teacher") {
      fetchSubmissions()
    }
  }, [quizId, isAuthenticated, user, fetchSubmissions])

  // UI helper
  const getSubmissionStatusBadge = (submission: QuizSubmission) => {
    if (submission.grade !== null && submission.grade !== undefined) {
      return (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          Graded
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
                  {quiz?.title || "Quiz"} - Submissions
                </h1>
                <p className="text-text-secondary">
                  Review and grade student quiz submissions ({submissions.length} total)
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
                              <span>Submitted: {submission.submittedAt ? formatDate(submission.submittedAt) : "N/A"}</span>
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

                      {/* Submission File (Image/Screenshot) */}
                      {(submission.submittedDocument || submission.fileUrl) && (
                        <div className="flex items-center gap-3 p-4 bg-bg-secondary rounded-lg">
                          <ImageIcon className="w-5 h-5 text-primary" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {submission.submittedDocumentName || "Quiz Screenshot"}
                            </p>
                            <p className="text-xs text-text-secondary">
                              {submission.submittedDocumentType || "Image submission"}
                              {submission.submittedDocumentName && ` • ${submission.submittedDocumentName}`}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const fileId = submission.submittedDocument || submission.fileUrl
                                const fileName = submission.submittedDocumentName || `quiz-submission-${submission.student?.username || 'file'}.png`
                                if (fileId) {
                                  handleViewFile(fileId, fileName, submission.submittedDocumentType || undefined)
                                }
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const fileId = submission.submittedDocument || submission.fileUrl
                                const fileName = submission.submittedDocumentName || `quiz-submission-${submission.student?.username || 'file'}.png`
                                if (fileId) {
                                  handleDownloadSubmission(fileId, fileName)
                                }
                              }}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
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
                                onChange={(e) => setGradeFormData(prev => ({ ...prev, grade: parseInt(e.target.value) || 0 }))}
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
                              onChange={(e) => setGradeFormData(prev => ({ ...prev, feedback: e.target.value }))}
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
                              onClick={() => {
                                setGradingSubmissionId(null)
                                setGradeFormData({ grade: 0, feedback: "" })
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-t border-border pt-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setGradingSubmissionId(submission._id)
                              setGradeFormData({
                                grade: submission.grade || 0,
                                feedback: submission.feedback || ""
                              })
                            }}
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

      {/* File Viewer Dialog */}
      {viewingFile && (
        <FileViewerDialog
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          fileId={viewingFile.fileId}
          fileName={viewingFile.fileName}
          fileType={viewingFile.fileType}
          fetchFile={quizService.downloadSubmissionFile.bind(quizService)}
          onDownload={() => {
            if (viewingFile) {
              handleDownloadSubmission(viewingFile.fileId, viewingFile.fileName)
            }
          }}
        />
      )}
    </div>
  )
}
