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
import type { Quiz } from "@/types/quiz.types"
import { useStudentSelection } from "@/hooks/use-student-selection"
import { formatDateForInput } from "@/utils/date.utils"

interface EditQuizDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quiz: Quiz | null
  onSubmit: (id: string, data: Partial<Quiz>, file?: File) => Promise<void>
  loading?: boolean
}

export function EditQuizDialog({ open, onOpenChange, quiz, onSubmit, loading }: EditQuizDialogProps) {
  const [formData, setFormData] = useState<Partial<Quiz>>({
    title: "",
    description: "",
    quizLink: "",
    dueDate: "",
    totalPoints: 100,
    status: "active",
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
    setSelection,
    clearSelection,
    clearSearch,
    fetchStudents,
  } = useStudentSelection({ autoFetch: false })

  // Fetch students and pre-populate form when quiz or dialog opens
  useEffect(() => {
    if (open && quiz) {
      fetchStudents()
      setFormData({
        title: quiz.title,
        description: quiz.description,
        quizLink: quiz.quizLink || "",
        dueDate: quiz.dueDate ? formatDateForInput(quiz.dueDate) : "",
        totalPoints: quiz.totalPoints || 100,
        status: quiz.status,
      })
      
      // Pre-select assigned students
      const assignedStudentIds = quiz.assignedTo.map((student) => student._id)
      setSelection(assignedStudentIds)
    } else if (!open) {
      // Reset state when dialog closes
      clearSelection()
      clearSearch()
      }
  }, [open, quiz, fetchStudents, setSelection, clearSelection, clearSearch])

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
    if (!quiz) return
    
    // Include selected student IDs in update data
    const updateData = {
      ...formData,
      studentIds: selectedStudentIds,
    }
    
    await onSubmit(quiz._id, updateData as Partial<Quiz>, file || undefined)
    
    // Reset form
    setFile(null)
    clearSelection()
    clearSearch()
  }

  if (!quiz) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Edit Quiz</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title || ""}
              onChange={(e) => {
                if (e.target.value.length <= 100) {
                  setFormData({ ...formData, title: e.target.value })
                }
              }}
              placeholder="Enter quiz title"
              required
            />
            <p className="text-xs text-text-secondary">{(formData.title || "").length}/100 characters</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setFormData({ ...formData, description: e.target.value })
                }
              }}
              placeholder="Enter quiz description"
              rows={3}
              className="resize-none max-h-24 overflow-y-auto"
              style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
              required
            />
            <p className="text-xs text-text-secondary">{(formData.description || "").length}/500 characters</p>
          </div>

          {/* Quiz Link (Google Forms) */}
          <div className="space-y-2">
            <Label htmlFor="quizLink">Quiz Link (Google Forms URL)</Label>
            <Input
              id="quizLink"
              type="url"
              value={formData.quizLink || ""}
              onChange={(e) => setFormData({ ...formData, quizLink: e.target.value })}
              placeholder="https://forms.google.com/..."
            />
            <p className="text-xs text-muted-foreground">
              Optional: Add a Google Forms link for students to take the quiz
            </p>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={formData.dueDate || ""}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              min={new Date().toISOString().slice(0, 16)}
              required
            />
          </div>

          {/* Total Points */}
          <div className="space-y-2">
            <Label htmlFor="totalPoints">Total Points *</Label>
            <Input
              id="totalPoints"
              type="number"
              min="1"
              max="150"
              value={formData.totalPoints || 100}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                setFormData({ ...formData, totalPoints: Math.min(Math.max(value, 1), 150) });
              }}
              placeholder="100"
              required
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "active" | "inactive") =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Update Document (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("file")?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {file ? file.name : quiz.document ? "Replace File" : "Choose File"}
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
            {file && (
              <div className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                <FileText className="h-4 w-4" />
                <span className="text-sm">{file.name}</span>
              </div>
            )}
            {quiz.document && !file && (
              <div className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                <FileText className="h-4 w-4" />
                <span className="text-sm">{quiz.documentName || "Current document"}</span>
              </div>
            )}
          </div>

          {/* Student Selection */}
          <div className="space-y-2">
            <Label>Assign to Students *</Label>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search students by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-7 w-7"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Selected Students (Badges) */}
            {selectedStudents.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-secondary/50 rounded-md max-h-[120px] overflow-y-auto">
                {selectedStudents.map((student) => (
                  <Badge
                    key={student._id}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    <span className="text-xs">
                      {student.firstName} {student.lastName}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeStudent(student._id)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Student List */}
            <div className="border rounded-md p-3 space-y-2 max-h-[200px] overflow-y-auto">
              {loadingStudents ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredStudents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {searchQuery ? "No students found matching your search" : "No students available"}
                </p>
              ) : (
                <>
                  {/* Select All Checkbox */}
                  <div className="flex items-center space-x-2 pb-2 border-b">
                    <Checkbox
                      id="select-all"
                      checked={
                        filteredStudents.length > 0 &&
                        filteredStudents.every((student) =>
                          selectedStudentIds.includes(student._id)
                        )
                      }
                      onCheckedChange={toggleAllStudents}
                    />
                    <Label
                      htmlFor="select-all"
                      className="text-sm font-medium cursor-pointer"
                    >
                      {searchQuery
                        ? `Select All (${filteredStudents.length} filtered)`
                        : `Select All (${students.length})`}
                    </Label>
                  </div>

                  {/* Student Checkboxes */}
                  {filteredStudents.map((student) => (
                    <div key={student._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={student._id}
                        checked={selectedStudentIds.includes(student._id)}
                        onCheckedChange={() => toggleStudent(student._id)}
                      />
                      <Label
                        htmlFor={student._id}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {student.firstName} {student.lastName} ({student.email})
                      </Label>
                    </div>
                  ))}
                </>
              )}
            </div>
            {selectedStudentIds.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {selectedStudentIds.length} student{selectedStudentIds.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          {/* Footer */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || selectedStudentIds.length === 0}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Quiz
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
