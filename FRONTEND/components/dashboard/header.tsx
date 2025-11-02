"use client"

import { Bell, Search, LogOut } from "lucide-react"
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
    <header className="flex items-center justify-between px-8 py-4 border-b border-border bg-white">
      <div className="flex-1 max-w-xs">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
          <Input placeholder="Search..." className="pl-10 bg-bg-secondary" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-text-secondary">
          <Bell className="w-5 h-5" />
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
