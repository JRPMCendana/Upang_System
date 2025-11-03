"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, FileText, ClipboardList, Users } from "lucide-react"
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
    label: "Exams",
    href: "/dashboard/exams",
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
    label: "Students",
    href: "/dashboard/users",
    icon: <Users className="w-5 h-5" />,
    roles: ["teacher"],
  },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: <Users className="w-5 h-5" />,
    roles: ["admin"],
  },
  {
    label: "Teacher's Activities",
    href: "/dashboard/subject-content",
    icon: <FileText className="w-5 h-5" />,
    roles: ["admin"],
  },
  {
    label: "Student Submissions",
    href: "/dashboard/student-submissions",
    icon: <ClipboardList className="w-5 h-5" />,
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
        {filteredNavItems.map((item) => {
          // Check if this is the dashboard link and we're on /dashboard
          const isDashboardLink = item.href.includes('/dashboard/student') || 
                                  item.href.includes('/dashboard/teacher') || 
                                  item.href.includes('/dashboard/admin')
          const isActive = pathname === item.href || 
                          (isDashboardLink && pathname === '/dashboard')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive ? "bg-primary text-white" : "text-text-secondary hover:bg-bg-tertiary",
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
