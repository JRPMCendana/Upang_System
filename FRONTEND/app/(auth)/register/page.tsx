import { RegisterForm } from "@/components/forms/register-form"
import { BookOpen } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-linear-to-br from-accent to-accent-dark flex-col justify-between p-8 text-white">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold">UPangLearn</h1>
        </div>
        <div>
          <h2 className="text-4xl font-bold mb-4">Join Us Today</h2>
          <p className="text-green-100">Start your learning journey with UPangLearn's comprehensive platform.</p>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12 md:p-12">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Create Account</h2>
            <p className="text-text-secondary">Register to access learning materials and track your progress</p>
          </div>
          <RegisterForm />
          <p className="text-center text-sm text-text-secondary mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
