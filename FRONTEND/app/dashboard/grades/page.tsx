"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Download, Loader2 } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useGradeStats } from "@/hooks/use-grade-stats"
import { format } from "date-fns"

export default function GradesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { teacherStats, studentStats, loading, initialLoading, refreshStats } = useGradeStats({ autoFetch: true })

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
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-text-secondary">Loading grades...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  // Format date helper
  const formatDate = (date: string | Date | null) => {
    if (!date) return "—"
    try {
      return format(new Date(date), "MMM d, yyyy")
    } catch {
      return "—"
    }
  }

  if (user?.role === "student") {
    const stats = studentStats
    if (!stats) {
      return (
        <div className="flex h-screen bg-bg-secondary">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-auto p-8 flex items-center justify-center">
              <div className="text-center">
                <p className="text-text-secondary">No grade data available</p>
              </div>
            </main>
          </div>
        </div>
      )
    }

    // Format grade trend data for chart
    const gradeTrendData = stats.gradeTrend.length > 0 
      ? stats.gradeTrend.map(item => ({
          month: format(new Date(item.month + '-01'), "MMM"),
          average: item.average
        }))
      : []

    // Combine recent grades and pending tasks
    const allTasks = [...stats.recentGrades, ...stats.pendingTasks.slice(0, 5)]

    return (
      <div className="flex h-screen bg-bg-secondary">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />

          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold mb-2">My Grades</h1>
                <p className="text-text-secondary">View your performance across all assignments and quizzes</p>
              </div>

              {/* Overall Stats */}
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="p-6">
                  <p className="text-sm text-text-secondary mb-2">Overall Average</p>
                  <p className="text-3xl font-bold text-primary">{stats.overallAverage}%</p>
                  <p className="text-xs text-accent mt-2">
                    {stats.completed > 0 ? `${stats.completed} graded items` : "No grades yet"}
                  </p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-text-secondary mb-2">Highest Grade</p>
                  <p className="text-3xl font-bold text-accent">{stats.highestGrade}%</p>
                  <p className="text-xs text-text-secondary mt-2">
                    {stats.highestGradeItem || "N/A"}
                  </p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-text-secondary mb-2">Completed</p>
                  <p className="text-3xl font-bold">{stats.completed}/{stats.total}</p>
                  <p className="text-xs text-text-secondary mt-2">assignments & quizzes</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-text-secondary mb-2">Status</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`w-6 h-6 ${stats.completed === stats.total ? 'text-accent' : 'text-warning'}`} />
                    <span className="font-semibold">
                      {stats.completed === stats.total ? "All Complete" : "In Progress"}
                    </span>
                  </div>
                </Card>
              </div>

              {/* Grade Trend Chart */}
              {gradeTrendData.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Grade Progress</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={gradeTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="average"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={{ fill: "#2563eb" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Assignment Grades Table */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Grades & Pending Tasks</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-text-secondary">Task</th>
                        <th className="text-left py-3 px-4 font-semibold text-text-secondary">Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-text-secondary">Grade</th>
                        <th className="text-left py-3 px-4 font-semibold text-text-secondary">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-text-secondary">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allTasks.length > 0 ? (
                        allTasks.map((item) => (
                          <tr key={item.id} className="border-b border-border hover:bg-bg-secondary transition">
                            <td className="py-3 px-4">{item.name}</td>
                            <td className="py-3 px-4">
                              <Badge className="bg-primary/10 text-primary">
                                {item.type === 'assignment' ? 'Assignment' : 'Quiz'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              {item.grade !== null ? (
                                <span className="font-semibold text-primary">{item.grade}%</span>
                              ) : (
                                <span className="text-text-secondary">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                className={
                                  item.status === "submitted" || item.status === "graded"
                                    ? "bg-accent/10 text-accent"
                                    : "bg-warning/10 text-warning"
                                }
                              >
                                {item.status === "submitted" || item.status === "graded" ? "Graded" : "Pending"}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-text-secondary">{formatDate(item.date)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-text-secondary">
                            No grades or tasks available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </main>
        </div>
      </div>
    )
  }  // Teacher view
  const stats = teacherStats
  if (!stats) {
    return (
      <div className="flex h-screen bg-bg-secondary">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-8 flex items-center justify-center">
            <div className="text-center">
              <p className="text-text-secondary">No grade data available</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  // Truncate long task names for chart display
  const performanceData = stats.performanceByTask.map(item => ({
    ...item,
    displayName: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name
  }))

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
                <h1 className="text-3xl font-bold mb-2">Grade Management</h1>
                <p className="text-text-secondary">View class performance and student progress</p>
              </div>
              <Button variant="outline" className="gap-2 bg-transparent" onClick={refreshStats} disabled={loading}>
                <Download className="w-5 h-5" />
                {loading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>

            {/* Class Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="p-6">
                <p className="text-sm text-text-secondary mb-2">Class Average</p>
                <p className="text-3xl font-bold text-primary">{stats.classAverage}%</p>
                <p className="text-xs text-text-secondary mt-2">{stats.totalGraded} graded items</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-text-secondary mb-2">Pass Rate</p>
                <p className="text-3xl font-bold text-accent">{stats.passRate}%</p>
                <p className="text-xs text-text-secondary mt-2">{stats.passingStudents}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-text-secondary mb-2">Avg. Submissions</p>
                <p className="text-3xl font-bold">{stats.avgSubmissions}</p>
                <p className="text-xs text-text-secondary mt-2">per assignment</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-text-secondary mb-2">Grading Status</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-6 h-6 ${stats.pendingGrading === 0 ? 'text-accent' : 'text-warning'}`} />
                  <span className="font-semibold">{stats.gradingStatus}</span>
                </div>
                {stats.pendingGrading > 0 && (
                  <p className="text-xs text-warning mt-2">{stats.pendingGrading} need grading</p>
                )}
              </Card>
            </div>

            {/* Grade Distribution & Performance */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Grade Distribution Pie Chart */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Grade Distribution</h2>
                {stats.gradeDistribution.length > 0 && stats.gradeDistribution.some(g => g.value > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.gradeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => entry.value > 0 ? `${entry.name}: ${entry.value}%` : ''}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.gradeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: unknown) => `${value as number}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-text-secondary">
                    No grade data available yet
                  </div>
                )}
              </Card>

              {/* Performance by Assignment/Quiz */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Performance by Task</h2>
                {performanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="displayName" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="average" fill="#2563eb" name="Average Grade" />
                      <Bar dataKey="passed" fill="#10b981" name="Passed" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-text-secondary">
                    No performance data available yet
                  </div>
                )}
              </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6">
                <p className="text-sm text-text-secondary mb-2">Total Students</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-text-secondary mb-2">Total Assignments</p>
                <p className="text-2xl font-bold">{stats.totalAssignments}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-text-secondary mb-2">Total Quizzes</p>
                <p className="text-2xl font-bold">{stats.totalQuizzes}</p>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}