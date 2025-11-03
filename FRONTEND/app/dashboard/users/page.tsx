"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Users as UsersIcon, Search, Plus, Shield, Mail, MoreVertical, Pencil, Trash2, UserX, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import type { User } from "@/types/user.types"
import { CreateUserForm } from "@/components/forms/create-user-form"
import { EditUserForm } from "@/components/forms/edit-user-form"
import { StudentDetailDialog } from "@/components/dialogs/student-detail-dialog"
import { UsersSkeleton } from "@/components/skeletons"
import { getUserFullName } from "@/utils/user.utils"
import { useUsers } from "@/hooks/use-users"

export default function UsersPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
  // UI State
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "teacher">("all")
  const [statusFilter, setStatusFilter] = useState<"active" | "deactivated" | "deleted" | "all">("active")
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const [studentToView, setStudentToView] = useState<User | null>(null)

  const isAdmin = user?.role === "admin"
  const isTeacher = user?.role === "teacher"

  // Use custom hook for user management
  const {
    users,
    loading,
    initialLoading,
    currentPage,
    totalPages,
    totalItems,
    fetchUsers,
    changeUserStatus,
    setPage,
  } = useUsers({
    role: isTeacher ? "teacher" : "admin",
  })

  useEffect(() => {
    if (authLoading) return
    
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    if (user && user.role !== "admin" && user.role !== "teacher") {
      router.push(`/dashboard/${user.role}`)
    }
  }, [isAuthenticated, router, user, authLoading])

  useEffect(() => {
    if (isAuthenticated && (user?.role === "admin" || user?.role === "teacher")) {
      fetchUsers(currentPage, {
        role: roleFilter === "all" ? undefined : roleFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
        limit: 10,
      })
    }
  }, [isAuthenticated, user, currentPage, roleFilter, statusFilter, fetchUsers])

  const handleStatusChange = async (userId: string, newStatus: User["status"]) => {
    await changeUserStatus(userId, newStatus)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return
    
    await changeUserStatus(userToDelete._id, "deleted")
    setUserToDelete(null)
  }

  if (!isAuthenticated || (user && user.role !== "admin" && user.role !== "teacher")) return null

  // Client-side search filtering
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase()
    const userName = getUserFullName(u).toLowerCase()
    const matchesQuery = userName.includes(q) || u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)
    return matchesQuery
  })

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

  if (authLoading || initialLoading) {
    return (
      <div className="flex h-screen bg-bg-secondary">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-8">
            <UsersSkeleton />
          </main>
        </div>
      </div>
    )
  }

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
                <h1 className="text-3xl font-bold mb-2">
                  {isTeacher ? "Students" : "Users"}
                </h1>
                <p className="text-text-secondary">
                  {isTeacher ? "View and monitor student progress" : "Manage users and roles"}
                </p>
              </div>
              {isAdmin && (
                <Button 
                  className="bg-primary hover:bg-primary-dark gap-2"
                  onClick={() => setCreateUserDialogOpen(true)}
                >
                  <Plus className="w-5 h-5" /> Add User
                </Button>
              )}
            </div>

            {/* Filters */}
            <Card className="p-4 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
                  <Input
                    placeholder="Search by name, username or email..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-3 items-center w-full sm:w-auto">
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text-secondary whitespace-nowrap">Role:</span>
                      <Select
                        value={roleFilter}
                        onValueChange={(value: any) => {
                          setRoleFilter(value)
                          setPage(1)
                        }}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text-secondary whitespace-nowrap">Status:</span>
                      <Select
                        value={statusFilter}
                        onValueChange={(value: any) => {
                          setStatusFilter(value)
                          setPage(1)
                        }}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="deactivated">Deactivated</SelectItem>
                          <SelectItem value="deleted">Deleted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Users list */}
            <Card className="overflow-hidden relative">
              {loading && (
                <div className="absolute inset-0 bg-bg-primary/50 backdrop-blur-sm z-10 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
              {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
                  <UsersIcon className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No users found</p>
                  <p className="text-sm">Try adjusting your filters or search query</p>
                </div>
              ) : (
                <div className="min-w-full overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-bg-tertiary text-text-secondary">
                      <tr>
                        <th className="text-left px-6 py-3 font-medium">Username</th>
                        <th className="text-left px-6 py-3 font-medium">Name</th>
                        <th className="text-left px-6 py-3 font-medium">Email</th>
                        <th className="text-left px-6 py-3 font-medium">Role</th>
                        <th className="text-left px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u._id} className="border-t border-border hover:bg-bg-secondary/70">
                          <td className="px-6 py-3 font-medium">{u.username}</td>
                          <td className="px-6 py-3 text-text-secondary">
                            {getUserFullName(u)}
                          </td>
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
                              {isTeacher ? (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="gap-1"
                                  onClick={() => setStudentToView(u)}
                                >
                                  View Profile
                                </Button>
                              ) : (
                                <>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="gap-1"
                                    onClick={() => setUserToEdit(u)}
                                  >
                                    <Pencil className="w-4 h-4" /> Edit
                                  </Button>
                                  {u.status === "active" ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-1"
                                      onClick={() => handleStatusChange(u._id, "deactivated")}
                                    >
                                      <UserX className="w-4 h-4" /> Deactivate
                                    </Button>
                                  ) : u.status === "deactivated" ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-1"
                                      onClick={() => handleStatusChange(u._id, "active")}
                                    >
                                      <Shield className="w-4 h-4" /> Activate
                                    </Button>
                                  ) : null}
                                  {u.status !== "deleted" && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-danger"
                                      onClick={() => setUserToDelete(u)}
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-secondary">
                  Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalItems)} of {totalItems} users
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          className="w-9"
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create User Dialog */}
      <CreateUserForm
        open={createUserDialogOpen}
        onOpenChange={setCreateUserDialogOpen}
        onSuccess={() => fetchUsers(currentPage, {
          role: roleFilter === "all" ? undefined : roleFilter,
          status: statusFilter === "all" ? undefined : statusFilter,
          limit: 10,
        })}
      />

      {/* Edit User Dialog */}
      <EditUserForm
        open={!!userToEdit}
        onOpenChange={(open) => !open && setUserToEdit(null)}
        onSuccess={() => fetchUsers(currentPage, {
          role: roleFilter === "all" ? undefined : roleFilter,
          status: statusFilter === "all" ? undefined : statusFilter,
          limit: 10,
        })}
        user={userToEdit}
      />

      {/* Student Detail Dialog */}
      <StudentDetailDialog
        student={studentToView}
        open={!!studentToView}
        onOpenChange={(open) => !open && setStudentToView(null)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the account for{" "}
              <strong className="text-foreground">
                {userToDelete && getUserFullName(userToDelete)}
              </strong>{" "}
              ({userToDelete?.email})?
              <br />
              <br />
              This action will mark the account as deleted. The user will not be able to log in anymore.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-danger hover:bg-danger/90 text-white"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
