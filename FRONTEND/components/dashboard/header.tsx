"use client"

import { Search, LogOut } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { getUserInitials } from "@/utils/user.utils"

export function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/login")
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
            <AvatarFallback>{user?.name ? user.name.substring(0, 2).toUpperCase() : "U"}</AvatarFallback>
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
          onClick={() => setShowLogoutDialog(true)}
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You will need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-danger hover:bg-danger/90 text-white">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  )
}
