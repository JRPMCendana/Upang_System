"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, MoreVertical, Search, Eye, Pencil, Trash2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

export default function SubjectContentPage() {
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

  const mockFiles = [
    { id: 1, course: "Introduction to React", fileName: "week-1-overview.pdf", type: "PDF", size: "2.3 MB", uploadedBy: "Prof. Smith", uploadedAt: "2025-10-22" },
    { id: 2, course: "Web Design Basics", fileName: "grid-layout-examples.zip", type: "ZIP", size: "5.1 MB", uploadedBy: "Prof. Johnson", uploadedAt: "2025-10-18" },
    { id: 3, course: "JavaScript Fundamentals", fileName: "async-await-guide.docx", type: "DOCX", size: "780 KB", uploadedBy: "Prof. Williams", uploadedAt: "2025-10-15" },
    { id: 4, course: "Advanced CSS", fileName: "animations-demo.mp4", type: "MP4", size: "18.4 MB", uploadedBy: "Prof. Brown", uploadedAt: "2025-10-05" },
  ]

  const files = useMemo(
    () =>
      mockFiles.filter((f) => {
        const q = searchQuery.toLowerCase()
        return (
          f.fileName.toLowerCase().includes(q) ||
          f.course.toLowerCase().includes(q) ||
          f.uploadedBy.toLowerCase().includes(q)
        )
      }),
    [searchQuery],
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
                <h1 className="text-3xl font-bold mb-2">Subject Content</h1>
                <p className="text-text-secondary">Monitor course files uploaded by teachers</p>
              </div>
            </div>

            {/* Search */}
            <Card className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
                <Input
                  placeholder="Search by course, file name, or teacher..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </Card>

            {/* Files list */}
            <Card className="overflow-hidden">
              <div className="min-w-full overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-bg-tertiary text-text-secondary">
                    <tr>
                      <th className="text-left px-6 py-3 font-medium">Course</th>
                      <th className="text-left px-6 py-3 font-medium">File</th>
                      <th className="text-left px-6 py-3 font-medium">Type</th>
                      <th className="text-left px-6 py-3 font-medium">Size</th>
                      <th className="text-left px-6 py-3 font-medium">Uploaded By</th>
                      <th className="text-left px-6 py-3 font-medium">Uploaded At</th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((f) => (
                      <tr key={f.id} className="border-t border-border hover:bg-bg-secondary/70">
                        <td className="px-6 py-3 font-medium">{f.course}</td>
                        <td className="px-6 py-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" /> {f.fileName}
                        </td>
                        <td className="px-6 py-3">{f.type}</td>
                        <td className="px-6 py-3">{f.size}</td>
                        <td className="px-6 py-3">{f.uploadedBy}</td>
                        <td className="px-6 py-3">{f.uploadedAt}</td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" className="gap-1">
                              <Eye className="w-4 h-4" /> View
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1">
                              <Pencil className="w-4 h-4" /> Edit
                            </Button>
                            <Button variant="ghost" size="icon" className="text-danger">
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>
                        </td>
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
