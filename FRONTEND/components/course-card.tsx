"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, Calendar, MoreVertical } from "lucide-react"

interface CourseCardProps {
  id: number
  title: string
  teacher: string
  students: number
  progress: number
  startDate: string
  description: string
  onViewClick?: () => void
}

export function CourseCard({
  title,
  teacher,
  students,
  progress,
  startDate,
  description,
  onViewClick,
}: CourseCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            <p className="text-sm text-text-secondary mb-3">{teacher}</p>
            <p className="text-sm text-text-secondary line-clamp-2">{description}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-text-secondary">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Users className="w-4 h-4" />
          <span>{students} students</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Calendar className="w-4 h-4" />
          <span>Started {startDate}</span>
        </div>

        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-text-secondary">Progress</span>
            <span className="text-xs font-medium text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-bg-secondary rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <Button className="w-full mt-4" onClick={onViewClick}>
          View Course
        </Button>
      </div>
    </Card>
  )
}
