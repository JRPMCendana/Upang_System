"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  BookOpen, 
  FileText, 
  TrendingUp, 
  ClipboardList, 
  Clock,
  Users,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useDashboard } from "@/hooks/use-dashboard"
import { format, formatDistanceToNow } from "date-fns"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Fetch dashboard data based on role
  const { 
    studentStats, 
    teacherStats, 
    loading, 
    initialLoading 
  } = useDashboard({ 
    role: user?.role as "student" | "teacher", 
    autoFetch: true 
  })

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
          <BarChart3 className="w-8 h-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  // Render student dashboard
  if (user?.role === "student" && studentStats) {
    return (
      <div className="flex h-screen bg-bg-secondary">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />

          <main className="flex-1 overflow-auto p-8">
            <motion.div 
              className="max-w-7xl mx-auto space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Welcome Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {user?.name || "Student"}!
                </h1>
                <p className="text-text-secondary">Here's your learning overview.</p>
              </motion.div>

              {/* Stats Cards */}
              <motion.div 
                className="grid md:grid-cols-4 gap-6"
                variants={container}
                initial="hidden"
                animate="show"
              >
                <motion.div variants={item}>
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-secondary mb-1">Pending Tasks</p>
                        <p className="text-2xl font-bold">
                          {studentStats.pendingAssignments + studentStats.pendingQuizzes}
                        </p>
                      </div>
                      <FileText className="w-10 h-10 text-accent/20" />
                    </div>
                  </Card>
                </motion.div>
                <motion.div variants={item}>
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-secondary mb-1">Average Grade</p>
                        <p className="text-2xl font-bold">{studentStats.averageGrade}%</p>
                      </div>
                      <BarChart3 className="w-10 h-10 text-warning/20" />
                    </div>
                  </Card>
                </motion.div>
                <motion.div variants={item}>
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-secondary mb-1">Completion Rate</p>
                        <p className="text-2xl font-bold">{studentStats.completionRate}%</p>
                      </div>
                      <TrendingUp className="w-10 h-10 text-success/20" />
                    </div>
                  </Card>
                </motion.div>
                <motion.div variants={item}>
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-secondary mb-1">Late Tasks</p>
                        <p className="text-2xl font-bold">{studentStats.lateAssignments}</p>
                      </div>
                      <AlertCircle className="w-10 h-10 text-danger/20" />
                    </div>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <h2 className="text-lg font-semibold mb-4">Upcoming Assignments</h2>
                  <div className="space-y-3">
                    {studentStats.recentAssignments.length === 0 ? (
                      <p className="text-center text-text-secondary py-8">
                        No upcoming assignments
                      </p>
                    ) : (
                      studentStats.recentAssignments.map((assignment, i) => {
                        const statusColors = {
                          pending: { bg: 'bg-accent/10', text: 'text-accent', label: 'Pending' },
                          submitted: { bg: 'bg-primary/10', text: 'text-primary', label: 'Submitted' },
                          graded: { bg: 'bg-success/10', text: 'text-success', label: 'Graded' },
                          late: { bg: 'bg-danger/10', text: 'text-danger', label: 'Late' }
                        }
                        const statusColor = statusColors[assignment.status]

                        return (
                          <motion.div 
                            key={assignment._id} 
                            className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg hover:bg-bg-tertiary transition-colors cursor-pointer group"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + (i * 0.1) }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push('/dashboard/assignments')}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate group-hover:text-primary transition-colors">
                                {assignment.title}
                              </p>
                              <p className="text-sm text-text-secondary">
                                Due {formatDistanceToNow(new Date(assignment.dueDate), { addSuffix: true })}
                              </p>
                              <p className="text-xs text-text-secondary">
                                By {assignment.assignedBy.firstName} {assignment.assignedBy.lastName}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              {assignment.submission?.grade !== null && assignment.submission?.grade !== undefined && (
                                <span className="text-sm font-semibold text-success">
                                  {assignment.submission.grade}%
                                </span>
                              )}
                              <Badge className={`${statusColor.bg} ${statusColor.text}`}>
                                {statusColor.label}
                              </Badge>
                              <button 
                                className="px-3 py-1.5 text-sm bg-primary hover:bg-primary-dark text-white rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push('/dashboard/assignments')
                                }}
                              >
                                View
                              </button>
                            </div>
                          </motion.div>
                        )
                      })
                    )}
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </main>
        </div>
      </div>
    )
  }

  // Render teacher dashboard
  if (user?.role === "teacher" && teacherStats) {
    return (
      <div className="flex h-screen bg-bg-secondary">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />

          <main className="flex-1 overflow-auto p-8">
            <motion.div 
              className="max-w-7xl mx-auto space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Welcome Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {user?.name || "Teacher"}!
                </h1>
                <p className="text-text-secondary">Here's your teaching overview.</p>
              </motion.div>

              {/* Stats Cards */}
              <motion.div 
                className="grid md:grid-cols-4 gap-6"
                variants={container}
                initial="hidden"
                animate="show"
              >
                <motion.div variants={item}>
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-secondary mb-1">Students</p>
                        <p className="text-2xl font-bold">{teacherStats.totalStudents}</p>
                      </div>
                      <Users className="w-10 h-10 text-primary/20" />
                    </div>
                  </Card>
                </motion.div>
                <motion.div variants={item}>
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-secondary mb-1">Pending Grading</p>
                        <p className="text-2xl font-bold">{teacherStats.pendingGrading}</p>
                      </div>
                      <ClipboardList className="w-10 h-10 text-warning/20" />
                    </div>
                  </Card>
                </motion.div>
                <motion.div variants={item}>
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-secondary mb-1">Class Average</p>
                        <p className="text-2xl font-bold">{teacherStats.averageClassGrade}%</p>
                      </div>
                      <BarChart3 className="w-10 h-10 text-success/20" />
                    </div>
                  </Card>
                </motion.div>
                <motion.div variants={item}>
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-secondary mb-1">Total Tasks</p>
                        <p className="text-2xl font-bold">{teacherStats.totalTasks}</p>
                      </div>
                      <FileText className="w-10 h-10 text-accent/20" />
                    </div>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Recent Submissions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <h2 className="text-lg font-semibold mb-4">Recent Submissions to Grade</h2>
                  <div className="space-y-3">
                    {teacherStats.recentSubmissions.length === 0 ? (
                      <p className="text-center text-text-secondary py-8">
                        No pending submissions
                      </p>
                    ) : (
                      teacherStats.recentSubmissions.map((submission, i) => (
                        <motion.div 
                          key={submission._id} 
                          className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg hover:bg-bg-tertiary transition-colors cursor-pointer"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + (i * 0.1) }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{submission.assignment.title}</p>
                            <p className="text-sm text-text-secondary">
                              {submission.student.firstName} {submission.student.lastName}
                            </p>
                            <p className="text-xs text-text-secondary">
                              Submitted {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}
                            </p>
                          </div>
                          <Badge className="bg-warning/10 text-warning">
                            Needs Grading
                          </Badge>
                        </motion.div>
                      ))
                    )}
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </main>
        </div>
      </div>
    )
  }

  return null
}
