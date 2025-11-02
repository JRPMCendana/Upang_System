// Token Utility Functions

/**
 * Check if a JWT token is expired
 * @param token - JWT token string
 * @returns true if token is expired or invalid
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    
    // If no expiration field, treat as valid (never expires)
    if (!payload.exp) return false
    
    const expirationTime = payload.exp * 1000
    return Date.now() >= expirationTime
  } catch (error) {
    console.error('Error checking token expiration:', error)
    return true
  }
}

/**
 * Decode JWT token payload without verification
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeToken(token: string): Record<string, any> | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

/**
 * Get token expiration date
 * @param token - JWT token string
 * @returns Expiration date or null if not available
 */
export function getTokenExpiration(token: string): Date | null {
  const payload = decodeToken(token)
  
  if (!payload || !payload.exp) return null
  
  return new Date(payload.exp * 1000)
}

/**
 * Get time remaining until token expires
 * @param token - JWT token string
 * @returns Time remaining in milliseconds, or 0 if expired/invalid
 */
export function getTokenTimeRemaining(token: string): number {
  const expiration = getTokenExpiration(token)
  
  if (!expiration) return 0
  
  const remaining = expiration.getTime() - Date.now()
  return remaining > 0 ? remaining : 0
}

/**
 * Check if token will expire soon
 * @param token - JWT token string
 * @param thresholdMinutes - Minutes before expiration to consider "expiring soon" (default: 5)
 * @returns true if token will expire within threshold
 */
export function isTokenExpiringSoon(token: string, thresholdMinutes: number = 5): boolean {
  const remaining = getTokenTimeRemaining(token)
  const thresholdMs = thresholdMinutes * 60 * 1000
  
  return remaining > 0 && remaining <= thresholdMs
}

/**
 * Validate token format (basic JWT structure check)
 * @param token - JWT token string
 * @returns true if token has valid JWT format
 */
export function isValidTokenFormat(token: string): boolean {
  if (!token || typeof token !== 'string') return false
  
  const parts = token.split('.')
  return parts.length === 3
}

/**
 * Extract user ID from token
 * @param token - JWT token string
 * @returns User ID or null if not found
 */
export function getUserIdFromToken(token: string): string | null {
  const payload = decodeToken(token)
  return payload?.userId || payload?.id || payload?.sub || null
}

/**
 * Extract user role from token
 * @param token - JWT token string
 * @returns User role or null if not found
 */
export function getUserRoleFromToken(token: string): string | null {
  const payload = decodeToken(token)
  return payload?.role || null
}
