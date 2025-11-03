"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import Image from "next/image"

interface SubmitExamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  examId: string
  examTitle: string
  onSubmit: (examId: string, file: File) => Promise<void>
  loading?: boolean
}

export function SubmitExamDialog({ open, onOpenChange, examId, examTitle, onSubmit, loading }: SubmitExamDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]
      if (!validTypes.includes(selectedFile.type)) {
        alert("Please upload an image/PDF/DOC/DOCX file")
        return
      }
      setFile(selectedFile)
      // Only create image preview for image types
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onloadend = () => setPreview(reader.result as string)
        reader.readAsDataURL(selectedFile)
      } else {
        setPreview(null)
      }
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    await onSubmit(examId, file)
    setFile(null)
    setPreview(null)
  }

  const handleClose = () => {
    setFile(null)
    setPreview(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit Exam Screenshot</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Exam: <span className="font-medium text-foreground">{examTitle}</span>
            </p>
            <p className="text-sm text-muted-foreground">Please upload a screenshot of your completed exam.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="examScreenshot">Screenshot or file *</Label>
            <div className="flex items-center gap-2">
              <Input id="examScreenshot" type="file" accept="image/*,.pdf,.doc,.docx" onChange={handleFileChange} className="hidden" />
              <Button type="button" variant="outline" onClick={() => document.getElementById("examScreenshot")?.click()} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                {file ? file.name : "Choose File"}
              </Button>
              {file && (
                <Button type="button" variant="ghost" size="icon" onClick={handleRemoveFile}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Accepted formats: JPEG, PNG, GIF, WebP, PDF, DOC, DOCX</p>
          </div>

          {preview ? (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="relative w-full aspect-video bg-secondary rounded-md overflow-hidden">
                <Image src={preview} alt="Screenshot preview" fill className="object-contain" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-md">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No preview available</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !file}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Exam
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


