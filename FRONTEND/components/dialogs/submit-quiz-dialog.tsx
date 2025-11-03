"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import Image from "next/image"

interface SubmitQuizDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quizId: string
  quizTitle: string
  onSubmit: (quizId: string, file: File) => Promise<void>
  loading?: boolean
}

export function SubmitQuizDialog({
  open,
  onOpenChange,
  quizId,
  quizTitle,
  onSubmit,
  loading,
}: SubmitQuizDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      
      // Validate file type (images only)
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
      if (!validTypes.includes(selectedFile.type)) {
        alert("Please upload an image file (JPEG, PNG, GIF, or WebP)")
        return
      }

      setFile(selectedFile)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    await onSubmit(quizId, file)
    
    // Reset form
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
          <DialogTitle>Submit Quiz Screenshot</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Quiz: <span className="font-medium text-foreground">{quizTitle}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Please upload a screenshot of your completed quiz.
            </p>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="screenshot">Screenshot *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("screenshot")?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {file ? file.name : "Choose Image"}
              </Button>
              {file && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Accepted formats: JPEG, PNG, GIF, WebP
            </p>
          </div>

          {/* Image Preview */}
          {preview && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="relative w-full aspect-video bg-secondary rounded-md overflow-hidden">
                <Image
                  src={preview}
                  alt="Screenshot preview"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}

          {/* No File Selected */}
          {!file && (
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-md">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No image selected</p>
            </div>
          )}

          {/* Footer */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !file}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Quiz
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
