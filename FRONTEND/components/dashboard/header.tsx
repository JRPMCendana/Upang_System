"use client"

import { Search, LogOut } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-border bg-bg-primary">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-text-secondary">
        </Button>

        <div className="flex items-center gap-3">
          <Avatar className="cursor-pointer">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback>{getInitials(user?.name || "User")}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-text-secondary capitalize">{user?.role}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-text-secondary hover:text-danger"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}
