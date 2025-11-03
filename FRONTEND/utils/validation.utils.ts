// Validation Utility Functions

/**
 * Validate email address format
 * @param email - Email address to validate
 * @returns true if valid email format
 */
export function validateEmail(email: string): boolean {
  if (!email || email.trim() === "") return false
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Validate email and return error message if invalid
 * @param email - Email address to validate
 * @returns Error message or null if valid
 */
export function getEmailError(email: string): string | null {
  if (!email || email.trim() === "") {
    return "Email is required"
  }
  
  if (!validateEmail(email)) {
    return "Please enter a valid email address"
  }
  
  return null
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with validation result and errors
 */
export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
  strength: "weak" | "medium" | "strong"
} {
  const errors: string[] = []
  
  if (!password || password.trim() === "") {
    return { valid: false, errors: ["Password is required"], strength: "weak" }
  }
  
  // Minimum length
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }
  
  // Contains uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }
  
  // Contains lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }
  
  // Contains number
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number")
  }
  
  // Contains special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }
  
  // Determine strength
  let strength: "weak" | "medium" | "strong" = "weak"
  if (errors.length === 0) {
    strength = password.length >= 12 ? "strong" : "medium"
  } else if (errors.length <= 2) {
    strength = "medium"
  }
  
  return {
    valid: errors.length === 0,
    errors,
    strength,
  }
}

/**
 * Validate password match
 * @param password - Password
 * @param confirmPassword - Confirmation password
 * @returns Error message or null if valid
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): string | null {
  if (!confirmPassword || confirmPassword.trim() === "") {
    return "Please confirm your password"
  }
  
  if (password !== confirmPassword) {
    return "Passwords do not match"
  }
  
  return null
}

/**
 * Validate phone number format
 * @param phone - Phone number to validate
 * @param countryCode - Country code (default: "US")
 * @returns true if valid phone format
 */
export function validatePhoneNumber(phone: string, countryCode: "US" | "PH" = "PH"): boolean {
  if (!phone || phone.trim() === "") return false
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "")
  
  if (countryCode === "US") {
    // US phone: 10 digits
    return cleaned.length === 10 || cleaned.length === 11
  }
  
  if (countryCode === "PH") {
    // Philippine phone: 10 digits (including area code) or 11 with leading 0
    return cleaned.length === 10 || cleaned.length === 11
  }
  
  return false
}

/**
 * Validate phone number and return error message if invalid
 * @param phone - Phone number to validate
 * @returns Error message or null if valid
 */
export function getPhoneError(phone: string): string | null {
  if (!phone || phone.trim() === "") {
    return "Phone number is required"
  }
  
  if (!validatePhoneNumber(phone)) {
    return "Please enter a valid phone number"
  }
  
  return null
}

/**
 * Validate required field
 * @param value - Value to validate
 * @param fieldName - Name of the field for error message
 * @returns Error message or null if valid
 */
export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim() === "") {
    return `${fieldName} is required`
  }
  return null
}

/**
 * Validate minimum length
 * @param value - Value to validate
 * @param minLength - Minimum required length
 * @param fieldName - Name of the field for error message
 * @returns Error message or null if valid
 */
export function validateMinLength(
  value: string,
  minLength: number,
  fieldName: string
): string | null {
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long`
  }
  return null
}

/**
 * Validate maximum length
 * @param value - Value to validate
 * @param maxLength - Maximum allowed length
 * @param fieldName - Name of the field for error message
 * @returns Error message or null if valid
 */
export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName: string
): string | null {
  if (value.length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters long`
  }
  return null
}

/**
 * Validate numeric value
 * @param value - Value to validate
 * @param fieldName - Name of the field for error message
 * @returns Error message or null if valid
 */
export function validateNumeric(value: string, fieldName: string): string | null {
  if (!/^\d+$/.test(value)) {
    return `${fieldName} must be a number`
  }
  return null
}

/**
 * Validate numeric range
 * @param value - Numeric value to validate
 * @param min - Minimum value
 * @param max - Maximum value
 * @param fieldName - Name of the field for error message
 * @returns Error message or null if valid
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): string | null {
  if (value < min || value > max) {
    return `${fieldName} must be between ${min} and ${max}`
  }
  return null
}

/**
 * Validate grade score (0-100)
 * @param grade - Grade to validate
 * @returns Error message or null if valid
 */
export function validateGrade(grade: number | string): string | null {
  const numericGrade = typeof grade === "string" ? parseFloat(grade) : grade
  
  if (isNaN(numericGrade)) {
    return "Grade must be a valid number"
  }
  
  if (numericGrade < 0 || numericGrade > 100) {
    return "Grade must be between 0 and 100"
  }
  
  return null
}

