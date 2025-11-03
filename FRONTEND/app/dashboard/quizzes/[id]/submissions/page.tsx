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
  ClipboardList, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Calendar,
  ImageIcon
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useQuizzes } from "@/hooks/use-quizzes"
import { formatDate } from "@/utils/date.utils"
import type { QuizSubmission } from "@/types/quiz.types"
import Image from "next/image"

export default function QuizSubmissionsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string

  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null)
  const [gradeValue, setGradeValue] = useState<number>(0)
  const [feedback, setFeedback] = useState<string>("")

  // Use the quiz hook to get submissions
  const {
    loading,
    initialLoading,
    getQuizSubmissions,
    gradeQuizSubmission,
  } = useQuizzes({ autoFetch: false })

  const [quiz, setQuiz] = useState<any>(null)
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([])

  // Fetch quiz and submissions
  useEffect(() => {
    if (isAuthenticated && user?.role === "teacher") {
      fetchData()
    }
  }, [isAuthenticated, user, quizId])

  const fetchData = async () => {
    try {
      const data = await getQuizSubmissions(quizId)
      if (data) {
        setQuiz(data.quiz)
        // Handle the response structure - submissions is inside data property
        setSubmissions(Array.isArray(data.submissions) ? data.submissions : data.submissions?.data || [])
      }
    } catch (error) {
      console.error("Error fetching submissions:", error)
    }
  }

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

  // Event handlers
  const handleStartGrading = (submission: QuizSubmission) => {
    setGradingSubmissionId(submission._id)
    setGradeValue(submission.grade || 0)
    setFeedback(submission.feedback || "")
  }

  const handleCancelGrading = () => {
    setGradingSubmissionId(null)
    setGradeValue(0)
    setFeedback("")
  }

  const handleSubmitGrade = async (submissionId: string) => {
    const result = await gradeQuizSubmission(submissionId, {
      grade: gradeValue,
      feedback: feedback,
    })
    
    if (result) {
      setGradingSubmissionId(null)
      setGradeValue(0)
      setFeedback("")
      // Refresh submissions
      fetchData()
    }
  }

  const handleViewImage = (imageUrl: string) => {
    window.open(imageUrl, '_blank')
  }

  // UI helper function
  const getSubmissionStatusBadge = (submission: QuizSubmission) => {
    const isGraded = submission.grade !== null && submission.grade !== undefined
    if (isGraded) {
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

  // Loading state
  if (authLoading || initialLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <ClipboardList className="w-8 h-8 animate-pulse mx-auto mb-4 text-primary" />
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
                <Card className="p-12">
                  <div className="text-center">
                    <ClipboardList className="w-12 h-12 mx-auto mb-4 text-text-secondary" />
                    <p className="text-text-secondary">No submissions yet</p>
                  </div>
                </Card>
              ) : (
                submissions.map((submission) => {
                  const isGrading = gradingSubmissionId === submission._id
                  const student = submission.student
                  const submittedDate = submission.submittedAt
                    ? formatDate(submission.submittedAt)
                    : "N/A"

                  return (
                    <Card key={submission._id} className="p-6">
                      {/* Student Info Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">
                              {student.firstName} {student.lastName}
                            </h3>
                            <p className="text-sm text-text-secondary">{student.email}</p>
                          </div>
                        </div>
                        {getSubmissionStatusBadge(submission)}
                      </div>

                      {/* Submission Details */}
                      <div className="grid md:grid-cols-2 gap-4 py-4 border-y border-border mb-4">
                        <div>
                          <p className="text-xs text-text-secondary mb-1">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            Submitted At
                          </p>
                          <p className="font-medium">{submittedDate}</p>
                        </div>
                        {submission.grade !== null && submission.grade !== undefined && (
                          <div>
                            <p className="text-xs text-text-secondary mb-1">Grade</p>
                            <p className="font-semibold text-lg text-primary">
                              {submission.grade}/100
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Screenshot Preview */}
                      {submission.submittedDocument && (
                        <div className="mb-4">
                          <Label className="mb-2 block">Submitted Screenshot</Label>
                          <div 
                            className="relative w-full aspect-video bg-secondary rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition"
                            onClick={() => handleViewImage(`${process.env.NEXT_PUBLIC_API_URL}/uploads/${submission.submittedDocument}`)}
                          >
                            <Image
                              src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${submission.submittedDocument}`}
                              alt="Quiz submission"
                              fill
                              className="object-contain"
                            />
                          </div>
                          <p className="text-xs text-text-secondary mt-2">
                            Click to view full size
                          </p>
                        </div>
                      )}

                      {/* Grading Section */}
                      {isGrading ? (
                        <div className="space-y-4 pt-4 border-t">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`grade-${submission._id}`}>
                                Grade (0-100) *
                              </Label>
                              <Input
                                id={`grade-${submission._id}`}
                                type="number"
                                min="0"
                                max="100"
                                value={gradeValue}
                                onChange={(e) => setGradeValue(Number(e.target.value))}
                                placeholder="Enter grade"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor={`feedback-${submission._id}`}>
                              Feedback (Optional)
                            </Label>
                            <Textarea
                              id={`feedback-${submission._id}`}
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              placeholder="Provide feedback to the student..."
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleSubmitGrade(submission._id)}
                              disabled={loading}
                            >
                              {loading ? "Submitting..." : "Submit Grade"}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={handleCancelGrading}
                              disabled={loading}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-4 border-t">
                          {submission.grade !== null && submission.grade !== undefined && submission.feedback && (
                            <div className="mb-4">
                              <Label className="mb-2 block">Feedback</Label>
                              <p className="text-sm text-text-secondary bg-secondary p-3 rounded-md">
                                {submission.feedback}
                              </p>
                            </div>
                          )}
                          <Button
                            variant={submission.grade !== null && submission.grade !== undefined ? "outline" : "default"}
                            onClick={() => handleStartGrading(submission)}
                          >
                            {submission.grade !== null && submission.grade !== undefined ? "Update Grade" : "Grade Submission"}
                          </Button>
                        </div>
                      )}
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
