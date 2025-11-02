import { RegisterForm } from "@/components/register-form"
import { BookOpen } from "lucide-react"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-primary">UPangLearn</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <RegisterForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center text-sm text-text-secondary">
        <p>&copy; 2025 UPangLearn. All rights reserved.</p>
      </footer>
    </div>
  )
}
