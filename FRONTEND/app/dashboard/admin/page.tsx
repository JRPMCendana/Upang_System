"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Users, BookOpen, AlertCircle, TrendingUp, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/login")
    }
  }, [isAuthenticated, user, router])

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
              <Button className="bg-primary hover:bg-primary-dark">Add User</Button>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Total Users</p>
                    <p className="text-2xl font-bold">1,247</p>
                  </div>
                  <Users className="w-10 h-10 text-primary/20" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Active Courses</p>
                    <p className="text-2xl font-bold">42</p>
                  </div>
                  <BookOpen className="w-10 h-10 text-accent/20" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">System Health</p>
                    <p className="text-2xl font-bold">99.8%</p>
                  </div>
                  <Activity className="w-10 h-10 text-success/20" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Platform Growth</p>
                    <p className="text-2xl font-bold">+12.5%</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-danger/20" />
                </div>
              </Card>
            </div>

            {/* User Management */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Users</h2>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium">
                        User {i}: {["John Doe", "Jane Smith", "Mike Johnson", "Sarah Williams", "Tom Brown"][i - 1]}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {["student", "teacher", "student", "teacher", "admin"][i - 1]} • Joined {10 - i} days ago
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* System Alerts */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">System Alerts</h2>
                <div className="space-y-3">
                  <div className="flex gap-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-warning">High Server Load</p>
                      <p className="text-warning/80">CPU usage at 78%</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-accent">Backup Completed</p>
                      <p className="text-accent/80">Last backup: 2 hours ago</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Course Statistics</h2>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Course {i}</span>
                        <span className="text-sm text-text-secondary">{30 + i * 10} students</span>
                      </div>
                      <div className="w-full bg-bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${60 + i * 10}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
