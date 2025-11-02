"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, UserCog, Eye, EyeOff } from "lucide-react"
import { userService, type User } from "@/services/user-service"
import { useToast } from "@/hooks/use-toast"

interface EditUserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  user: User | null
}

export function EditUserForm({ open, onOpenChange, onSuccess, user }: EditUserFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [teachers, setTeachers] = useState<User[]>([])
  const [loadingTeachers, setLoadingTeachers] = useState(false)
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    firstName: "",
    lastName: "",
    assignedTeacher: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        password: "",
        username: user.username || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        assignedTeacher: typeof user.assignedTeacher === 'object' && user.assignedTeacher ? user.assignedTeacher._id : (user.assignedTeacher as string) || "",
      })
    }
  }, [user])

  // Load teachers list if user is a student
  useEffect(() => {
    if (user?.role === "student" && open) {
      fetchTeachers()
    }
  }, [user, open])

  const fetchTeachers = async () => {
    try {
      setLoadingTeachers(true)
      const response = await userService.getUsers(1, 100, "teacher", "active")
      setTeachers(response.data)
    } catch (error) {
      console.error("Error fetching teachers:", error)
    } finally {
      setLoadingTeachers(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Email validation
    if (formData.email.trim() && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format"
    }

    // Username validation
    if (formData.username.trim()) {
      if (formData.username.trim().length < 3) {
        newErrors.username = "Username must be at least 3 characters"
      } else if (formData.username.trim().length > 50) {
        newErrors.username = "Username cannot exceed 50 characters"
      }
    }

    // Password validation (only if provided)
    if (formData.password.trim()) {
      if (formData.password.trim().length < 6) {
        newErrors.password = "Password must be at least 6 characters"
      }
    }

    // Name validation
    if (formData.firstName && formData.firstName.length > 50) {
      newErrors.firstName = "First name cannot exceed 50 characters"
    }

    if (formData.lastName && formData.lastName.length > 50) {
      newErrors.lastName = "Last name cannot exceed 50 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Prepare update data (only include changed fields)
      const updateData: any = {}
      
      if (formData.email.trim() !== user.email) {
        updateData.email = formData.email.trim()
      }
      
      if (formData.username.trim() !== user.username) {
        updateData.username = formData.username.trim()
      }
      
      if (formData.firstName.trim() !== (user.firstName || "")) {
        updateData.firstName = formData.firstName.trim() || undefined
      }
      
      if (formData.lastName.trim() !== (user.lastName || "")) {
        updateData.lastName = formData.lastName.trim() || undefined
      }
      
      if (formData.password.trim()) {
        updateData.password = formData.password.trim()
      }

      // Update user basic info if there are changes
      if (Object.keys(updateData).length > 0) {
        await userService.updateUser(user._id, updateData)
      }

      // Handle teacher assignment for students
      if (user.role === "student") {
        const currentTeacherId = typeof user.assignedTeacher === 'object' && user.assignedTeacher 
          ? user.assignedTeacher._id 
          : (user.assignedTeacher as string) || ""

        if (formData.assignedTeacher !== currentTeacherId) {
          if (formData.assignedTeacher) {
            // Assign new teacher
            await userService.assignTeacher(user._id, formData.assignedTeacher)
          } else if (currentTeacherId) {
            // Unassign teacher
            await userService.unassignTeacher(user._id)
          }
        }
      }

      toast({
        title: "Success",
        description: "User updated successfully!",
      })

      // Close dialog and refresh parent
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <UserCog className="w-5 h-5 text-primary" />
            Edit User
          </DialogTitle>
          <DialogDescription className="text-sm">
            Update user information. Leave password empty to keep current password.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-3 py-2">
            {/* Row 1: Username and Email */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="username" className="text-sm">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  className={`h-9 ${errors.username ? "border-danger" : ""}`}
                  disabled={loading}
                />
                {errors.username && (
                  <p className="text-xs text-danger">{errors.username}</p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`h-9 ${errors.email ? "border-danger" : ""}`}
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-xs text-danger">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Row 2: First Name and Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="firstName" className="text-sm">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  className={`h-9 ${errors.firstName ? "border-danger" : ""}`}
                  disabled={loading}
                />
                {errors.firstName && (
                  <p className="text-xs text-danger">{errors.firstName}</p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  className={`h-9 ${errors.lastName ? "border-danger" : ""}`}
                  disabled={loading}
                />
                {errors.lastName && (
                  <p className="text-xs text-danger">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Row 3: Password */}
            <div className="grid gap-1.5">
              <Label htmlFor="password" className="text-sm">
                Password <span className="text-text-secondary text-xs">(leave empty to keep current)</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className={`h-9 pr-10 ${errors.password ? "border-danger" : ""}`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-danger">{errors.password}</p>
              )}
            </div>

            {/* Row 4: Assigned Teacher (only for students) */}
            {user.role === "student" && (
              <div className="grid gap-1.5">
                <Label htmlFor="assignedTeacher" className="text-sm">Assigned Teacher</Label>
                <Select
                  value={formData.assignedTeacher || "none"}
                  onValueChange={(value) => handleChange("assignedTeacher", value === "none" ? "" : value)}
                  disabled={loading || loadingTeachers}
                >
                  <SelectTrigger id="assignedTeacher" className="h-9">
                    <SelectValue placeholder={loadingTeachers ? "Loading teachers..." : "Select a teacher"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No teacher assigned</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher._id} value={teacher._id}>
                        {userService.getUserFullName(teacher)} (@{teacher.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 flex justify-center gap-2">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary-dark"
              disabled={loading}
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <UserCog className="w-4 h-4 mr-2" />
                  Update User
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
