"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, FileText, AlertCircle } from "lucide-react"
import type { Assignment } from "@/types/assignment.types"

interface SubmitAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignment: Assignment | null
  onSubmit: (file: File) => Promise<void>
  loading?: boolean
}

export function SubmitAssignmentDialog({
  open,
  onOpenChange,
  assignment,
  onSubmit,
  loading,
}: SubmitAssignmentDialogProps) {
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    await onSubmit(file)
    setFile(null)
  }

  if (!assignment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit Assignment</DialogTitle>
          <p className="text-sm text-text-secondary">Upload your work to submit this assignment</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Assignment Info */}
          <div className="bg-bg-secondary rounded-lg p-4 space-y-2">
            <h3 className="font-semibold">{assignment.title}</h3>
            <p className="text-sm text-text-secondary">{assignment.description}</p>
            <div className="flex items-center gap-2 text-sm text-text-secondary pt-2 border-t border-border">
              <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
              {assignment.totalPoints && <span>• {assignment.totalPoints} points</span>}
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Upload File *</Label>
            {!file ? (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition cursor-pointer">
                <input
                  type="file"
                  id="submission-file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.jpg,.jpeg,.png"
                />
                <label htmlFor="submission-file-upload" className="cursor-pointer">
                  <Upload className="w-10 h-10 text-text-secondary mx-auto mb-3" />
                  <p className="text-sm font-medium mb-1">Click to upload your work</p>
                  <p className="text-xs text-text-secondary">Supported files: PDF, DOC, PPT, TXT, ZIP, Images</p>
                  <p className="text-xs text-text-secondary mt-1">Maximum file size: 10MB</p>
                </label>
              </div>
            ) : (
              <div className="border-2 border-primary/20 bg-primary/5 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-text-secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={handleRemoveFile}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 bg-accent/10 border border-accent/20 rounded-lg p-3">
            <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div className="text-sm text-text-secondary">
              <p className="font-medium text-text-primary mb-1">Before submitting:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Make sure your file is complete</li>
                <li>Check that you've followed all instructions</li>
                <li>You can replace your submission before the due date</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !file}>
              {loading ? "Submitting..." : "Submit Assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
