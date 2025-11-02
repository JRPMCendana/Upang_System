"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Search, Eye, Pencil, Archive } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function StudentSubmissionsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    if (user && user.role !== "admin") {
      router.push(`/dashboard/${user.role}`)
    }
  }, [isAuthenticated, router, user])

  if (!isAuthenticated || (user && user.role !== "admin")) return null

  const mockSubmissions = [
    { id: 1, student: "Jane Doe", activity: "React Hooks Assignment", course: "Introduction to React", score: 92, date: "2025-10-24" },
    { id: 2, student: "John Smith", activity: "Grid Layout Project", course: "Web Design Basics", score: 85, date: "2025-10-22" },
    { id: 3, student: "Alice Johnson", activity: "Async/Await Challenges", course: "JavaScript Fundamentals", score: 78, date: "2025-10-20" },
    { id: 4, student: "Bob Williams", activity: "Portfolio Website", course: "Advanced CSS", score: 88, date: "2025-10-18" },
  ]

  const submissions = mockSubmissions.filter((s) => {
    const q = searchQuery.toLowerCase()
    return (
      s.student.toLowerCase().includes(q) ||
      s.activity.toLowerCase().includes(q) ||
      s.course.toLowerCase().includes(q)
    )
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
                <h1 className="text-3xl font-bold mb-2">Student Submissions</h1>
                <p className="text-text-secondary">Review and manage submissions</p>
              </div>
            </div>

            {/* Search */}
            <Card className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
                <Input
                  placeholder="Search by student, activity, or course..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </Card>

            {/* Submissions list */}
            <div className="space-y-4">
              {submissions.map((s) => (
                <Card key={s.id} className="p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{s.activity}</h3>
                        <p className="text-sm text-text-secondary mb-1">{s.course}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                          <span className="font-medium">{s.student}</span>
                          <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> {s.date}
                          </span>
                          <Badge className="bg-accent/10 text-accent">Score: {s.score}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Eye className="w-4 h-4" /> View
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Pencil className="w-4 h-4" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Archive className="w-4 h-4" /> Archive
                      </Button>
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
