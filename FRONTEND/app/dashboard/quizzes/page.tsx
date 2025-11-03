"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, Search, Plus, Clock, MoreVertical, FileText, Download, Edit, Trash, ExternalLink } from "lucide-react"
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
    downloadQuizFile,
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
                  const createdDate = quiz.createdAt ? format(new Date(quiz.createdAt), 'MMM dd, yyyy') : 'N/A'
                  const dueDate = quiz.dueDate ? format(new Date(quiz.dueDate), 'MMM dd, yyyy hh:mm a') : null
                  const hasSubmitted = !!quiz.submission?.submittedAt

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
                              {hasSubmitted && (
                                <Badge className="bg-green-500/10 text-green-600">
                                  Submitted
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

                      <div className="grid md:grid-cols-4 gap-4 py-4 border-y border-border">
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
                          <p className="text-xs text-text-secondary mb-1">Document</p>
                          <p className="font-semibold text-sm">
                            {hasDocument ? (
                              <span className="flex items-center gap-1 text-primary">
                                <FileText className="w-4 h-4" />
                                Attached
                              </span>
                            ) : (
                              'No document'
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm pt-4">
                        {quiz.quizLink && (
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
                            Download
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
                          <Button 
                            className="ml-auto" 
                            size="sm"
                            onClick={() => handleOpenSubmitDialog(quiz)}
                            disabled={hasSubmitted}
                          >
                            {hasSubmitted ? "Already Submitted" : "Submit Quiz"}
                          </Button>
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
