"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

import ForgotPasswordForm from "@/components/forms/forgot-password-form"
export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { login } = useAuth()
  const [showForgot, setShowForgot] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
  const user = await login(email, password)
      // Redirect to appropriate dashboard based on returned role
      const rolePath = user.role
      router.push(`/dashboard/${rolePath}`)
    } catch (err) {
      setError("Login failed. Please check your email/username and password.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {!showForgot && (
        <form onSubmit={handleSubmit} className="space-y-6" name="login">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
        </div>

        {error && (
          <div className="flex gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
      )}

      {/* Forgot password toggle */}
      {!showForgot ? (
        <div className="mt-4 text-center">
          <button
            type="button"
            className="text-sm text-primary hover:underline font-medium"
            onClick={() => setShowForgot(true)}
          >
            Forgot password?
          </button>
        </div>
      ) : (
        <ForgotPasswordForm onDone={() => setShowForgot(false)} />
      )}
    </>
  )
}
