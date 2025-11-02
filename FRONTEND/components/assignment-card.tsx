"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Clock, AlertCircle, CheckCircle, MoreVertical } from "lucide-react"

interface AssignmentCardProps {
  id: number
  title: string
  course: string
  dueDate: string
  status: "pending" | "submitted" | "overdue"
  submissions?: number
  totalStudents?: number
  description: string
  isTeacher?: boolean
  onActionClick?: () => void
}

export function AssignmentCard({
  title,
  course,
  dueDate,
  status,
  submissions,
  totalStudents,
  description,
  isTeacher = false,
  onActionClick,
}: AssignmentCardProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "pending":
        return { bg: "bg-warning/10", text: "text-warning", icon: Clock, label: "Pending" }
      case "submitted":
        return { bg: "bg-accent/10", text: "text-accent", icon: CheckCircle, label: "Submitted" }
      case "overdue":
        return { bg: "bg-danger/10", text: "text-danger", icon: AlertCircle, label: "Overdue" }
      default:
        return { bg: "bg-gray-100", text: "text-gray-600", icon: FileText, label: "Unknown" }
    }
  }

  const statusStyles = getStatusStyles(status)
  const StatusIcon = statusStyles.icon

  return (
    <Card className="p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
            <FileText className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-lg font-semibold">{title}</h3>
              <Badge className={`${statusStyles.bg} ${statusStyles.text}`}>
                <span className="flex items-center gap-1">
                  <StatusIcon className="w-3 h-3" />
                  {statusStyles.label}
                </span>
              </Badge>
            </div>
            <p className="text-sm text-text-secondary mb-2">{course}</p>
            <p className="text-sm text-text-secondary line-clamp-1">{description}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-text-secondary flex-shrink-0">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-6 text-sm text-text-secondary pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>Due: {dueDate}</span>
        </div>
        {isTeacher && submissions !== undefined && (
          <div className="flex items-center gap-2">
            <span>
              {submissions}/{totalStudents} submissions
            </span>
          </div>
        )}
        <Button className="ml-auto" variant={isTeacher ? "outline" : "default"} size="sm" onClick={onActionClick}>
          {isTeacher ? "Review Submissions" : "Submit"}
        </Button>
      </div>
    </Card>
  )
}
