"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Upload, X, FileText, Loader2, Search } from "lucide-react"
import type { CreateAssignmentData } from "@/types/assignment.types"
import { useStudentSelection } from "@/hooks/use-student-selection"

interface CreateAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateAssignmentData & { studentIds: string[] }, file?: File) => Promise<void>
  loading?: boolean
}

export function CreateAssignmentDialog({ open, onOpenChange, onSubmit, loading }: CreateAssignmentDialogProps) {
  const [formData, setFormData] = useState<CreateAssignmentData & { studentIds: string[] }>({
    courseId: "",
    title: "",
    description: "",
    instructions: "",
    dueDate: "",
    maxGrade: 100,
    submissionType: "file",
    allowLateSubmission: false,
    studentIds: [],
  })
  const [file, setFile] = useState<File | null>(null)

  // Student selection hook
  const {
    students: filteredStudents,
    allStudents: students,
    selectedIds: selectedStudentIds,
    selectedStudents,
    searchQuery,
    setSearchQuery,
    loading: loadingStudents,
    toggleStudent,
    removeStudent,
    toggleAllFiltered: toggleAllStudents,
    clearSelection,
    clearSearch,
    fetchStudents,
  } = useStudentSelection({ autoFetch: false })

  // Fetch students when dialog opens and reset state when it closes
  useEffect(() => {
    if (open) {
      fetchStudents()
    } else {
      // Reset state when dialog closes
      clearSelection()
      clearSearch()
    }
  }, [open, fetchStudents, clearSelection, clearSearch])

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
    
    // Add selected student IDs to form data
    const dataWithStudents = {
      ...formData,
      studentIds: selectedStudentIds,
    }
    
    await onSubmit(dataWithStudents, file || undefined)
    
    // Reset form
    setFormData({
      courseId: "",
      title: "",
      description: "",
      instructions: "",
      dueDate: "",
      maxGrade: 100,
      submissionType: "file",
      allowLateSubmission: false,
      studentIds: [],
    })
    setFile(null)
    clearSelection()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
          <p className="text-sm text-text-secondary">Fill in the details to create a new assignment for your students</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Assignment Title *</Label>
            <Input
              id="title"
              placeholder="e.g., React Hooks Implementation"
              value={formData.title}
              onChange={(e) => {
                if (e.target.value.length <= 100) {
                  setFormData({ ...formData, title: e.target.value })
                }
              }}
              required
            />
            <p className="text-xs text-text-secondary">{formData.title.length}/100 characters</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the assignment..."
              value={formData.description}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setFormData({ ...formData, description: e.target.value })
                }
              }}
              rows={3}
              className="resize-none max-h-24 overflow-y-auto"
              style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
              required
            />
            <p className="text-xs text-text-secondary">{formData.description.length}/500 characters</p>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Detailed Instructions</Label>
            <Textarea
              id="instructions"
              placeholder="Provide detailed instructions for students..."
              value={formData.instructions}
              onChange={(e) => {
                if (e.target.value.length <= 2000) {
                  setFormData({ ...formData, instructions: e.target.value })
                }
              }}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-text-secondary">{(formData.instructions || "").length}/2000 characters</p>
          </div>

          {/* Due Date and Points */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxGrade">Maximum Grade</Label>
              <Input
                id="maxGrade"
                type="number"
                min="0"
                max="1000"
                value={formData.maxGrade}
                onChange={(e) => setFormData({ ...formData, maxGrade: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Allow Late Submission */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="allowLateSubmission"
              checked={formData.allowLateSubmission}
              onCheckedChange={(checked) => setFormData({ ...formData, allowLateSubmission: checked as boolean })}
            />
            <Label htmlFor="allowLateSubmission" className="cursor-pointer">
              Allow late submissions
            </Label>
          </div>

          {/* Student Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Assign to Students *</Label>
              {filteredStudents.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleAllStudents}
                  className="h-8"
                >
                  {filteredStudents.length > 0 && filteredStudents.every(s => selectedStudentIds.includes(s._id)) ? "Deselect All" : "Select All"}
                </Button>
              )}
            </div>
            
            {loadingStudents ? (
              <div className="border border-border rounded-lg p-4 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
                <span className="text-sm text-text-secondary">Loading students...</span>
              </div>
            ) : students.length === 0 ? (
              <div className="border border-border rounded-lg p-4 text-center">
                <p className="text-sm text-text-secondary">No students available</p>
                <p className="text-xs text-text-secondary mt-1">Students must be assigned to you first</p>
              </div>
            ) : (
              <>
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <Input
                    type="text"
                    placeholder="Search students by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Selected Students Badges */}
                {selectedStudents.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg bg-bg-secondary">
                    <p className="text-xs text-text-secondary w-full mb-1">Selected:</p>
                    {selectedStudents.map((student) => (
                      <Badge key={student._id} variant="secondary" className="gap-1">
                        <span>{student.firstName} {student.lastName}</span>
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-destructive" 
                          onClick={() => removeStudent(student._id)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Students List */}
                <div className="border border-border rounded-lg max-h-48 overflow-y-auto">
                  {filteredStudents.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-sm text-text-secondary">No students match your search</p>
                      <p className="text-xs text-text-secondary mt-1">Try a different search term</p>
                    </div>
                  ) : (
                    filteredStudents.map((student) => (
                      <label
                        key={student._id}
                        htmlFor={`student-${student._id}`}
                        className="flex items-center space-x-3 p-3 hover:bg-bg-secondary cursor-pointer border-b border-border last:border-b-0"
                      >
                        <Checkbox
                          id={`student-${student._id}`}
                          checked={selectedStudentIds.includes(student._id)}
                          onCheckedChange={() => toggleStudent(student._id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-text-secondary truncate">{student.email}</p>
                        </div>
                      </label>
                    ))
                  )}
                </div>

                {/* Counter */}
                <p className="text-xs text-text-secondary">
                  {selectedStudentIds.length} selected • Showing {filteredStudents.length} of {students.length} students
                </p>
              </>
            )}
          </div>

          {/* File Attachment */}
          <div className="space-y-2">
            <Label>Attachment (Optional)</Label>
            {!file ? (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition cursor-pointer">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-text-secondary mx-auto mb-2" />
                  <p className="text-sm text-text-secondary">Click to upload assignment file</p>
                  <p className="text-xs text-text-secondary mt-1">PDF, DOC, PPT, TXT, ZIP (Max 10MB)</p>
                </label>
              </div>
            ) : (
              <div className="border border-border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || selectedStudentIds.length === 0 || !formData.title || !formData.description || !formData.dueDate}
            >
              {loading ? "Creating..." : "Create Assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
