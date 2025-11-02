// User Utility Functions

import { User } from "@/types/user.types"

/**
 * Get user's full name
 */
export function getUserFullName(user: User): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`
  }
  if (user.firstName) return user.firstName
  if (user.lastName) return user.lastName
  return user.username
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(user: User): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
  }
  if (user.firstName) return user.firstName[0].toUpperCase()
  if (user.lastName) return user.lastName[0].toUpperCase()
  return user.username.substring(0, 2).toUpperCase()
}

/**
 * Get user display name (firstName or username)
 */
export function getUserDisplayName(user: User): string {
  return user.firstName || user.username
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: User, role: User['role']): boolean {
  return user.role === role
}

/**
 * Check if user is active
 */
export function isUserActive(user: User): boolean {
  return user.status === "active" && user.isActive
}
