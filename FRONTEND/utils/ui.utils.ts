// UI Utility Functions

/**
 * Get status color classes for badges and indicators
 * @param status - Status string (e.g., "open", "closed", "pending")
 * @returns Object with background, text, and label
 */
export function getStatusColor(status: string): {
  bg: string
  text: string
  label: string
} {
  const normalizedStatus = status.toLowerCase().trim()

  switch (normalizedStatus) {
    // Assignment/Quiz statuses
    case "open":
    case "active":
    case "available":
      return {
        bg: "bg-accent/10",
        text: "text-accent",
        label: "Open",
      }
    
    case "closed":
    case "completed":
    case "finished":
      return {
        bg: "bg-text-secondary/10",
        text: "text-text-secondary",
        label: "Closed",
      }
    
    case "pending":
    case "in_progress":
    case "in progress":
      return {
        bg: "bg-warning/10",
        text: "text-warning",
        label: "Pending",
      }
    
    case "submitted":
    case "done":
      return {
        bg: "bg-primary/10",
        text: "text-primary",
        label: "Submitted",
      }
    
    case "graded":
    case "reviewed":
      return {
        bg: "bg-foreground/10",
        text: "text-foreground",
        label: "Graded",
      }
    
    case "overdue":
    case "late":
      return {
        bg: "bg-destructive/10",
        text: "text-destructive",
        label: "Overdue",
      }
    
    case "draft":
      return {
        bg: "bg-text-tertiary/10",
        text: "text-text-tertiary",
        label: "Draft",
      }
    
    // User statuses
    case "online":
      return {
        bg: "bg-accent/10",
        text: "text-accent",
        label: "Online",
      }
    
    case "offline":
      return {
        bg: "bg-text-secondary/10",
        text: "text-text-secondary",
        label: "Offline",
      }
    
    case "away":
      return {
        bg: "bg-warning/10",
        text: "text-warning",
        label: "Away",
      }
    
    default:
      return {
        bg: "bg-text-secondary/10",
        text: "text-text-secondary",
        label: status.charAt(0).toUpperCase() + status.slice(1),
      }
  }
}

/**
 * Get badge variant based on status
 * @param status - Status string
 * @returns Badge variant string
 */
export function getBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  const normalizedStatus = status.toLowerCase().trim()

  switch (normalizedStatus) {
    case "open":
    case "active":
    case "available":
    case "online":
      return "default"
    
    case "closed":
    case "completed":
    case "offline":
      return "secondary"
    
    case "overdue":
    case "late":
    case "error":
    case "failed":
      return "destructive"
    
    default:
      return "outline"
  }
}

/**
 * Get color class for grade score
 * @param grade - Grade score (0-100)
 * @returns Tailwind color class
 */
export function getGradeColor(grade: number): string {
  if (grade >= 90) return "text-accent" // A (90-100)
  if (grade >= 80) return "text-primary" // B (80-89)
  if (grade >= 70) return "text-warning" // C (70-79)
  if (grade >= 60) return "text-destructive" // D (60-69)
  return "text-destructive" // F (0-59)
}

/**
 * Get background color class for grade score
 * @param grade - Grade score (0-100)
 * @returns Tailwind background color class
 */
export function getGradeBackgroundColor(grade: number): string {
  if (grade >= 90) return "bg-accent/10" // A (90-100)
  if (grade >= 80) return "bg-primary/10" // B (80-89)
  if (grade >= 70) return "bg-warning/10" // C (70-79)
  if (grade >= 60) return "bg-destructive/10" // D (60-69)
  return "bg-destructive/10" // F (0-59)
}

/**
 * Get color class for progress percentage
 * @param percentage - Progress percentage (0-100)
 * @returns Tailwind color class
 */
export function getProgressColor(percentage: number): string {
  if (percentage >= 80) return "text-accent"
  if (percentage >= 60) return "text-primary"
  if (percentage >= 40) return "text-warning"
  return "text-destructive"
}

/**
 * Get background color class for progress percentage
 * @param percentage - Progress percentage (0-100)
 * @returns Tailwind background color class
 */
