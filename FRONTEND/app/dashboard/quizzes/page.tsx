"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, Search, Plus, Clock, MoreVertical, FileText, Download } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useQuizzes } from "@/hooks/use-quizzes"
import { format } from "date-fns"

export default function QuizzesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  
  // Use the quiz hook with auto-fetch enabled
  const { 
    quizzes, 
    loading, 
    initialLoading,
    downloadQuizFile,
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
                <Button className="bg-primary hover:bg-primary-dark gap-2">
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
                            </div>
                            {quiz.description && (
                              <p className="text-sm text-text-secondary mb-2 line-clamp-2">{quiz.description}</p>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-text-secondary shrink-0">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 py-4 border-y border-border">
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
                        {hasDocument && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadQuizFile(quiz.document!, quiz.documentName!)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Quiz
                          </Button>
                        )}
                        <Button 
                          className="ml-auto" 
                          variant={user?.role === "teacher" ? "outline" : "default"} 
                          size="sm"
                          onClick={() => {
                            if (user?.role === "teacher") {
                              router.push(`/dashboard/quizzes/${quiz._id}/submissions`)
                            } else {
                              // Student submit quiz action would go here
                            }
                          }}
                        >
                          {user?.role === "teacher" ? "View Submissions" : "Submit Quiz"}
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
