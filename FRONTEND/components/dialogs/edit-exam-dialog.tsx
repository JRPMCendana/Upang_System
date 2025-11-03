"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { examService } from "@/services/exam-service"

interface EditExamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  examId: string
  initial: { title: string; description: string; dueDate?: string | null; totalPoints?: number; documentName?: string | null }
  onUpdated?: () => Promise<void> | void
}

export function EditExamDialog({ open, onOpenChange, examId, initial, onUpdated }: EditExamDialogProps) {
  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description)
  const [dueDate, setDueDate] = useState(initial.dueDate || "")
  const [totalPoints, setTotalPoints] = useState<number>(initial.totalPoints ?? 100)
  const [file, setFile] = useState<File | undefined>(undefined)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    try {
      setSaving(true)
      await examService.updateExam(examId, { title, description, dueDate, totalPoints }, file)
      onOpenChange(false)
      if (onUpdated) await onUpdated()
    } catch (e: any) {
      alert(e?.message || "Failed to update exam")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Exam</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="datetime-local" value={dueDate || ""} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Total Points</Label>
              <Input type="number" value={totalPoints} onChange={(e) => setTotalPoints(parseInt(e.target.value || "0", 10))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Replace Document (optional)</Label>
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0])} />
            {initial.documentName && !file && <p className="text-xs text-text-secondary">Current: {initial.documentName}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


