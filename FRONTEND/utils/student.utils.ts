import type { User } from "@/types/user.types"

/**
 * Filter students by search query
 * Searches in: firstName, lastName, and email
 * @param students - Array of students to filter
 * @param query - Search query string
 * @returns Filtered array of students
 */
export const filterStudents = (students: User[], query: string): User[] => {
  if (!query.trim()) return students
  
  const searchLower = query.toLowerCase()
  
  return students.filter(student => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase()
    const email = student.email.toLowerCase()
    return fullName.includes(searchLower) || email.includes(searchLower)
  })
}

/**
 * Get student full name
 * @param student - Student object
 * @returns Full name of the student
 */
export const getStudentFullName = (student: User): string => {
  return `${student.firstName} ${student.lastName}`.trim()
}
