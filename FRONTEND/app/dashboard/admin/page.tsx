"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Users, BookOpen, AlertCircle, TrendingUp, Activity, FileText, ClipboardList, ArrowRight, Loader2, UserCircle2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { DashboardSkeleton } from "@/components/skeletons"
import { getUserFullName } from "@/utils/user.utils"
import { useAdminStats } from "@/hooks/use-admin-stats"
import { formatRelativeTime } from "@/utils/date.utils"
import { adminService } from "@/services/admin-service"
import { useToast } from "@/hooks/use-toast"

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [exportingMap, setExportingMap] = useState<Record<string, boolean>>({})
  
  // Use custom hook for admin statistics
  const {
    recentUsers,
    recentUsersLoading,
    totalStudents,
    totalTeachers,
    filesUploaded,
    totalSubmissions,
    averageScore,
    statsLoading,
    systemStatsLoading,
    refreshAll,
  } = useAdminStats()

  // Handle CSV export
  const handleExport = async (
    exportFn: () => Promise<void>,
    label: string,
    key: string
  ) => {
    setExportingMap((prev) => ({ ...prev, [key]: true }))
    try {
      await exportFn()
      toast({
        title: "Export Successful",
        description: `${label} has been downloaded.`,
      })
    } catch (error: any) {
      console.error("Export error:", error)
      toast({
        title: "Export Failed",
        description: error.message || "There was an error downloading the file.",
        variant: "destructive",
      })
    } finally {
      setExportingMap((prev) => ({ ...prev, [key]: false }))
    }
  }

  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (authLoading) return
    
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/login")
    }
  }, [isAuthenticated, user, router, authLoading])

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      refreshAll()
    }
  }, [isAuthenticated, user, refreshAll])
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "student":
        return <Badge className="bg-primary/10 text-primary text-xs">Student</Badge>
      case "teacher":
        return <Badge className="bg-accent/10 text-accent text-xs">Teacher</Badge>
      case "administrator":
        return <Badge className="bg-foreground/10 text-foreground text-xs">Admin</Badge>
      default:
        return <Badge className="text-xs">Unknown</Badge>
    }
  }

  // Show loading state while checking auth or fetching data
  if (authLoading || recentUsersLoading || statsLoading || systemStatsLoading) {
    return (
      <div className="flex h-screen bg-bg-secondary">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-8">
            <DashboardSkeleton />
          </main>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== "admin") return null

  return (
    <div className="flex h-screen bg-bg-secondary">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-text-secondary">System overview and management</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Total Students</p>
                    <p className="text-2xl font-bold">{totalStudents}</p>
                  </div>
                  <Users className="w-10 h-10 text-primary/20" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Total Teachers</p>
                    <p className="text-2xl font-bold">{totalTeachers}</p>
                  </div>
                  <Users className="w-10 h-10 text-accent/20" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Total Users</p>
                    <p className="text-2xl font-bold">{totalStudents + totalTeachers}</p>
                  </div>
                  <Activity className="w-10 h-10 text-warning/20" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Active Users</p>
                    <p className="text-2xl font-bold">{totalStudents + totalTeachers}</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-primary/20" />
                </div>
              </Card>
            </div>

            {/* User Management */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Recent Users</h2>
                <Button
                  className="bg-primary hover:bg-primary-dark gap-2"
                  onClick={() => router.push("/dashboard/users")}
                >
                  <Users className="w-5 h-5" />
                  Manage Users
                </Button>
              </div>

              {recentUsersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : recentUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-text-secondary">
                  <Users className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-sm">No users found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentUsers.map((u) => (
                    <div key={u._id} className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg hover:bg-bg-tertiary transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserCircle2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{getUserFullName(u)}</p>
                            {getRoleBadge(u.role)}
                          </div>
                          <p className="text-sm text-text-secondary">
                            @{u.username} • {u.email}
                          </p>
                          <p className="text-xs text-text-tertiary mt-0.5">
                            Joined {formatRelativeTime(u.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* System Statistics */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Files Uploaded</p>
                    <p className="text-2xl font-bold">{filesUploaded.toLocaleString()}</p>
                  </div>
                  <FileText className="w-10 h-10 text-primary/20" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Submissions</p>
                    <p className="text-2xl font-bold">{totalSubmissions.toLocaleString()}</p>
                  </div>
                  <ClipboardList className="w-10 h-10 text-accent/20" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Avg Score</p>
                    <p className="text-2xl font-bold">{averageScore}%</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-warning/20" />
                </div>
              </Card>
            </div>

            {/* Data Export Section */}
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Data Exports</h2>
                <p className="text-sm text-text-secondary">
                  Download comprehensive reports and data in CSV format for analysis and record-keeping
                </p>
              </div>

              {/* User Data Exports */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  User Data
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleExport(
                        () => adminService.exportUsers(),
                        "Users",
                        "users"
                      )
                    }
                    disabled={exportingMap["users"]}
                  >
                    {exportingMap["users"] ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Export All Users
                  </Button>
                </div>
              </div>

              {/* Content Exports */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Content & Activities
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleExport(
                        () => adminService.exportAssignments(),
                        "Assignments",
                        "assignments"
                      )
                    }
                    disabled={exportingMap["assignments"]}
                  >
                    {exportingMap["assignments"] ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Export Assignments
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleExport(
                        () => adminService.exportQuizzes(),
                        "Quizzes",
                        "quizzes"
                      )
                    }
                    disabled={exportingMap["quizzes"]}
                  >
                    {exportingMap["quizzes"] ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Export Quizzes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleExport(
                        () => adminService.exportExams(),
                        "Exams",
                        "exams"
                      )
                    }
                    disabled={exportingMap["exams"]}
                  >
                    {exportingMap["exams"] ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Export Exams
                  </Button>
                </div>
              </div>

              {/* Submissions Exports */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Submissions & Grades
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleExport(
                        () => adminService.exportAssignmentSubmissions(),
                        "Assignment Submissions",
                        "assignment-submissions"
                      )
                    }
                    disabled={exportingMap["assignment-submissions"]}
                  >
                    {exportingMap["assignment-submissions"] ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Assignment Submissions
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleExport(
                        () => adminService.exportQuizSubmissions(),
                        "Quiz Submissions",
                        "quiz-submissions"
                      )
                    }
                    disabled={exportingMap["quiz-submissions"]}
                  >
                    {exportingMap["quiz-submissions"] ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Quiz Submissions
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleExport(
                        () => adminService.exportExamSubmissions(),
                        "Exam Submissions",
                        "exam-submissions"
                      )
                    }
                    disabled={exportingMap["exam-submissions"]}
                  >
                    {exportingMap["exam-submissions"] ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Exam Submissions
                  </Button>
                </div>
              </div>

              {/* Comprehensive Reports */}
              <div>
                <h3 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  📊 Comprehensive Reports
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() =>
                      handleExport(
                        () => adminService.exportStudentGrades(),
                        "Student Grades Report",
                        "student-grades"
                      )
                    }
                    disabled={exportingMap["student-grades"]}
                    className="bg-primary hover:bg-primary-dark"
                  >
                    {exportingMap["student-grades"] ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Student Grades Report
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleExport(
                        () => adminService.exportTeacherActivity(),
                        "Teacher Activity",
                        "teacher-activity"
                      )
                    }
                    disabled={exportingMap["teacher-activity"]}
                  >
                    {exportingMap["teacher-activity"] ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Teacher Activity
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleExport(
                        () => adminService.exportSystemStatistics(),
                        "System Statistics",
                        "system-statistics"
                      )
                    }
                    disabled={exportingMap["system-statistics"]}
                  >
                    {exportingMap["system-statistics"] ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    System Statistics
                  </Button>
                </div>
              </div>

              <div className="mt-4 p-3 bg-bg-secondary rounded-lg">
                <p className="text-xs text-text-secondary">
                  💡 <strong>Tip:</strong> Student Grades Report includes comprehensive performance data with quiz, assignment, and exam averages calculated using the official grading formula.
                </p>
              </div>
            </Card>

            {/* KPI-Specific Exports */}
            <Card className="p-6 border-2 border-primary/20">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  📊 KPI Analytics Exports
                </h2>
                <p className="text-sm text-text-secondary">
                  Pre-calculated data ready for direct charting and KPI analysis
                </p>
              </div>

              <div className="space-y-4">
                {/* KPI #1: Quiz Performance by Topic */}
                <div className="p-4 bg-bg-secondary rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        KPI #1: Average Quiz Score Per Topic
                      </h3>
                      <p className="text-xs text-text-secondary mb-2">
                        Bar Chart • Identifies which topics students understand best or struggle with
                      </p>
                      <div className="flex flex-wrap gap-1 text-xs text-text-tertiary">
                        <Badge variant="outline" className="text-xs">Quiz/Topic</Badge>
                        <Badge variant="outline" className="text-xs">Average Score</Badge>
                        <Badge variant="outline" className="text-xs">Submission Count</Badge>
                        <Badge variant="outline" className="text-xs">Teacher</Badge>
                      </div>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        handleExport(
                          () => adminService.exportKPI_QuizPerformanceByTopic(),
                          "KPI #1: Quiz Performance by Topic",
                          "kpi-quiz-performance"
                        )
                      }
                      disabled={exportingMap["kpi-quiz-performance"]}
                      className="bg-primary hover:bg-primary-dark shrink-0"
                    >
                      {exportingMap["kpi-quiz-performance"] ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Export KPI #1
                    </Button>
                  </div>
                </div>

                {/* KPI #2: Submission Timeliness */}
                <div className="p-4 bg-bg-secondary rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-accent" />
                        KPI #2: Assignment Submission Timeliness
                      </h3>
                      <p className="text-xs text-text-secondary mb-2">
                        Doughnut Chart • Monitors student discipline and deadline adherence
                      </p>
                      <div className="flex flex-wrap gap-1 text-xs text-text-tertiary">
                        <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600">On Time</Badge>
                        <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600">Late</Badge>
                        <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600">Not Submitted</Badge>
                        <Badge variant="outline" className="text-xs">Percentages</Badge>
                      </div>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        handleExport(
                          () => adminService.exportKPI_SubmissionTimeliness(),
                          "KPI #2: Submission Timeliness",
                          "kpi-submission-timeliness"
                        )
                      }
                      disabled={exportingMap["kpi-submission-timeliness"]}
                      className="bg-primary hover:bg-primary-dark shrink-0"
                    >
                      {exportingMap["kpi-submission-timeliness"] ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Export KPI #2
                    </Button>
                  </div>
                </div>

                {/* KPI #3: Weekly Content Activity */}
                <div className="p-4 bg-bg-secondary rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-warning" />
                        KPI #3: Weekly Content Upload Activity
                      </h3>
                      <p className="text-xs text-text-secondary mb-2">
                        Column Chart • Tracks teaching consistency and content delivery pace
                      </p>
                      <div className="flex flex-wrap gap-1 text-xs text-text-tertiary">
                        <Badge variant="outline" className="text-xs">Week</Badge>
                        <Badge variant="outline" className="text-xs">Assignments</Badge>
                        <Badge variant="outline" className="text-xs">Quizzes</Badge>
                        <Badge variant="outline" className="text-xs">Exams</Badge>
                        <Badge variant="outline" className="text-xs">Total</Badge>
                      </div>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        handleExport(
                          () => adminService.exportKPI_WeeklyContentActivity(12),
                          "KPI #3: Weekly Content Activity",
                          "kpi-weekly-content"
                        )
                      }
                      disabled={exportingMap["kpi-weekly-content"]}
                      className="bg-primary hover:bg-primary-dark shrink-0"
                    >
                      {exportingMap["kpi-weekly-content"] ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Export KPI #3
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-xs text-text-secondary">
                  ⭐ <strong>Ready for Charts:</strong> These KPI exports provide pre-calculated data in a single CSV file, ready to import directly into Excel, Google Sheets, or any charting tool. No manual calculations needed!
                </p>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
