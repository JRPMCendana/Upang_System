"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, X, Loader2 } from "lucide-react"

interface FileViewerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileId: string
  fileName?: string
  fileType?: string
  onDownload?: () => void
  fetchFile: (fileId: string) => Promise<Blob>
}

export function FileViewerDialog({
  open,
  onOpenChange,
  fileId,
  fileName,
  fileType,
  onDownload,
  fetchFile,
}: FileViewerDialogProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const urlRef = useRef<string | null>(null)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [dialogWidth, setDialogWidth] = useState<string>("95vw")

  useEffect(() => {
    if (open && fileId) {
      setLoading(true)
      setError(null)
      
      // Clean up previous URL if exists
      if (urlRef.current) {
        window.URL.revokeObjectURL(urlRef.current)
        urlRef.current = null
      }

      fetchFile(fileId)
        .then((blob) => {
          const url = window.URL.createObjectURL(blob)
          urlRef.current = url
          setFileUrl(url)
          
          // For images, dimensions will be set when the image loads
          // For non-images, use default width
          if (!fileType?.startsWith("image/")) {
            setDialogWidth("80vw")
          }
          
          setLoading(false)
        })
        .catch((err) => {
          console.error("Error loading file:", err)
          setError(err.message || "Failed to load file")
          setLoading(false)
        })
    }

    // Cleanup: revoke object URL when dialog closes or component unmounts
    return () => {
      if (urlRef.current) {
        window.URL.revokeObjectURL(urlRef.current)
        urlRef.current = null
        setFileUrl(null)
      }
    }
  }, [open, fileId, fetchFile])

  // Determine if file is an image
  const isImage = fileType?.startsWith("image/")
  const isPdf = fileType === "application/pdf" || fileName?.toLowerCase().endsWith(".pdf")

  // Calculate dialog width based on image dimensions
  useEffect(() => {
    if (imageDimensions && isImage) {
      const aspectRatio = imageDimensions.width / imageDimensions.height
      const maxViewportWidth = 0.95 // 95% of viewport
      const maxViewportHeight = 0.9 // 90% of viewport
      
      // Calculate width based on aspect ratio
      // For landscape images (wider), use more width
      // For portrait images (taller), limit width to maintain reasonable height
      let calculatedWidth: number
      
      if (aspectRatio > 1.5) {
        // Very wide landscape images - use most of viewport width
        calculatedWidth = maxViewportWidth
      } else if (aspectRatio > 1.2) {
        // Wide landscape images
        calculatedWidth = maxViewportWidth * 0.9
      } else if (aspectRatio > 0.8) {
        // Square images
        calculatedWidth = maxViewportWidth * 0.75
      } else {
        // Portrait images - limit width to prevent excessive height
        calculatedWidth = Math.min(maxViewportWidth * 0.6, (maxViewportHeight * window.innerHeight * aspectRatio) / window.innerWidth)
      }
      
      setDialogWidth(`${(calculatedWidth * 100).toFixed(1)}vw`)
    }
  }, [imageDimensions, isImage])

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setImageDimensions(null)
      setDialogWidth("95vw")
    }
  }, [open, fileId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="h-[90vh] p-0 flex flex-col" 
        style={{ width: dialogWidth, maxWidth: '95vw' }}
        showCloseButton={false}
      >
        <DialogHeader className="px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold">
                {fileName || "View File"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                File viewer dialog for {fileName || "submitted file"}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {onDownload && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div 
          className="flex-1 overflow-auto p-4 bg-bg-secondary flex items-center justify-center relative"
          style={{ minHeight: 0 }}
        >
          {loading && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-text-secondary">Loading file...</p>
            </div>
          )}

          {error && (
            <div className="text-center">
              <p className="text-destructive mb-2">Error loading file</p>
              <p className="text-sm text-text-secondary">{error}</p>
            </div>
          )}

          {fileUrl && !loading && !error && (
            <div className="w-full h-full flex items-center justify-center relative" style={{ minWidth: 0, minHeight: 0 }}>
              {isImage ? (
                <img
                  src={fileUrl}
                  alt={fileName || "Submitted file"}
                  className="rounded-lg shadow-lg select-none"
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxWidth: '100%',
                    maxHeight: 'calc(90vh - 120px)',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                  draggable={false}
                  onLoad={(e) => {
                    const img = e.currentTarget
                    if (!imageDimensions) {
                      setImageDimensions({ 
                        width: img.naturalWidth, 
                        height: img.naturalHeight 
                      })
                    }
                  }}
                />
              ) : isPdf ? (
                <iframe
                  src={fileUrl}
                  className="w-full h-full rounded-lg border border-border"
                  title={fileName || "PDF viewer"}
                />
              ) : (
                <div className="text-center p-8">
                  <p className="text-text-secondary mb-4">
                    File preview not available for this file type
                  </p>
                  <Button variant="outline" onClick={onDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download to view
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

