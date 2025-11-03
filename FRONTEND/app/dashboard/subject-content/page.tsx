"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FileText, Search, Loader2, Calendar, Users } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useTeacherActivities } from "@/hooks/use-teacher-activities"
import { useTeachers } from "@/hooks/use-teachers"
import { formatRelativeTime } from "@/utils/date.utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SubjectContentPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [teacherFilter, setTeacherFilter] = useState("all")

  const {
    combinedActivities,
    loading,
    assignmentsTotal,
    quizzesTotal,
    examsTotal,
    fetchAll,
  } = useTeacherActivities()

  const { teachers, loading: loadingTeachers } = useTeachers(true)

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

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      const selectedTeacherId = teacherFilter === "all" ? undefined : teacherFilter
      fetchAll(selectedTeacherId)
    }
  }, [isAuthenticated, user, teacherFilter, fetchAll])

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || (user && user.role !== "admin")) return null

  // Filter activities by type and search
  const filteredActivities = combinedActivities.filter((activity) => {
    const matchesType = typeFilter === "all" || activity.type === typeFilter
    const matchesSearch =
      !searchQuery ||
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${activity.assignedBy.firstName} ${activity.assignedBy.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const getActivityIcon = (type: string) => {
    if (type === "quiz") return "🧠"
    if (type === "exam") return "�"
    return "�📄"
  }

  const getActivityColor = (type: string) => {
    if (type === "quiz") return "bg-purple-500/10 text-purple-500"
    if (type === "exam") return "bg-red-500/10 text-red-500"
    return "bg-blue-500/10 text-blue-500"
  }

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
                <h1 className="text-3xl font-bold mb-2">Teacher's Activities</h1>
                <p className="text-text-secondary">
                  Monitor all assignments, quizzes, and exams created by teachers • {filteredActivities.length} total
                </p>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4">
                <p className="text-sm text-text-secondary mb-1">Total Activities</p>
                <p className="text-2xl font-bold">{assignmentsTotal + quizzesTotal + examsTotal}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-text-secondary mb-1">Assignments</p>
                <p className="text-2xl font-bold">{assignmentsTotal}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-text-secondary mb-1">Quizzes</p>
                <p className="text-2xl font-bold">{quizzesTotal}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-text-secondary mb-1">Exams</p>
                <p className="text-2xl font-bold">{examsTotal}</p>
              </Card>
            </div>

            {/* Filters */}
            <Card className="p-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
                  <Input
                    placeholder="Search by title, description, or teacher..."
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
                    <SelectItem value="assignment">Assignments Only</SelectItem>
                    <SelectItem value="quiz">Quizzes Only</SelectItem>
                    <SelectItem value="exam">Exams Only</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={teacherFilter} onValueChange={setTeacherFilter} disabled={loadingTeachers}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teachers</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher._id} value={teacher._id}>
                        {teacher.firstName} {teacher.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Activities list */}
            <div className="space-y-4">
              {loading && (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-text-secondary">Loading activities...</p>
                </div>
              )}

              {!loading && filteredActivities.length === 0 && (
                <Card className="p-12 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-text-secondary" />
                  <h3 className="text-lg font-semibold mb-2">No activities found</h3>
                  <p className="text-text-secondary">
                    {searchQuery || typeFilter !== "all" || teacherFilter !== "all"
                      ? "Try adjusting your filters"
                      : "No assignments, quizzes, or exams have been created yet"}
                  </p>
                </Card>
              )}

              {!loading &&
                filteredActivities.map((activity) => (
                  <Card key={activity._id} className="p-6 hover:shadow-lg transition">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 text-2xl">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold">{activity.title}</h3>
                            <Badge className={getActivityColor(activity.type)}>
                              {activity.type === "quiz" ? "Quiz" : activity.type === "exam" ? "Exam" : "Assignment"}
                            </Badge>
                          </div>
                          {activity.description && (
                            <p className="text-sm text-text-secondary mb-2 line-clamp-2">
                              {activity.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                            <span className="font-medium">
                              👨‍🏫 {activity.assignedBy.firstName} {activity.assignedBy.lastName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Created {formatRelativeTime(activity.createdAt)}
                            </span>
                            {activity.dueDate && (
                              <span className="flex items-center gap-1">
                                📅 Due: {new Date(activity.dueDate).toLocaleDateString()}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {activity.assignedTo?.length || 0} students
                            </span>
                            {activity.type === "quiz" && activity.totalPoints && (
                              <Badge variant="outline">{activity.totalPoints} points</Badge>
                            )}
                            {activity.type === "assignment" && activity.maxGrade && (
                              <Badge variant="outline">{activity.maxGrade} points</Badge>
                            )}
                            {activity.type === "exam" && activity.totalPoints && (
                              <Badge variant="outline">{activity.totalPoints} points</Badge>
                            )}
                            {activity.documentName && (
                              <span className="text-xs">📎 {activity.documentName}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
