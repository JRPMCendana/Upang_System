"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users as UsersIcon, Search, Plus, Shield, Mail, MoreVertical, Pencil, Trash2, UserX } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

export default function UsersPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "teacher">("all")

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

  const mockUsers = [
    { id: 1, name: "Jane Doe", email: "jane@student.test", role: "student", status: "active" },
    { id: 2, name: "John Smith", email: "john@student.test", role: "student", status: "inactive" },
    { id: 3, name: "Alice Johnson", email: "alice@teacher.test", role: "teacher", status: "active" },
    { id: 4, name: "Bob Williams", email: "bob@teacher.test", role: "teacher", status: "active" },
    { id: 5, name: "Admin User", email: "admin@upang.test", role: "admin", status: "active" },
  ] as const

  const filteredUsers = useMemo(
    () =>
      mockUsers
        // Exclude admin accounts from the listing (admins monitor students/teachers only)
        .filter((u) => u.role === "student" || u.role === "teacher")
        .filter((u) => {
          const matchesRole = roleFilter === "all" || u.role === roleFilter
          const q = searchQuery.toLowerCase()
          const matchesQuery = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
          return matchesRole && matchesQuery
        }),
    [mockUsers, roleFilter, searchQuery],
  )

  const roleBadge = (role: string) => {
    switch (role) {
      case "student":
        return <Badge className="bg-primary/10 text-primary">Student</Badge>
      case "teacher":
        return <Badge className="bg-accent/10 text-accent">Teacher</Badge>
      case "admin":
        return (
          <Badge className="bg-foreground/10 text-foreground flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> Admin
          </Badge>
        )
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const statusDot = (status: string) => (
    <span
      className={
        "inline-block w-2.5 h-2.5 rounded-full " + (status === "active" ? "bg-primary" : "bg-muted")
      }
    />
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
                <h1 className="text-3xl font-bold mb-2">Users</h1>
                <p className="text-text-secondary">Manage users and roles</p>
              </div>
              <Button className="bg-primary hover:bg-primary-dark gap-2">
                <Plus className="w-5 h-5" /> Add User
              </Button>
            </div>

            {/* Filters */}
            <Card className="p-4 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
                  <Input
                    placeholder="Search by name or email..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  {["all", "student", "teacher"].map((r) => (
                    <Button
                      key={r}
                      variant={roleFilter === (r as any) ? "default" : "outline"}
                      size="sm"
                      className="capitalize"
                      onClick={() => setRoleFilter(r as any)}
                    >
                      {r}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Users list */}
            <Card className="overflow-hidden">
              <div className="min-w-full overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-bg-tertiary text-text-secondary">
                    <tr>
                      <th className="text-left px-6 py-3 font-medium">Name</th>
                      <th className="text-left px-6 py-3 font-medium">Email</th>
                      <th className="text-left px-6 py-3 font-medium">Role</th>
                      <th className="text-left px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-t border-border hover:bg-bg-secondary/70">
                        <td className="px-6 py-3 font-medium">{u.name}</td>
                        <td className="px-6 py-3 text-text-secondary flex items-center gap-2">
                          <Mail className="w-4 h-4" /> {u.email}
                        </td>
                        <td className="px-6 py-3">{roleBadge(u.role)}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            {statusDot(u.status)}
                            <span className="capitalize text-text-secondary">{u.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" className="gap-1">
                              <Pencil className="w-4 h-4" /> Edit
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1">
                              <UserX className="w-4 h-4" /> Deactivate
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
