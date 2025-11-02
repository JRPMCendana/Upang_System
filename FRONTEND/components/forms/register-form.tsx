"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Lock, User } from "lucide-react"

type UserRole = "student" | "teacher"

export function RegisterForm() {
  const [role, setRole] = useState<UserRole>("student")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="role">Register as</Label>
        <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
          <SelectTrigger id="role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="teacher">Teacher</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
          <Input id="name" placeholder="John Doe" className="pl-10" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
          <Input id="email" type="email" placeholder="you@example.com" className="pl-10" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
          <Input id="password" type="password" placeholder="••••••••" className="pl-10" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
          <Input id="confirm" type="password" placeholder="••••••••" className="pl-10" required />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer text-sm">
        <input type="checkbox" className="w-4 h-4 rounded" required />
        <span className="text-text-secondary">I agree to the Terms of Service</span>
      </label>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  )
}
