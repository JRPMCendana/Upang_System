// Date Utility Functions

/**
 * Format a date string to a readable format
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string (e.g., "Jan 15, 2025")
 */
export function formatDate(dateString: string | Date): string {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid Date"
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Invalid Date"
  }
}

/**
 * Format a date string to include time
 * @param dateString - ISO date string or Date object
 * @returns Formatted date-time string (e.g., "Jan 15, 2025, 3:30 PM")
 */
export function formatDateTime(dateString: string | Date): string {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid Date"
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  } catch (error) {
    console.error("Error formatting date-time:", error)
    return "Invalid Date"
  }
}

/**
 * Format a date string to a relative time format
 * @param dateString - ISO date string or Date object
 * @returns Relative time string (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(dateString: string | Date): string {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid Date"
    
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInSeconds = Math.floor(diffInMs / 1000)
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)
    const diffInWeeks = Math.floor(diffInDays / 7)
    const diffInMonths = Math.floor(diffInDays / 30)
    const diffInYears = Math.floor(diffInDays / 365)

    // Future dates
    if (diffInMs < 0) {
      const absDiffInSeconds = Math.abs(diffInSeconds)
      const absDiffInMinutes = Math.abs(diffInMinutes)
      const absDiffInHours = Math.abs(diffInHours)
      const absDiffInDays = Math.abs(diffInDays)
      const absDiffInWeeks = Math.abs(diffInWeeks)
      const absDiffInMonths = Math.abs(diffInMonths)
      const absDiffInYears = Math.abs(diffInYears)

      if (absDiffInYears > 0) return `in ${absDiffInYears} year${absDiffInYears > 1 ? "s" : ""}`
      if (absDiffInMonths > 0) return `in ${absDiffInMonths} month${absDiffInMonths > 1 ? "s" : ""}`
      if (absDiffInWeeks > 0) return `in ${absDiffInWeeks} week${absDiffInWeeks > 1 ? "s" : ""}`
      if (absDiffInDays > 0) return `in ${absDiffInDays} day${absDiffInDays > 1 ? "s" : ""}`
      if (absDiffInHours > 0) return `in ${absDiffInHours} hour${absDiffInHours > 1 ? "s" : ""}`
      if (absDiffInMinutes > 0) return `in ${absDiffInMinutes} minute${absDiffInMinutes > 1 ? "s" : ""}`
      return "in a few seconds"
    }

    // Past dates
    if (diffInYears > 0) return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`
    if (diffInMonths > 0) return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`
    if (diffInWeeks > 0) return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`
    if (diffInDays > 0) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
    if (diffInHours > 0) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
    if (diffInMinutes > 0) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
    return "just now"
  } catch (error) {
    console.error("Error formatting relative time:", error)
    return "Invalid Date"
  }
}

/**
 * Check if a date is in the past
 * @param dateString - ISO date string or Date object
 * @returns True if the date is in the past
 */
export function isDatePast(dateString: string | Date): boolean {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return false
    
    return date.getTime() < new Date().getTime()
  } catch (error) {
    console.error("Error checking if date is past:", error)
    return false
  }
}

/**
 * Check if a date is in the future
 * @param dateString - ISO date string or Date object
 * @returns True if the date is in the future
 */
export function isDateFuture(dateString: string | Date): boolean {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return false
    
    return date.getTime() > new Date().getTime()
  } catch (error) {
    console.error("Error checking if date is future:", error)
    return false
  }
}

/**
 * Get the difference in days between two dates
 * @param date1 - First date (ISO string or Date object)
 * @param date2 - Second date (ISO string or Date object)
 * @returns Number of days difference (positive if date1 is after date2)
 */
export function getDaysDifference(date1: string | Date, date2: string | Date): number {
  try {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0
    
    const diffInMs = d1.getTime() - d2.getTime()
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  } catch (error) {
    console.error("Error calculating days difference:", error)
    return 0
  }
}

/**
 * Get the difference in hours between two dates
 * @param date1 - First date (ISO string or Date object)
 * @param date2 - Second date (ISO string or Date object)
 * @returns Number of hours difference (positive if date1 is after date2)
 */
export function getHoursDifference(date1: string | Date, date2: string | Date): number {
  try {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0
    
    const diffInMs = d1.getTime() - d2.getTime()
    return Math.floor(diffInMs / (1000 * 60 * 60))
  } catch (error) {
    console.error("Error calculating hours difference:", error)
    return 0
  }
}

/**
 * Format date for input fields (YYYY-MM-DD)
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string for input fields
 */
export function formatDateForInput(dateString: string | Date): string {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ""
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    
    return `${year}-${month}-${day}`
  } catch (error) {
    console.error("Error formatting date for input:", error)
    return ""
  }
}

/**
 * Format date for datetime-local input fields (YYYY-MM-DDTHH:MM)
 * @param dateString - ISO date string or Date object
 * @returns Formatted datetime string for input fields
 */
export function formatDateTimeForInput(dateString: string | Date): string {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ""
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    
    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch (error) {
    console.error("Error formatting datetime for input:", error)
    return ""
  }
}

/**
 * Check if a date is today
 * @param dateString - ISO date string or Date object
 * @returns True if the date is today
 */
export function isToday(dateString: string | Date): boolean {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return false
    
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  } catch (error) {
    console.error("Error checking if date is today:", error)
    return false
  }
}

/**
 * Check if a date is this week
 * @param dateString - ISO date string or Date object
 * @returns True if the date is within this week
 */
export function isThisWeek(dateString: string | Date): boolean {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return false
    
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)
    
    return date >= startOfWeek && date < endOfWeek
  } catch (error) {
    console.error("Error checking if date is this week:", error)
    return false
  }
}

/**
 * Get a human-readable deadline status
 * @param dueDate - Due date (ISO string or Date object)
 * @returns Status object with label and urgency level
 */
export function getDeadlineStatus(dueDate: string | Date): {
  label: string
  urgency: "overdue" | "urgent" | "soon" | "normal"
  daysRemaining: number
} {
  try {
    const due = new Date(dueDate)
    if (isNaN(due.getTime())) {
      return { label: "Invalid Date", urgency: "normal", daysRemaining: 0 }
    }
    
    const now = new Date()
    const daysRemaining = getDaysDifference(due, now)
    
    if (daysRemaining < 0) {
      return {
        label: `Overdue by ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? "s" : ""}`,
        urgency: "overdue",
        daysRemaining,
      }
    }
    
    if (daysRemaining === 0) {
      return { label: "Due today", urgency: "urgent", daysRemaining }
    }
    
    if (daysRemaining === 1) {
      return { label: "Due tomorrow", urgency: "urgent", daysRemaining }
    }
    
    if (daysRemaining <= 3) {
      return { label: `Due in ${daysRemaining} days`, urgency: "urgent", daysRemaining }
    }
    
    if (daysRemaining <= 7) {
      return { label: `Due in ${daysRemaining} days`, urgency: "soon", daysRemaining }
    }
    
    return { label: `Due in ${daysRemaining} days`, urgency: "normal", daysRemaining }
  } catch (error) {
    console.error("Error getting deadline status:", error)
    return { label: "Invalid Date", urgency: "normal", daysRemaining: 0 }
  }
}
