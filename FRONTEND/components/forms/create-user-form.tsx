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
import { 
  validateEmail, 
  validatePassword, 
  validateRequired, 
  validateMinLength, 
  validateMaxLength 
} from "@/utils/validation.utils"

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

    // Email validation
    const emailError = validateRequired(formData.email, "Email")
    if (emailError) {
      newErrors.email = emailError
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format"
    }

    // Username validation
    const usernameError = validateRequired(formData.username, "Username")
    if (usernameError) {
      newErrors.username = usernameError
    } else {
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

    // Password validation
    const passwordError = validateRequired(formData.password, "Password")
    if (passwordError) {
      newErrors.password = passwordError
    } else {
      const passwordValidation = validatePassword(formData.password)
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.errors[0]
      }
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = "Role is required"
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
    // Enforce character limits
    const limits: Record<string, number> = {
      email: 50,
      username: 50,
      password: 50,
      firstName: 50,
      lastName: 50,
    }
    
    const limit = limits[field]
    const limitedValue = limit && value.length > limit ? value.slice(0, limit) : value
    
    setFormData((prev) => ({ ...prev, [field]: limitedValue }))
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
                  maxLength={100}
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
                  maxLength={50}
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
                    maxLength={100}
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
                  maxLength={50}
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
                  maxLength={50}
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
