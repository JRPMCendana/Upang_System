"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, FileText, Calendar, TrendingUp, Users, BookOpen } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ReportsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [range, setRange] = useState("month")

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

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <BarChart3 className="w-8 h-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || (user && user.role !== "admin")) return null

  const stats = [
    { label: "Total Users", value: 1350, icon: Users, color: "text-primary" },
    { label: "Active Students", value: 980, icon: BookOpen, color: "text-accent" },
    { label: "Assignments Submitted", value: 4320, icon: FileText, color: "text-warning" },
    { label: "Avg. Grade", value: "87%", icon: TrendingUp, color: "text-foreground" },
  ]

  const recentReports = [
    { id: 1, name: "Monthly Performance", date: "Nov 1, 2025", status: "Generated" },
    { id: 2, name: "Course Engagement", date: "Oct 28, 2025", status: "Generated" },
    { id: 3, name: "Teacher Activity", date: "Oct 20, 2025", status: "Generated" },
  ]

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
                <h1 className="text-3xl font-bold mb-2">Reports</h1>
                <p className="text-text-secondary">View analytics and generate reports</p>
              </div>
              <Button className="bg-primary hover:bg-primary-dark gap-2">
                <BarChart3 className="w-5 h-5" /> Generate Report
              </Button>
            </div>

            {/* Filters */}
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-text-secondary" />
                  <span className="text-sm text-text-secondary">Range</span>
                </div>
                <Select value={range} onValueChange={setRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s) => (
                <Card key={s.label} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary">{s.label}</p>
                      <p className="text-2xl font-bold mt-1">{s.value}</p>
                    </div>
                    <s.icon className={`w-6 h-6 ${s.color}`} />
                  </div>
                </Card>
              ))}
            </div>

            {/* Recent reports */}
            <Card className="p-0 overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold">Recent Reports</h2>
              </div>
              <div className="divide-y divide-border">
                {recentReports.map((r) => (
                  <div key={r.id} className="p-4 flex items-center justify-between hover:bg-bg-secondary/70">
                    <div>
                      <p className="font-medium">{r.name}</p>
                      <p className="text-sm text-text-secondary">Generated on {r.date}</p>
                    </div>
                    <span className="text-sm text-primary">{r.status}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
