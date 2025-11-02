"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, CheckCircle, AlertCircle } from "lucide-react"

type Role = "student" | "teacher"

export function ForgotPasswordForm({ onDone }: { onDone?: () => void }) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<Role>("student")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    // Placeholder-only behavior: no backend call. Simulate a brief delay then show success.
    await new Promise((r) => setTimeout(r, 600))
    setIsLoading(false)
    setSuccess(
      "If an account exists for the provided email, a password reset link will be sent."
    )
  }

  return (
    <div className="mt-4 p-4 border border-border rounded-lg bg-sheet">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fp-role">I am a</Label>
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger id="fp-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fp-email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
            <Input
              id="fp-email"
              type="email"
              placeholder="you@example.com"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {error && (
          <div className="flex gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <p className="text-sm text-success">{success}</p>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => onDone && onDone()}>
            Back to sign in
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ForgotPasswordForm
