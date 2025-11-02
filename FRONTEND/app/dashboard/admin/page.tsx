"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Users, BookOpen, AlertCircle, TrendingUp, Activity, FileText, ClipboardList, ArrowRight, Loader2, UserCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardSkeleton } from "@/components/skeletons"
import { getUserFullName } from "@/utils/user.utils"
import { useAdminStats } from "@/hooks/use-admin-stats"

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
  // Use custom hook for admin statistics
  const {
    recentUsers,
    recentUsersLoading,
    totalStudents,
    totalTeachers,
    statsLoading,
    refreshAll,
  } = useAdminStats()

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  // Show loading state while checking auth or fetching data
  if (authLoading || recentUsersLoading || statsLoading) {
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
              <Button
                className="bg-primary hover:bg-primary-dark gap-2"
                onClick={() => router.push("/dashboard/users")}
              >
                <Users className="w-5 h-5" />
                Manage Users
              </Button>
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
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => router.push("/dashboard/users")}
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
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
                            Joined {formatDate(u.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Subject Reports (placeholder) */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Files Uploaded</p>
                    <p className="text-2xl font-bold">312</p>
                  </div>
                  <FileText className="w-10 h-10 text-primary/20" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Submissions</p>
                    <p className="text-2xl font-bold">4,820</p>
                  </div>
                  <ClipboardList className="w-10 h-10 text-accent/20" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Avg Score</p>
                    <p className="text-2xl font-bold">86%</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-warning/20" />
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
