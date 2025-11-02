"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, Search, Plus, Users, Calendar, MoreVertical } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function CoursesPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  const mockCourses = [
    {
      id: 1,
      title: "Introduction to React",
      teacher: "Prof. Smith",
      students: 45,
      progress: 65,
      startDate: "Jan 15, 2025",
      description: "Learn the fundamentals of React including components, hooks, and state management.",
    },
    {
      id: 2,
      title: "Web Design Basics",
      teacher: "Prof. Johnson",
      students: 38,
      progress: 45,
      startDate: "Jan 20, 2025",
      description: "Master the principles of modern web design and user interface creation.",
    },
    {
      id: 3,
      title: "JavaScript Fundamentals",
      teacher: "Prof. Williams",
      students: 52,
      progress: 80,
      startDate: "Jan 10, 2025",
      description: "Deep dive into JavaScript ES6+ features, async programming, and best practices.",
    },
    {
      id: 4,
      title: "Advanced CSS",
      teacher: "Prof. Brown",
      students: 32,
      progress: 55,
      startDate: "Feb 1, 2025",
      description: "Advanced styling techniques including Flexbox, Grid, and animations.",
    },
  ]

  const filteredCourses = mockCourses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.teacher.toLowerCase().includes(searchQuery.toLowerCase()),
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
                <h1 className="text-3xl font-bold mb-2">Courses</h1>
                <p className="text-text-secondary">Browse and manage all available courses</p>
              </div>
              {user?.role === "teacher" && (
                <Button className="bg-primary hover:bg-primary-dark gap-2">
                  <Plus className="w-5 h-5" />
                  Create Course
                </Button>
              )}
            </div>

            {/* Search */}
            <Card className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
                <Input
                  placeholder="Search courses by title or teacher..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </Card>

            {/* Courses Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">{course.title}</h3>
                        <p className="text-sm text-text-secondary mb-3">{course.teacher}</p>
                        <p className="text-sm text-text-secondary line-clamp-2">{course.description}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-text-secondary">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Users className="w-4 h-4" />
                      <span>{course.students} students</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Calendar className="w-4 h-4" />
                      <span>Started {course.startDate}</span>
                    </div>

                    <div className="pt-3 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-text-secondary">Progress</span>
                        <span className="text-xs font-medium text-primary">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${course.progress}%` }} />
                      </div>
                    </div>

                    <Button className="w-full mt-4" variant={user?.role === "teacher" ? "outline" : "default"}>
                      {user?.role === "teacher" ? "Manage Course" : "View Course"}
                    </Button>
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
