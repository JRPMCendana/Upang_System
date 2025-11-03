"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { formatDate } from "@/utils/date.utils"
import { ClipboardList, Plus, Loader2, Upload, Search, FileImage, CheckCircle } from "lucide-react"
import { useExams } from "@/hooks/use-exams"
import { CreateExamDialog } from "@/components/dialogs/create-exam-dialog"
import { SubmitExamDialog } from "@/components/dialogs/submit-exam-dialog"
import { examService } from "@/services/exam-service"
import { Input } from "@/components/ui/input"
import { getUserFullName } from "@/utils/user.utils"
import { FileViewerDialog } from "@/components/dialogs/file-viewer-dialog"
import { Badge } from "@/components/ui/badge"

export default function ExamsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { exams, loading, initialLoading, createExam, fetchExams } = useExams({ autoFetch: true })
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [selectedExamId, setSelectedExamId] = useState<string>("")
  const [selectedExamTitle, setSelectedExamTitle] = useState<string>("")
  const [submissionByExamId, setSubmissionByExamId] = useState<Record<string, { fileId: string; fileName?: string; fileType?: string }>>({})
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerFileId, setViewerFileId] = useState<string>("")
  const [viewerFileName, setViewerFileName] = useState<string>("")
  const [viewerFileType, setViewerFileType] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    // For students, hydrate submission states
    if (user?.role === 'student' && exams.length > 0) {
      ;(async () => {
        const entries = await Promise.all(
          exams.map(async (e) => {
            try {
              const res: any = await examService.getMySubmission(e._id)
              const data = res?.data || null
              if (data && data.submittedDocument) {
                return [e._id, { fileId: data.submittedDocument, fileName: data.submittedDocumentName, fileType: data.submittedDocumentType }]
              }
            } catch {}
            return null
          })
        )
        const map: Record<string, { fileId: string; fileName?: string; fileType?: string }> = {}
        entries.forEach((item) => {
          if (item) map[item[0] as string] = item[1] as any
        })
        setSubmissionByExamId(map)
      })()
    }
  }, [isAuthenticated, router, authLoading, user?.role, exams])

  const isTeacher = user?.role === "teacher"
  const isStudent = user?.role === "student"

  const handleCreateExam = async (data: { title: string; description: string; dueDate: string; totalPoints: number; studentIds: string[] }, file?: File) => {
    const result = await createExam(data, file)
    if (result) {
      setCreateDialogOpen(false)
    }
  }

  return (
    <div className="flex h-screen bg-bg-secondary">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Exams</h1>
                <p className="text-text-secondary">Create and manage exams</p>
              </div>
              {isTeacher && (
                <Button variant="outline" className="gap-2" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4" />
                  New Exam
                </Button>
              )}
            </div>

            {/* Search */}
            <Card className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-text-secondary" />
                <Input
                  placeholder="Search exams..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </Card>

            <div>
              {initialLoading || loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-text-secondary">Loading...</span>
                </div>
              ) : exams.length === 0 ? (
                <p className="text-text-secondary">No exams yet.</p>
              ) : (
                <div>
                  {exams
                    .filter((e) => {
                      const q = searchQuery.toLowerCase().trim()
                      if (!q) return true
                      return (
                        e.title.toLowerCase().includes(q) ||
                        (e.description || "").toLowerCase().includes(q)
                      )
                    })
                    .map((exam) => (
                    <Card key={exam._id} className="p-6 mb-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                            <ClipboardList className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg font-semibold">{exam.title}</h3>
                              <span className="text-xs text-text-secondary">Active</span>
                              {submissionByExamId[exam._id] && (
                                <Badge className="bg-green-500/10 text-green-600 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> Submitted
                                </Badge>
                              )}
                            </div>
                            {exam.description && (
                              <p className="text-sm text-text-secondary mt-1">{exam.description}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Meta grid with separators like quizzes */}
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 py-4 border-y border-border mt-2">
                        <div>
                          <p className="text-xs text-text-secondary mb-1">Created By</p>
                          <p className="font-semibold text-sm">
                            {exam.assignedBy
                              ? getUserFullName({
                                  // util expects user-like
                                  firstName: exam.assignedBy.firstName || "",
                                  lastName: exam.assignedBy.lastName || "",
                                  username: exam.assignedBy.username || "",
                                } as any)
                              : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-text-secondary mb-1">Created Date</p>
                          <p className="font-semibold text-sm">{exam.createdAt ? formatDate(exam.createdAt) : "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-text-secondary mb-1">Due Date</p>
                          <p className="font-semibold text-sm">{exam.dueDate ? formatDate(exam.dueDate) : "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-text-secondary mb-1">Total Points</p>
                          <p className="font-semibold text-sm">{exam.totalPoints}</p>
                        </div>
                        <div>
                          <p className="text-xs text-text-secondary mb-1">Your Submission</p>
                          <p className="font-semibold text-sm">
                            {submissionByExamId[exam._id] ? (
                              <span className="text-green-600 flex items-center gap-1"><FileImage className="w-4 h-4"/> Screenshot submitted</span>
                            ) : (
                              'Not submitted'
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Bottom actions */}
                      <div className="mt-6 flex items-center justify-between">
                        {/* Left-side action (student submitted) */}
                        <div>
                          {isStudent && submissionByExamId[exam._id] && (
                            <Button variant="outline" size="sm" className="gap-1" onClick={() => { const f = submissionByExamId[exam._id]; setViewerFileId(f.fileId); setViewerFileName(f.fileName || "Submitted file"); setViewerFileType(f.fileType); setViewerOpen(true); }}>
                              <FileImage className="w-4 h-4" /> View Screenshot
                            </Button>
                          )}
                        </div>

                        {/* Right-side action */}
                        <div>
                          {isTeacher ? (
                            <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/exams/${exam._id}/submissions`)}>
                              View Submissions
                            </Button>
                          ) : submissionByExamId[exam._id] ? (
                            <Button variant="secondary" size="sm" onClick={async () => { await examService.unsubmitExam(exam._id); setSubmissionByExamId((prev) => { const n = { ...prev }; delete n[exam._id]; return n; }); }}>
                              Unsubmit
                            </Button>
                          ) : (
                            <StudentInlineSubmit examId={exam._id} onOpenDialog={(id) => { setSelectedExamId(id); setSelectedExamTitle(exam.title); setSubmitDialogOpen(true); }} />
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create Exam Dialog */}
      <CreateExamDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateExam}
        loading={loading}
      />

      {/* Submit Exam Dialog */}
      <SubmitExamDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        examId={selectedExamId}
        examTitle={selectedExamTitle}
        onSubmit={async (examId: string, file: File) => {
          const res: any = await examService.submitExam(examId, file)
          const data = res?.data || res
          const fileId = data?.submittedDocument || data?.submittedFile || data?.fileId
          const fileName = data?.submittedDocumentName || data?.fileName
          const fileType = data?.submittedDocumentType || data?.fileType
          if (fileId) setSubmissionByExamId((prev) => ({ ...prev, [examId]: { fileId, fileName, fileType } }))
          setSubmitDialogOpen(false)
        }}
        loading={loading}
      />

      <FileViewerDialog open={viewerOpen} onOpenChange={setViewerOpen} fileId={viewerFileId} fileName={viewerFileName} fileType={viewerFileType} fetchFile={examService.downloadSubmissionFile.bind(examService)} />
    </div>
  )
}


function StudentInlineSubmit({ examId, onOpenDialog }: { examId: string; onOpenDialog: (examId: string) => void }) {
  const [submitting, setSubmitting] = useState(false)

  const handleSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setSubmitting(true)
      await examService.submitExam(examId, file)
      alert("Submitted successfully")
    } catch (err: any) {
      alert(err?.message || "Failed to submit exam")
    } finally {
      setSubmitting(false)
      e.target.value = ""
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <Button size="sm" className="gap-1" disabled={submitting} onClick={() => onOpenDialog(examId)}>
        <Upload className="w-4 h-4" /> Submit Exam
      </Button>
    </div>
  )
}


