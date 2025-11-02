"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Download } from "lucide-react"
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

export default function GradesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router, authLoading])

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <CheckCircle className="w-8 h-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  // Student grade data
  const studentGradeData = [
    { course: "React", grade: 92, assignment: 88, quiz: 95, participation: 90 },
    { course: "Web Design", grade: 87, assignment: 85, quiz: 89, participation: 88 },
    { course: "JavaScript", grade: 90, assignment: 91, quiz: 88, participation: 92 },
    { course: "CSS", grade: 88, assignment: 86, quiz: 91, participation: 87 },
  ]

  // Progress over time
  const progressData = [
    { week: "Week 1", average: 78 },
    { week: "Week 2", average: 80 },
    { week: "Week 3", average: 82 },
    { week: "Week 4", average: 85 },
    { week: "Week 5", average: 87 },
    { week: "Week 6", average: 89 },
  ]

  // Grade distribution for teacher
  const gradeDistribution = [
    { name: "A (90-100)", value: 35, color: "#10b981" },
    { name: "B (80-89)", value: 45, color: "#f59e0b" },
    { name: "C (70-79)", value: 15, color: "#f97316" },
    { name: "F (Below 70)", value: 5, color: "#ef4444" },
  ]

  // Class performance
  const classPerformance = [
    { name: "Course 1", students: 45, average: 84, passed: 43, failed: 2 },
    { name: "Course 2", students: 38, average: 81, passed: 36, failed: 2 },
    { name: "Course 3", students: 52, average: 86, passed: 50, failed: 2 },
    { name: "Course 4", students: 32, average: 83, passed: 30, failed: 2 },
  ]

  // Student grades table
  const studentAssignmentGrades = [
    { id: 1, name: "React Hooks Implementation", grade: 95, status: "submitted", date: "Jan 20, 2025" },
    { id: 2, name: "CSS Grid Layout", grade: 88, status: "submitted", date: "Jan 18, 2025" },
    { id: 3, name: "JavaScript Quiz", grade: 92, status: "submitted", date: "Jan 15, 2025" },
    { id: 4, name: "Portfolio Project", grade: null, status: "pending", date: "Due Jan 25, 2025" },
  ]

  if (user?.role === "student") {
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
                <p className="text-text-secondary">View your performance across all courses</p>
              </div>

              {/* Overall Stats */}
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="p-6">
                  <p className="text-sm text-text-secondary mb-2">Overall Average</p>
                  <p className="text-3xl font-bold text-primary">89%</p>
                  <p className="text-xs text-accent mt-2">↑ 2% from last week</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-text-secondary mb-2">Highest Grade</p>
                  <p className="text-3xl font-bold text-accent">95%</p>
                  <p className="text-xs text-text-secondary mt-2">React Assignment</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-text-secondary mb-2">Completed</p>
                  <p className="text-3xl font-bold">18/20</p>
                  <p className="text-xs text-text-secondary mt-2">assignments</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-text-secondary mb-2">Status</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-accent" />
                    <span className="font-semibold">On Track</span>
                  </div>
                </Card>
              </div>

              {/* Grade Trend Chart */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Grade Progress</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[70, 100]} />
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

              {/* Course Grades */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Grades by Course</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={studentGradeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="course" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="grade" fill="#2563eb" />
                    <Bar dataKey="assignment" fill="#10b981" />
                    <Bar dataKey="quiz" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Assignment Grades Table */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Grades</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-text-secondary">Assignment</th>
                        <th className="text-left py-3 px-4 font-semibold text-text-secondary">Grade</th>
                        <th className="text-left py-3 px-4 font-semibold text-text-secondary">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-text-secondary">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentAssignmentGrades.map((item) => (
                        <tr key={item.id} className="border-b border-border hover:bg-bg-secondary transition">
                          <td className="py-3 px-4">{item.name}</td>
                          <td className="py-3 px-4">
                            {item.grade ? (
                              <span className="font-semibold text-primary">{item.grade}%</span>
                            ) : (
                              <span className="text-text-secondary">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={
                                item.status === "submitted" ? "bg-accent/10 text-accent" : "bg-warning/10 text-warning"
                              }
                            >
                              {item.status === "submitted" ? "Graded" : "Pending"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-text-secondary">{item.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </main>
        </div>
      </div>
    )
  }

  // Teacher view
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
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download className="w-5 h-5" />
                Export Report
              </Button>
            </div>

            {/* Class Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="p-6">
                <p className="text-sm text-text-secondary mb-2">Class Average</p>
                <p className="text-3xl font-bold text-primary">84%</p>
                <p className="text-xs text-accent mt-2">Across 4 courses</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-text-secondary mb-2">Pass Rate</p>
                <p className="text-3xl font-bold text-accent">96%</p>
                <p className="text-xs text-text-secondary mt-2">159/167 students</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-text-secondary mb-2">Avg. Submissions</p>
                <p className="text-3xl font-bold">42</p>
                <p className="text-xs text-text-secondary mt-2">per assignment</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-text-secondary mb-2">Grading Status</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-accent" />
                  <span className="font-semibold">All Current</span>
                </div>
              </Card>
            </div>

            {/* Grade Distribution */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Grade Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={gradeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Course Performance</h2>
                <div className="space-y-4">
                  {classPerformance.map((course, idx) => (
                    <div key={idx} className="pb-4 border-b border-border last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{course.name}</span>
                        <span className="text-sm text-text-secondary">{course.average}% avg</span>
                      </div>
                      <div className="flex gap-1 text-xs text-text-secondary mb-1">
                        <span>{course.passed} passed</span>
                        <span>•</span>
                        <span>{course.failed} failed</span>
                      </div>
                      <div className="w-full bg-bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(course.passed / course.students) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Class Performance Chart */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Class Performance by Course</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={classPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="average" fill="#2563eb" name="Average Grade" />
                  <Bar dataKey="passed" fill="#10b981" name="Passed" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
