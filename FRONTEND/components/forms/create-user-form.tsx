"use client"

import { useState } from "react"
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
import { Loader2, UserPlus, Eye, EyeOff } from "lucide-react"
import { useUsers } from "@/hooks/use-users"

interface CreateUserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateUserForm({ open, onOpenChange, onSuccess }: CreateUserFormProps) {
  const { createUser, loading: hookLoading } = useUsers()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    role: "student" as "student" | "teacher",
    firstName: "",
    lastName: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required fields validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format"
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    } else if (formData.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    } else if (formData.username.trim().length > 50) {
      newErrors.username = "Username cannot exceed 50 characters"
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required"
    } else if (formData.password.trim().length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!formData.role) {
      newErrors.role = "Role is required"
    }

    // Optional fields validation
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

    if (!validateForm()) {
      return
    }

    const success = await createUser({
      email: formData.email.trim(),
      password: formData.password.trim(),
      username: formData.username.trim(),
      role: formData.role,
      firstName: formData.firstName.trim() || undefined,
      lastName: formData.lastName.trim() || undefined,
    })

    if (success) {
      // Reset form
      setFormData({
        email: "",
        password: "",
        username: "",
        role: "student",
        firstName: "",
        lastName: "",
      })
      setErrors({})

      // Close dialog and refresh parent
      onOpenChange(false)
      onSuccess?.()
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="w-5 h-5 text-primary" />
            Create New User
          </DialogTitle>
          <DialogDescription className="text-sm">
            Create a new student or teacher account. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-3 py-2">
            {/* Row 1: Role and Email */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="role" className="text-sm">
                  Role <span className="text-danger">*</span>
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleChange("role", value)}
                >
                  <SelectTrigger id="role" className={`h-9 ${errors.role ? "border-danger" : ""}`}>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-xs text-danger">{errors.role}</p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="email" className="text-sm">
                  Email <span className="text-danger">*</span>
                </Label>
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

            {/* Row 2: Username and Password */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="username" className="text-sm">
                  Username <span className="text-danger">*</span>
                </Label>
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
                <Label htmlFor="password" className="text-sm">
                  Password <span className="text-danger">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
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
            </div>

            {/* Row 3: First Name and Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="firstName" className="text-sm">First Name (Optional)</Label>
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
                <Label htmlFor="lastName" className="text-sm">Last Name (Optional)</Label>
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
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
