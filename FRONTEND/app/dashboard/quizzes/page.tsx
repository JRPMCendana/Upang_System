"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, Search, Plus, Clock, MoreVertical, FileText, Download, Edit, Trash, ExternalLink, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useQuizzes } from "@/hooks/use-quizzes"
import { CreateQuizDialog } from "@/components/dialogs/create-quiz-dialog"
import { EditQuizDialog } from "@/components/dialogs/edit-quiz-dialog"
import { SubmitQuizDialog } from "@/components/dialogs/submit-quiz-dialog"
import type { Quiz } from "@/types/quiz.types"
import { format } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function QuizzesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  
  // Use the quiz hook with auto-fetch enabled
  const { 
    quizzes, 
    loading, 
    initialLoading,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    submitQuiz,
    unsubmitQuiz,
    downloadQuizFile,
    downloadSubmissionFile,
    fetchQuizzes,
  } = useQuizzes({ autoFetch: true })

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router, authLoading])

  if (authLoading || initialLoading) {
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

  // Event handlers
  const handleCreateQuiz = async (data: any, file?: File) => {
    const result = await createQuiz(data, file)
    if (result) {
      setCreateDialogOpen(false)
    }
  }

  const handleUpdateQuiz = async (id: string, data: Partial<Quiz>, file?: File) => {
    const result = await updateQuiz(id, data, file)
    if (result) {
      setEditDialogOpen(false)
      setSelectedQuiz(null)
    }
  }

  const handleDeleteQuiz = async (id: string) => {
    if (confirm("Are you sure you want to delete this quiz?")) {
      const result = await deleteQuiz(id)
      if (result) {
        fetchQuizzes()
      }
    }
  }

  const handleSubmitQuiz = async (quizId: string, file: File) => {
    const result = await submitQuiz(quizId, file)
    if (result) {
      setSubmitDialogOpen(false)
      setSelectedQuiz(null)
      fetchQuizzes()
    }
  }

  const handleUnsubmitQuiz = async (quizId: string) => {
    const result = await unsubmitQuiz(quizId)
    if (result) {
      fetchQuizzes()
    }
  }

  const handleOpenEditDialog = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setEditDialogOpen(true)
  }

  const handleOpenSubmitDialog = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setSubmitDialogOpen(true)
  }

  const handleViewSubmissions = (quizId: string) => {
    router.push(`/dashboard/quizzes/${quizId}/submissions`)
  }

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (quiz.description && quiz.description.toLowerCase().includes(searchQuery.toLowerCase())),
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
                <Button 
                  className="bg-primary hover:bg-primary-dark gap-2"
                  onClick={() => setCreateDialogOpen(true)}
                >
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
              {loading && quizzes.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="w-12 h-12 animate-pulse mx-auto mb-4 text-text-secondary" />
                  <p className="text-text-secondary">Loading quizzes...</p>
                </div>
              ) : filteredQuizzes.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="w-12 h-12 mx-auto mb-4 text-text-secondary" />
                  <p className="text-text-secondary">No quizzes found</p>
                </div>
              ) : (
                filteredQuizzes.map((quiz) => {
                  const statusBadge = quiz.status === 'active' 
                    ? { bg: 'bg-success/10', text: 'text-success', label: 'Active' }
                    : { bg: 'bg-text-secondary/10', text: 'text-text-secondary', label: 'Inactive' }
                  
                  const hasDocument = quiz.document && quiz.documentName
                  const hasSubmittedDocument = quiz.submission?.submittedDocument && quiz.submission?.submittedDocumentName
                  const createdDate = quiz.createdAt ? format(new Date(quiz.createdAt), 'MMM dd, yyyy') : 'N/A'
                  const dueDate = quiz.dueDate ? format(new Date(quiz.dueDate), 'MMM dd, yyyy hh:mm a') : null
                  const isSubmitted = quiz.submission?.isSubmitted || false
                  const isGraded = quiz.submission?.grade !== null && quiz.submission?.grade !== undefined

                  return (
                    <Card key={quiz._id} className="p-6 hover:shadow-lg transition">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center shrink-0 mt-1">
                            <ClipboardList className="w-6 h-6 text-warning" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="text-lg font-semibold">{quiz.title}</h3>
                              <Badge className={`${statusBadge.bg} ${statusBadge.text}`}>
                                {statusBadge.label}
                              </Badge>
                              {isSubmitted && (
                                <Badge className="bg-green-500/10 text-green-600">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Submitted
                                </Badge>
                              )}
                              {isGraded && (
                                <Badge className="bg-blue-500/10 text-blue-600">
                                  Graded
                                </Badge>
                              )}
                            </div>
                            {quiz.description && (
                              <p className="text-sm text-text-secondary mb-2 line-clamp-2">{quiz.description}</p>
                            )}
                          </div>
                        </div>
                        {user?.role === "teacher" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-text-secondary shrink-0">
                                <MoreVertical className="w-5 h-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenEditDialog(quiz)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Quiz
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteQuiz(quiz._id)}
                                className="text-destructive"
                              >
                                <Trash className="w-4 h-4 mr-2" />
                                Delete Quiz
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>

                      <div className="grid md:grid-cols-5 gap-4 py-4 border-y border-border">
                        <div>
                          <p className="text-xs text-text-secondary mb-1">Created By</p>
                          <p className="font-semibold text-sm">
                            {quiz.assignedBy?.firstName} {quiz.assignedBy?.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-text-secondary mb-1">Created Date</p>
                          <p className="font-semibold text-sm">{createdDate}</p>
                        </div>
                        <div>
                          <p className="text-xs text-text-secondary mb-1">Due Date</p>
                          <p className="font-semibold text-sm">
                            {dueDate || 'No deadline'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-text-secondary mb-1">Total Points</p>
                          <p className="font-semibold text-sm">
                            {quiz.totalPoints || 100}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-text-secondary mb-1">
                            {user?.role === 'student' ? 'Your Submission' : 'Document'}
                          </p>
                          <p className="font-semibold text-sm">
                            {user?.role === 'student' ? (
                              hasSubmittedDocument ? (
                                <span className="flex items-center gap-1 text-green-600">
                                  <FileText className="w-4 h-4" />
                                  Screenshot submitted
                                </span>
                              ) : (
                                'Not submitted'
                              )
                            ) : (
                              hasDocument ? (
                                <span className="flex items-center gap-1 text-primary">
                                  <FileText className="w-4 h-4" />
                                  Attached
                                </span>
                              ) : (
                                'No document'
                              )
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm pt-4">
                        {/* Only students can take quizzes */}
                        {user?.role === "student" && quiz.quizLink && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(quiz.quizLink, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Take Quiz
                          </Button>
                        )}
                        {hasDocument && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadQuizFile(quiz.document!, quiz.documentName!)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Instructions
                          </Button>
                        )}
                        {/* Student: View their submitted screenshot */}
                        {user?.role === "student" && hasSubmittedDocument && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                const fileId = quiz.submission?.submittedDocument
                                const fileType = quiz.submission?.submittedDocumentType || 'image/png'
                                if (fileId) {
                                  // Import quizService to get the blob
                                  const { quizService } = await import('@/services/quiz-service')
                                  const blob = await quizService.downloadSubmissionFile(fileId)
                                  // Create blob with correct MIME type
                                  const typedBlob = new Blob([blob], { type: fileType })
                                  const url = window.URL.createObjectURL(typedBlob)
                                  window.open(url, '_blank')
                                  // Clean up after a delay
                                  setTimeout(() => window.URL.revokeObjectURL(url), 1000)
                                }
                              } catch (error) {
                                console.error('Error viewing screenshot:', error)
                              }
                            }}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View Screenshot
                          </Button>
                        )}
                        {user?.role === "teacher" ? (
                          <Button 
                            className="ml-auto" 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewSubmissions(quiz._id)}
                          >
                            View Submissions
                            {quiz.submissionStats && (
                              <Badge className="ml-2" variant="secondary">
                                {quiz.submissionStats.submitted}/{quiz.submissionStats.total}
                              </Badge>
                            )}
                          </Button>
                        ) : (
                          <>
                            {/* Show grade if graded */}
                            {isGraded && quiz.submission?.grade !== undefined && (
                              <div className="ml-auto flex items-center gap-2 text-sm">
                                <span className="text-text-secondary">Grade:</span>
                                <span className="font-semibold text-accent">
                                  {quiz.submission.grade}/{quiz.totalPoints || 100}
                                </span>
                              </div>
                            )}
                            
                            {/* Show submit/unsubmit button only if not graded */}
                            {!isGraded && (
                              <Button 
                                className={!isGraded ? "ml-auto" : ""}
                                variant={isSubmitted ? "outline" : "default"}
                                size="sm"
                                onClick={() => {
                                  if (isSubmitted) {
                                    handleUnsubmitQuiz(quiz._id)
                                  } else {
                                    handleOpenSubmitDialog(quiz)
                                  }
                                }}
                              >
                                {isSubmitted ? "Unsubmit" : "Submit Quiz"}
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Dialogs */}
      <CreateQuizDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateQuiz}
        loading={loading}
      />

      <EditQuizDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        quiz={selectedQuiz}
        onSubmit={handleUpdateQuiz}
        loading={loading}
      />

      <SubmitQuizDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        quizId={selectedQuiz?._id || ""}
        quizTitle={selectedQuiz?.title || ""}
        onSubmit={handleSubmitQuiz}
        loading={loading}
      />
    </div>
  )
}
