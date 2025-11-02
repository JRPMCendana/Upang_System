"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { User } from "@/services/user-service"
import { Mail, User as UserIcon, Calendar, Shield, GraduationCap } from "lucide-react"

interface StudentDetailDialogProps {
  student: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StudentDetailDialog({ student, open, onOpenChange }: StudentDetailDialogProps) {
  if (!student) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success border-success/20"
      case "deactivated":
        return "bg-warning/10 text-warning border-warning/20"
      case "deleted":
        return "bg-danger/10 text-danger border-danger/20"
      default:
        return "bg-bg-tertiary text-text-secondary"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            Student Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Header Card */}
          <Card className="p-4 bg-linear-to-r from-primary/5 to-primary/10 border-primary/20">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold">
                  {student.firstName && student.lastName
                    ? `${student.firstName} ${student.lastName}`
                    : student.username}
                </h3>
                <p className="text-text-secondary">@{student.username}</p>
              </div>
              <Badge className={statusColor(student.status)}>
                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
              </Badge>
            </div>
          </Card>

          {/* Personal Information */}
          <Card className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-primary" />
              Personal Information
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div>
                  <p className="text-sm text-text-secondary">Email Address</p>
                  <p className="font-medium">{student.email}</p>
                </div>
              </div>
              
              {(student.firstName || student.lastName) && (
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-sm text-text-secondary">Full Name</p>
                    <p className="font-medium">
                      {student.firstName} {student.lastName}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Account Information */}
          <Card className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Account Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-text-secondary">Account Created</p>
                <p className="font-medium text-sm">{formatDate(student.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Last Updated</p>
                <p className="font-medium text-sm">{formatDate(student.updatedAt)}</p>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
