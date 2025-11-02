import { LoginForm } from "@/components/forms/login-form"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Branding with image */}
  <div className="hidden md:flex md:w-1/2 relative overflow-hidden diagonal-right">
        <Image
          src="/res/login-image.png"
          alt="Login visual"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-br from-primary/80 to-green-700/60" />
        <div className="relative z-10 flex flex-col justify-between p-8 text-white w-full">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">UPang Learning Management System</h1>
          </div>
          <div>
            <h2 className="text-4xl font-bold mb-4">Welcome back!</h2>
            <p className="text-green-100 mb-6">View your courses, submit work, take quizzes, and track your progress easily.</p>
            <div className="bg-white/10 rounded-lg p-4 space-y-3">
              <p className="text-sm font-semibold text-green-100">Test Credentials:</p>
              <div className="text-xs text-green-100">
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
          <p className="text-green-100/60">UPangLearn © 2025</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12 md:p-12">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-0">
            <div className="justify-center flex mb-4">
              <Image
                src="/res/PHINMA-Logo.png"
                alt="PHINMA logo"
                width={96}
                height={96}
                className="rounded-md bg-white/20 p-1"
              />
            </div>
            <h2 className="text-3xl font-bold mb-2">Sign In</h2>
            <p className="text-text-secondary">Enter your credentials to access UPangLearn</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