export function getProgressBackgroundColor(percentage: number): string {
  if (percentage >= 80) return "bg-accent"
  if (percentage >= 60) return "bg-primary"
  if (percentage >= 40) return "bg-warning"
  return "bg-destructive"
}

/**
 * Get priority color for tasks/assignments
 * @param priority - Priority level ("low", "medium", "high")
 * @returns Object with color classes
 */
export function getPriorityColor(priority: string): {
  bg: string
  text: string
  border: string
} {
  const normalizedPriority = priority.toLowerCase().trim()

  switch (normalizedPriority) {
    case "high":
    case "urgent":
      return {
        bg: "bg-destructive/10",
        text: "text-destructive",
        border: "border-destructive",
      }
    
    case "medium":
    case "normal":
      return {
        bg: "bg-warning/10",
        text: "text-warning",
        border: "border-warning",
      }
    
    case "low":
      return {
        bg: "bg-accent/10",
        text: "text-accent",
        border: "border-accent",
      }
    
    default:
      return {
        bg: "bg-text-secondary/10",
        text: "text-text-secondary",
        border: "border-text-secondary",
      }
  }
}

/**
 * Get role badge color
 * @param role - User role ("student", "teacher", "admin")
 * @returns Object with color classes
 */
export function getRoleColor(role: string): {
  bg: string
  text: string
} {
  const normalizedRole = role.toLowerCase().trim()

  switch (normalizedRole) {
    case "admin":
    case "administrator":
      return {
        bg: "bg-destructive/10",
        text: "text-destructive",
      }
    
    case "teacher":
    case "instructor":
    case "professor":
      return {
        bg: "bg-primary/10",
        text: "text-primary",
      }
    
    case "student":
      return {
        bg: "bg-accent/10",
        text: "text-accent",
      }
    
    default:
      return {
        bg: "bg-text-secondary/10",
        text: "text-text-secondary",
      }
  }
}

/**
 * Truncate text to a specific length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

/**
 * Format file size to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

/**
 * Get file type icon name based on file extension
 * @param filename - File name with extension
 * @returns Icon name for lucide-react
 */
export function getFileTypeIcon(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase()
  
  switch (extension) {
    case "pdf":
      return "FileText"
    case "doc":
    case "docx":
      return "FileText"
    case "xls":
    case "xlsx":
      return "FileSpreadsheet"
    case "ppt":
    case "pptx":
      return "Presentation"
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
      return "Image"
    case "mp4":
    case "avi":
    case "mov":
      return "Video"
    case "mp3":
    case "wav":
      return "Music"
    case "zip":
    case "rar":
    case "7z":
      return "Archive"
    case "js":
    case "ts":
    case "jsx":
    case "tsx":
    case "py":
    case "java":
    case "cpp":
    case "c":
      return "Code"
    default:
      return "File"
  }
}

/**
 * Generate a random color for avatars or elements
 * @param seed - Seed string for consistent color generation
 * @returns Hex color code
 */
export function generateColorFromString(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const hue = hash % 360
  return `hsl(${hue}, 70%, 60%)`
}

/**
 * Get contrast text color (black or white) based on background
 * @param hexColor - Hex color code
 * @returns "black" or "white"
 */
export function getContrastColor(hexColor: string): "black" | "white" {
  // Remove # if present
  const hex = hexColor.replace("#", "")
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  return luminance > 0.5 ? "black" : "white"
}

/**
 * Format number with commas for thousands
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

/**
 * Format percentage with fixed decimal places
 * @param value - Numeric value
 * @param total - Total value for percentage calculation
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, total: number, decimals: number = 1): string {
  if (total === 0) return "0%"
  const percentage = (value / total) * 100
  return `${percentage.toFixed(decimals)}%`
}

/**
 * Capitalize first letter of each word
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export function capitalizeWords(text: string): string {
  return text.replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Convert snake_case to Title Case
 * @param text - Snake case text
 * @returns Title case text
 */
export function snakeToTitleCase(text: string): string {
  return text
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}
