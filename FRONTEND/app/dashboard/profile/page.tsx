"use client"

import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Lock,
  Eye,
  EyeOff
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { formatDate } from "@/utils/date.utils"
import { authService } from "@/services/auth-service"
import type { User as FullUser } from "@/types/user.types"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<FullUser | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    
    // Fetch full user data
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const response: any = await authService.getCurrentUser()
        const userData = response?.data || response?.user || response
        if (userData) {
          setUser(userData as FullUser)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [isAuthenticated, router, authLoading])

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <User className="w-8 h-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-text-secondary">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) return null

  const getRoleIcon = () => {
    switch (user.role) {
      case "teacher":
        return <BookOpen className="w-6 h-6 text-primary" />
      case "student":
        return <GraduationCap className="w-6 h-6 text-primary" />
      case "administrator":
        return <Shield className="w-6 h-6 text-primary" />
      default:
        return <User className="w-6 h-6 text-primary" />
    }
  }

  const getRoleBadgeColor = () => {
    switch (user.role) {
      case "teacher":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "student":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "administrator":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  const getStatusBadgeColor = () => {
    const status = user.status || "active"
    switch (status) {
      case "active":
        return "bg-success/10 text-success border-success/20"
      case "deactivated":
        return "bg-warning/10 text-warning border-warning/20"
      case "deleted":
        return "bg-danger/10 text-danger border-danger/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  const getStatusDisplay = () => {
    const status = user.status || "active"
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const getRoleDisplay = () => {
    const role = user.role || "unknown"
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  const fullName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.username

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "All fields are required",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "New password must be at least 6 characters",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "New passwords do not match",
      })
      return
    }

    if (currentPassword === newPassword) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "New password must be different from current password",
      })
      return
    }

    try {
      setChangingPassword(true)
      const response = await authService.changePassword(currentPassword, newPassword)
      
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Password changed successfully",
        })
        
        // Reset form
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setShowChangePassword(false)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to change password. Please check your current password.",
      })
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="flex h-screen bg-bg-secondary">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">My Profile</h1>
                <p className="text-text-secondary">View your account information</p>
              </div>
            </div>

            {/* Profile Header Card */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  {getRoleIcon()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">{fullName}</h2>
                  <p className="text-text-secondary">@{user.username}</p>
                </div>
              </div>
            </Card>

            {/* Personal Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-text-secondary mb-1">First Name</p>
                  <p className="font-medium">
                    {user.firstName || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-1">Last Name</p>
                  <p className="font-medium">
                    {user.lastName || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-1">Username</p>
                  <p className="font-medium">@{user.username}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-1 flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    Email
                  </p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
            </Card>

            {/* Account Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Account Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Role</p>
                  <Badge className={getRoleBadgeColor()}>
                    {getRoleDisplay()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-1">Account Status</p>
                  <Badge className={getStatusBadgeColor()}>
                    {getStatusDisplay()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Account Created
                  </p>
                  <p className="font-medium">
                    {user.createdAt ? formatDate(user.createdAt) : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Last Updated
                  </p>
                  <p className="font-medium">
                    {user.updatedAt ? formatDate(user.updatedAt) : "N/A"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Change Password */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Change Password
                </h3>
                {!showChangePassword && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowChangePassword(true)}
                  >
                    Change Password
                  </Button>
                )}
              </div>

              {showChangePassword && (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        disabled={changingPassword}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password (min 6 characters)"
                        disabled={changingPassword}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                        disabled={changingPassword}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="submit"
                      disabled={changingPassword}
                    >
                      {changingPassword ? "Changing..." : "Change Password"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowChangePassword(false)
                        setCurrentPassword("")
                        setNewPassword("")
                        setConfirmPassword("")
                      }}
                      disabled={changingPassword}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </Card>

            {user.role === "student" && user.assignedTeacher && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Teacher Assignment
                </h3>
                <div>
                  <p className="text-sm text-text-secondary mb-1">Assigned Teacher</p>
                  {typeof user.assignedTeacher === 'object' && user.assignedTeacher !== null ? (
                    <p className="font-medium">
                      {user.assignedTeacher.firstName && user.assignedTeacher.lastName
                        ? `${user.assignedTeacher.firstName} ${user.assignedTeacher.lastName}`
                        : user.assignedTeacher.username || "Unknown"}
                    </p>
                  ) : (
                    <p className="font-medium text-text-secondary">Not assigned</p>
                  )}
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

