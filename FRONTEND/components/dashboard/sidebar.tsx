"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, FileText, ClipboardList, Users, Settings } from "lucide-react"
import { BookOpen } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles?: string[]
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard/student",
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ["student"],
  },
  {
    label: "Dashboard",
    href: "/dashboard/teacher",
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ["teacher"],
  },
  {
    label: "Dashboard",
    href: "/dashboard/admin",
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ["admin"],
  },
  {
    label: "Courses",
    href: "/dashboard/courses",
    icon: <BookOpen className="w-5 h-5" />,
    roles: ["student", "teacher"],
  },
  {
    label: "Assignments",
    href: "/dashboard/assignments",
    icon: <FileText className="w-5 h-5" />,
    roles: ["student", "teacher"],
  },
  {
    label: "Quizzes",
    href: "/dashboard/quizzes",
    icon: <ClipboardList className="w-5 h-5" />,
    roles: ["student", "teacher"],
  },
  {
    label: "Grades",
    href: "/dashboard/grades",
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ["student", "teacher"],
  },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: <Users className="w-5 h-5" />,
    roles: ["admin"],
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ["admin"],
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="w-5 h-5" />,
    roles: ["admin"],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const filteredNavItems = navItems.filter((item) => !item.roles || item.roles.includes(user?.role || ""))

  return (
    <aside className="w-64 border-r border-border bg-bg-secondary h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border flex items-center gap-3">
        <Image src="/res/PHINMA-Logo.png" alt="PHINMA logo" width={28} height={28} className="rounded" />
        <h1 className="text-lg font-bold text-primary">UPangLearn</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              pathname === item.href ? "bg-primary text-white" : "text-text-secondary hover:bg-bg-tertiary",
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
