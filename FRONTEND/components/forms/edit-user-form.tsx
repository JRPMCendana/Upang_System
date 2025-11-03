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
import type { User } from "@/types/user.types"
import { useUsers } from "@/hooks/use-users"
import { getUserFullName } from "@/utils/user.utils"
import { 
  validateEmail, 
  validatePassword, 
  validateMinLength, 
  validateMaxLength 
} from "@/utils/validation.utils"

interface EditUserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  user: User | null
}

export function EditUserForm({ open, onOpenChange, onSuccess, user }: EditUserFormProps) {
  const { updateUser, assignTeacher, unassignTeacher, loading: hookLoading } = useUsers()
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

  useEffect(() => {
    if (user?.role === "student" && open) {
      fetchTeachers()
    }
  }, [user, open])

  const { users: fetchedTeachers, fetchUsers } = useUsers()

  const fetchTeachers = async () => {
    setLoadingTeachers(true)
    await fetchUsers(1, { role: "teacher", status: "active", limit: 100 })
    setLoadingTeachers(false)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Email validation (optional field)
    if (formData.email.trim() && !validateEmail(formData.email)) {
      newErrors.email = "Invalid email format"
    }

    // Username validation (optional field)
    if (formData.username.trim()) {
      const minLengthError = validateMinLength(formData.username, 3, "Username")
      if (minLengthError) {
        newErrors.username = minLengthError
      } else {
        const maxLengthError = validateMaxLength(formData.username, 50, "Username")
        if (maxLengthError) {
          newErrors.username = maxLengthError
        }
      }
    }

    // Password validation (optional field)
    if (formData.password.trim()) {
      const passwordValidation = validatePassword(formData.password)
      if (!passwordValidation.valid && formData.password.trim().length < 6) {
        newErrors.password = "Password must be at least 6 characters"
      }
    }

    // Optional fields validation
    if (formData.firstName) {
      const firstNameError = validateMaxLength(formData.firstName, 50, "First name")
      if (firstNameError) {
        newErrors.firstName = firstNameError
      }
    }

    if (formData.lastName) {
      const lastNameError = validateMaxLength(formData.lastName, 50, "Last name")
      if (lastNameError) {
        newErrors.lastName = lastNameError
      }
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

    let success = true
    if (Object.keys(updateData).length > 0) {
      success = await updateUser(user._id, updateData)
    }

    if (success && user.role === "student") {
      const currentTeacherId = typeof user.assignedTeacher === 'object' && user.assignedTeacher 
        ? user.assignedTeacher._id 
        : (user.assignedTeacher as string) || ""

      if (formData.assignedTeacher !== currentTeacherId) {
        if (formData.assignedTeacher) {
          success = await assignTeacher(user._id, formData.assignedTeacher)
        } else if (currentTeacherId) {
          success = await unassignTeacher(user._id)
        }
      }
    }

    if (success) {
      onOpenChange(false)
      onSuccess?.()
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
                  disabled={hookLoading}
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
                  disabled={hookLoading}
                />
                {errors.email && (
                  <p className="text-xs text-danger">{errors.email}</p>
                )}
              </div>
            </div>

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
                  disabled={hookLoading}
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
                  disabled={hookLoading}
                />
                {errors.lastName && (
                  <p className="text-xs text-danger">{errors.lastName}</p>
                )}
              </div>
            </div>

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
                  disabled={hookLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                  disabled={hookLoading}
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

            {user.role === "student" && (
              <div className="grid gap-1.5">
                <Label htmlFor="assignedTeacher" className="text-sm">Assigned Teacher</Label>
                <Select
                  value={formData.assignedTeacher || "none"}
                  onValueChange={(value) => handleChange("assignedTeacher", value === "none" ? "" : value)}
                  disabled={hookLoading || loadingTeachers}
                >
                  <SelectTrigger id="assignedTeacher" className="h-9">
                    <SelectValue placeholder={loadingTeachers ? "Loading teachers..." : "Select a teacher"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No teacher assigned</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher._id} value={teacher._id}>
                        {getUserFullName(teacher)} (@{teacher.username})
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
              disabled={hookLoading}
              size="sm"
            >
              {hookLoading ? (
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
