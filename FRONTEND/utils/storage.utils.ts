// Storage Utility Functions

const STORAGE_KEYS = {
  USER: 'upanglearn_user',
  TOKEN: 'authToken',
} as const

/**
 * Save user data to local storage
 * @param user - User object to store
 */
export function saveUser(user: any): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  } catch (error) {
    console.error('Error saving user to storage:', error)
  }
}

/**
 * Get user data from local storage
 * @returns User object or null if not found
 */
export function getUser<T = any>(): T | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error('Error reading user from storage:', error)
    return null
  }
}

/**
 * Remove user data from local storage
 */
export function removeUser(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(STORAGE_KEYS.USER)
  } catch (error) {
    console.error('Error removing user from storage:', error)
  }
}

/**
 * Save auth token to local storage
 * @param token - JWT token string
 */
export function saveToken(token: string): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token)
  } catch (error) {
    console.error('Error saving token to storage:', error)
  }
}

/**
 * Get auth token from local storage
 * @returns Token string or null if not found
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  
  try {
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
  } catch (error) {
    console.error('Error reading token from storage:', error)
    return null
  }
}

/**
 * Remove auth token from local storage
 */
export function removeToken(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
  } catch (error) {
    console.error('Error removing token from storage:', error)
  }
}

/**
 * Clear all auth-related data from local storage
 */
export function clearAuthStorage(): void {
  removeUser()
  removeToken()
}

/**
 * Check if user is stored in local storage
 * @returns true if user data exists
 */
export function hasStoredUser(): boolean {
  return getUser() !== null
}

/**
 * Check if token is stored in local storage
 * @returns true if token exists
 */
export function hasStoredToken(): boolean {
  return getToken() !== null
}

/**
 * Get stored session info
 * @returns Object with user and token existence
 */
export function getStoredSession(): {
  hasUser: boolean
  hasToken: boolean
  user: any | null
  token: string | null
} {
  const user = getUser()
  const token = getToken()
  
  return {
    hasUser: user !== null,
    hasToken: token !== null,
    user,
    token,
  }
}
