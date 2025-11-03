"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FileText, Search, Plus, Calendar, AlertCircle, CheckCircle, Clock, MoreVertical, Download, Edit } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getStatusColor } from "@/utils/ui.utils"
import { useAssignments } from "@/hooks/use-assignments"
import { CreateAssignmentDialog } from "@/components/dialogs/create-assignment-dialog"
import { EditAssignmentDialog } from "@/components/dialogs/edit-assignment-dialog"
import { SubmitAssignmentDialog } from "@/components/dialogs/submit-assignment-dialog"
import type { Assignment } from "@/types/assignment.types"
import { formatDateTime } from "@/utils/date.utils"

export default function AssignmentsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)

  const {
    assignments,
    loading,
    initialLoading,
    fetchAssignments,
    createAssignment,
    updateAssignment,
    submitAssignment,
    unsubmitAssignment,
    downloadAssignmentFile,
  } = useAssignments({ autoFetch: true })

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
          <FileText className="w-8 h-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-text-secondary">Loading assignments...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  const handleCreateAssignment = async (data: any, file?: File) => {
    const result = await createAssignment(data, file)
    if (result) {
      setCreateDialogOpen(false)
    }
  }

  const handleSubmitAssignment = async (file: File) => {
    if (!selectedAssignment) return
    
    const result = await submitAssignment(selectedAssignment._id, file)
    if (result) {
      setSubmitDialogOpen(false)
      setSelectedAssignment(null)
      // Refresh assignments to get updated status
      fetchAssignments()
    }
  }

  const handleUnsubmitAssignment = async (assignmentId: string) => {
    const result = await unsubmitAssignment(assignmentId)
    if (result) {
      // Refresh assignments to get updated status
      fetchAssignments()
    }
  }

  const handleDownloadFile = async (fileId: string, fileName: string) => {
    await downloadAssignmentFile(fileId, fileName)
  }

  const handleOpenSubmitDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setSubmitDialogOpen(true)
  }

  const handleOpenEditDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setEditDialogOpen(true)
  }

  const handleUpdateAssignment = async (id: string, data: Partial<Assignment>, file?: File) => {
    const result = await updateAssignment(id, data, file)
    if (result) {
      setEditDialogOpen(false)
      setSelectedAssignment(null)
      // Refresh assignments to get updated data
      fetchAssignments()
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "submitted":
        return <CheckCircle className="w-4 h-4" />
      case "graded":
        return <CheckCircle className="w-4 h-4" />
      case "late":
        return <AlertCircle className="w-4 h-4" />
      case "overdue":
        return <AlertCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (assignment.course?.title || "").toLowerCase().includes(searchQuery.toLowerCase())
    
    // For teachers, filter by assignment deadline status (active vs overdue)
    // For students, filter by their submission status (pending, submitted, graded, late)
    let matchesStatus = filterStatus === "all"
    
    if (!matchesStatus && user?.role === "teacher") {
      // Teacher filters: active (not past due) or overdue (past due)
      const now = new Date()
      const dueDate = new Date(assignment.dueDate)
      const isOverdue = now > dueDate
      
      if (filterStatus === "active") {
        matchesStatus = !isOverdue
      } else if (filterStatus === "overdue") {
        matchesStatus = isOverdue
      }
    } else if (!matchesStatus && user?.role === "student") {
      // Student filters: based on their submission status
      matchesStatus = assignment.status === filterStatus
    }
    
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
                <h1 className="text-3xl font-bold mb-2">
                  {user?.role === "teacher" ? "My Assignments" : "Assignments"}
                </h1>
                <p className="text-text-secondary">
                  {user?.role === "teacher" 
                    ? "Manage assignments and review student submissions" 
                    : "View and submit your assignments"}
                </p>
              </div>
              {user?.role === "teacher" && (
                <Button 
                  className="bg-primary hover:bg-primary-dark gap-2"
                  onClick={() => setCreateDialogOpen(true)}
                >
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
                <div className="flex gap-2 flex-wrap">
                  {/* Different filters for teachers vs students */}
                  {user?.role === "teacher" ? (
                    // Teachers: Filter by assignment deadline status
                    ["all", "active", "overdue"].map((status) => (
                      <Button
                        key={status}
                        variant={filterStatus === status ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterStatus(status)}
                        className="capitalize"
                      >
                        {status}
                      </Button>
                    ))
                  ) : (
                    // Students: Filter by submission status
                    ["all", "pending", "submitted", "graded", "late"].map((status) => (
                      <Button
                        key={status}
                        variant={filterStatus === status ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterStatus(status)}
                        className="capitalize"
                      >
                        {status}
                      </Button>
                    ))
                  )}
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
                  // Calculate status for display
                  // For students: backend provides status (pending, submitted, graded, late)
                  // For teachers: always calculate based on due date since backend doesn't provide per-teacher status
                  let displayStatus: string
                  
                  if (user?.role === "teacher") {
                    // Teacher view: calculate status based on due date
                    const now = new Date()
                    const dueDate = new Date(assignment.dueDate)
                    displayStatus = now > dueDate ? "late" : "pending"
                  } else {
                    // Student view: use backend-provided status
                    displayStatus = assignment.status || "pending"
                  }
                  
                  const statusColor = getStatusColor(displayStatus)
                  
                  return (
                    <Card key={assignment._id} className="p-6 hover:shadow-lg transition">
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
                                  {getStatusIcon(displayStatus)}
                                  {statusColor.label}
                                </span>
                              </Badge>
                            </div>
                            {assignment.course && (
                              <p className="text-sm text-text-secondary mb-2">{assignment.course.title}</p>
                            )}
                            <p className="text-sm text-text-secondary line-clamp-1">{assignment.description}</p>
                            
                            {/* Show instructions if available */}
                            {assignment.instructions && (
                              <p className="text-xs text-text-secondary mt-2 line-clamp-2">
                                Instructions: {assignment.instructions}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary pt-4 border-t border-border">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {formatDateTime(assignment.dueDate)}</span>
                        </div>
                        {assignment.totalPoints && (
                          <div className="flex items-center gap-2">
                            <span>{assignment.totalPoints} points</span>
                          </div>
                        )}
                        
                        {/* Show submission stats for teachers */}
                        {user?.role === "teacher" && assignment.submissionStats && (
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>{assignment.submissionStats.submitted}/{assignment.submissionStats.total} submitted</span>
                            </div>
                            {assignment.submissionStats.graded > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="text-accent">{assignment.submissionStats.graded} graded</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Download attachment button if file exists */}
                        {assignment.attachments && assignment.attachments.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleDownloadFile(assignment.attachments![0], `${assignment.title}.pdf`)}
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                        )}
                        
                        {user?.role === "teacher" ? (
                          <div className="ml-auto flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditDialog(assignment)}
                              className="gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/dashboard/assignments/${assignment._id}/submissions`)}
                            >
                              Review Submissions
                            </Button>
                          </div>
                        ) : (
                          <>
                            {/* Show grade if graded */}
                            {assignment.submission?.grade !== null && assignment.submission?.grade !== undefined && (
                              <div className="ml-auto flex items-center gap-2 text-sm">
                                <span className="text-text-secondary">Grade:</span>
                                <span className="font-semibold text-accent">
                                  {assignment.submission.grade}/100
                                </span>
                              </div>
                            )}
                            
                            {/* Show submit/unsubmit button only if not graded */}
                            {(assignment.submission?.grade === null || assignment.submission?.grade === undefined) && (
                              <Button
                                className={assignment.submission?.grade !== null && assignment.submission?.grade !== undefined ? "" : "ml-auto"}
                                variant={
                                  assignment.submission?.isSubmitted
                                    ? "outline"
                                    : "default"
                                }
                                size="sm"
                                disabled={assignment.status === "late"}
                                onClick={() => {
                                  if (assignment.submission?.isSubmitted) {
                                    handleUnsubmitAssignment(assignment._id)
                                  } else {
                                    handleOpenSubmitDialog(assignment)
                                  }
                                }}
                              >
                                {assignment.submission?.isSubmitted
                                  ? "Unsubmit"
                                  : assignment.status === "late"
                                  ? "Past Due"
                                  : "Submit"}
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

      {/* Create Assignment Dialog */}
      <CreateAssignmentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateAssignment}
      />

      {/* Edit Assignment Dialog */}
      <EditAssignmentDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleUpdateAssignment}
        assignment={selectedAssignment}
        loading={loading}
      />

      {/* Submit Assignment Dialog */}
      <SubmitAssignmentDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        onSubmit={handleSubmitAssignment}
        assignment={selectedAssignment}
      />
    </div>
  )
}
