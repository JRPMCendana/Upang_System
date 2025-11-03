"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Upload, X, FileText, Loader2, Search } from "lucide-react"
import type { Assignment } from "@/types/assignment.types"
import { userService } from "@/services/user-service"
import type { User } from "@/types/user.types"

interface EditAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignment: Assignment | null
  onSubmit: (id: string, data: Partial<Assignment>, file?: File) => Promise<void>
  loading?: boolean
}

export function EditAssignmentDialog({ 
  open, 
  onOpenChange, 
  assignment,
  onSubmit, 
  loading 
}: EditAssignmentDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    dueDate: "",
    totalPoints: 100,
  })
  const [file, setFile] = useState<File | null>(null)
  const [students, setStudents] = useState<User[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Populate form when assignment changes
  useEffect(() => {
    if (assignment && open) {
      // Format the date for datetime-local input
      const dueDate = new Date(assignment.dueDate)
      const formattedDate = new Date(dueDate.getTime() - dueDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)

      setFormData({
        title: assignment.title,
        description: assignment.description || "",
        instructions: assignment.instructions || "",
        dueDate: formattedDate,
        totalPoints: assignment.totalPoints || 100,
      })

      // Set selected students
      if (assignment.assignedTo) {
        const studentIds = Array.isArray(assignment.assignedTo)
          ? assignment.assignedTo.map((s: string | { _id: string }) => typeof s === 'string' ? s : s._id)
          : []
        setSelectedStudentIds(studentIds)
      }
    }
  }, [assignment, open])

  // Fetch students when dialog opens
  useEffect(() => {
    if (!open) {
      setStudents([])
      setSearchQuery("")
      return
    }

    const fetchStudents = async () => {
      setLoadingStudents(true)
      try {
        const response = await userService.getAssignedStudents(1, 100)
        setStudents(response.data)
      } catch (error) {
        console.error("Error fetching students:", error)
      } finally {
        setLoadingStudents(false)
      }
    }

    fetchStudents()
  }, [open])

  // Filter students based on search query
  const filteredStudents = students.filter(student => {
    if (!searchQuery.trim()) return true
    const searchLower = searchQuery.toLowerCase()
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase()
    const email = student.email.toLowerCase()
    return fullName.includes(searchLower) || email.includes(searchLower)
  })

  // Get selected students for badge display
  const selectedStudents = students.filter(s => selectedStudentIds.includes(s._id))

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const removeStudent = (studentId: string) => {
    setSelectedStudentIds(prev => prev.filter(id => id !== studentId))
  }

  const toggleAllStudents = () => {
    const filteredIds = filteredStudents.map(s => s._id)
    const allFilteredSelected = filteredIds.every(id => selectedStudentIds.includes(id))
    
    if (allFilteredSelected) {
      // Deselect all filtered students
      setSelectedStudentIds(prev => prev.filter(id => !filteredIds.includes(id)))
    } else {
      // Select all filtered students (merge with existing selections)
      setSelectedStudentIds(prev => [...new Set([...prev, ...filteredIds])])
    }
  }

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
    
    if (!assignment) return

    const updateData = {
      ...formData,
      studentIds: selectedStudentIds,
    }
    
    await onSubmit(assignment._id, updateData, file || undefined)
    
    // Reset file state
    setFile(null)
  }

  if (!assignment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Assignment</DialogTitle>
          <p className="text-sm text-text-secondary">Update assignment details and extend deadlines</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Assignment Title *</Label>
            <Input
              id="title"
              placeholder="e.g., React Hooks Implementation"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the assignment..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
            />
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Detailed Instructions</Label>
            <Textarea
              id="instructions"
              placeholder="Provide detailed instructions for students..."
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={4}
            />
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
              <p className="text-xs text-text-secondary">
                Current: {new Date(assignment.dueDate).toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalPoints">Total Points</Label>
              <Input
                id="totalPoints"
                type="number"
                min="0"
                value={formData.totalPoints}
                onChange={(e) => setFormData({ ...formData, totalPoints: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Student Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Assign to Students *</Label>
              {filteredStudents.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleAllStudents}
                  className="h-auto py-1 px-2 text-xs"
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
            <Label>Update Attachment (Optional)</Label>
            {assignment.document && !file && (
              <div className="border border-border rounded-lg p-3 mb-2 bg-bg-secondary">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <p className="text-sm text-text-secondary">
                    Current file: {assignment.documentName || "Attached"}
                  </p>
                </div>
              </div>
            )}
            
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
                  <p className="text-sm text-text-secondary">
                    {assignment.document ? "Click to replace file" : "Click to upload file"}
                  </p>
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
              {loading ? "Updating..." : "Update Assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