/**
 * Validate URL format
 * @param url - URL to validate
 * @returns true if valid URL format
 */
export function validateURL(url: string): boolean {
  if (!url || url.trim() === "") return false
  
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate URL and return error message if invalid
 * @param url - URL to validate
 * @param fieldName - Name of the field for error message
 * @returns Error message or null if valid
 */
export function getURLError(url: string, fieldName: string = "URL"): string | null {
  if (!url || url.trim() === "") {
    return `${fieldName} is required`
  }
  
  if (!validateURL(url)) {
    return `Please enter a valid ${fieldName}`
  }
  
  return null
}

/**
 * Validate username format
 * @param username - Username to validate
 * @returns Object with validation result and error
 */
export function validateUsername(username: string): {
  valid: boolean
  error: string | null
} {
  if (!username || username.trim() === "") {
    return { valid: false, error: "Username is required" }
  }
  
  if (username.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters long" }
  }
  
  if (username.length > 20) {
    return { valid: false, error: "Username must be no more than 20 characters long" }
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      valid: false,
      error: "Username can only contain letters, numbers, and underscores",
    }
  }
  
  return { valid: true, error: null }
}

/**
 * Validate file size
 * @param file - File object
 * @param maxSizeMB - Maximum size in megabytes
 * @returns Error message or null if valid
 */
export function validateFileSize(file: File, maxSizeMB: number): string | null {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  
  if (file.size > maxSizeBytes) {
    return `File size must be less than ${maxSizeMB}MB`
  }
  
  return null
}

/**
 * Validate file type
 * @param file - File object
 * @param allowedTypes - Array of allowed MIME types or extensions
 * @returns Error message or null if valid
 */
export function validateFileType(file: File, allowedTypes: string[]): string | null {
  const fileExtension = file.name.split(".").pop()?.toLowerCase()
  const fileMimeType = file.type.toLowerCase()
  
  const isValidType = allowedTypes.some((type) => {
    // Check if type is MIME type or extension
    if (type.includes("/")) {
      return fileMimeType === type.toLowerCase()
    } else {
      return fileExtension === type.toLowerCase().replace(".", "")
    }
  })
  
  if (!isValidType) {
    return `File type must be one of: ${allowedTypes.join(", ")}`
  }
  
  return null
}

/**
 * Validate date format (YYYY-MM-DD)
 * @param dateString - Date string to validate
 * @returns true if valid date format
 */
export function validateDateFormat(dateString: string): boolean {
  if (!dateString) return false
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateString)) return false
  
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

/**
 * Validate date is not in the past
 * @param dateString - Date string to validate
 * @param fieldName - Name of the field for error message
 * @returns Error message or null if valid
 */
export function validateFutureDate(dateString: string, fieldName: string): string | null {
  if (!dateString || dateString.trim() === "") {
    return `${fieldName} is required`
  }
  
  const date = new Date(dateString)
  const now = new Date()
  now.setHours(0, 0, 0, 0) // Reset time to start of day
  
  if (date < now) {
    return `${fieldName} must be in the future`
  }
  
  return null
}

/**
 * Validate date is not in the future
 * @param dateString - Date string to validate
 * @param fieldName - Name of the field for error message
 * @returns Error message or null if valid
 */
export function validatePastDate(dateString: string, fieldName: string): string | null {
  if (!dateString || dateString.trim() === "") {
    return `${fieldName} is required`
  }
  
  const date = new Date(dateString)
  const now = new Date()
  
  if (date > now) {
    return `${fieldName} cannot be in the future`
  }
  
  return null
}

/**
 * Validate form with multiple fields
 * @param fields - Object with field names and values
 * @param rules - Object with field names and validation rules
 * @returns Object with errors for each field
 */
export function validateForm<T extends Record<string, any>>(
  fields: T,
  rules: Record<keyof T, Array<(value: any) => string | null>>
): Record<keyof T, string | null> {
  const errors = {} as Record<keyof T, string | null>
  
  for (const fieldName in rules) {
    const fieldRules = rules[fieldName]
    const fieldValue = fields[fieldName]
    
    for (const rule of fieldRules) {
      const error = rule(fieldValue)
      if (error) {
        errors[fieldName] = error
        break // Stop at first error for this field
      }
    }
    
    if (!errors[fieldName]) {
      errors[fieldName] = null
    }
  }
  
  return errors
}

/**
 * Check if form has any errors
 * @param errors - Errors object from validateForm
 * @returns true if form has errors
 */
export function hasFormErrors<T extends Record<string, any>>(
  errors: Record<keyof T, string | null>
): boolean {
  return Object.values(errors).some((error) => error !== null)
}
