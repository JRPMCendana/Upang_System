import { LoginForm } from "@/components/forms/login-form"
import { BookOpen } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary to-blue-700 flex-col justify-between p-8 text-white">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold">UPangLearn</h1>
        </div>
        <div>
          <h2 className="text-4xl font-bold mb-4">Welcome Back</h2>
          <p className="text-blue-100 mb-6">Access your courses, assignments, and grades all in one place.</p>
          <div className="bg-white/10 rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold text-blue-100">Test Credentials:</p>
            <div className="text-xs text-blue-100">
              <p>
                <strong>Student:</strong> student@test.com
              </p>
              <p>
                <strong>Teacher:</strong> teacher@test.com
              </p>
              <p>
                <strong>Admin:</strong> admin@test.com
              </p>
              <p className="mt-2">
                <strong>Password:</strong> password123
              </p>
            </div>
          </div>
        </div>
        <p className="text-blue-100/60">UPangLearn © 2025</p>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12 md:p-12">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Sign In</h2>
            <p className="text-text-secondary">Enter your credentials to access UPangLearn</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
