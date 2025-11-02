// API Client Service - Handles all HTTP requests

interface RequestConfig {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  headers?: Record<string, string>
  body?: any
  params?: Record<string, any>
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api") {
    this.baseURL = baseURL
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("authToken")
    }
  }

  private getHeaders(): Record<string, string> {
    // Always check localStorage for the token on each request (in case it was set after initialization)
    if (typeof window !== "undefined" && !this.token) {
      this.token = localStorage.getItem("authToken")
    }
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }
    return headers
  }

  private buildURL(endpoint: string, params?: Record<string, any>): string {
    let url = `${this.baseURL}${endpoint}`
    if (params) {
      const query = new URLSearchParams(params).toString()
      url += `?${query}`
    }
    return url
  }

  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { method = "GET", headers = {}, body, params } = config

    const url = this.buildURL(endpoint, params)

    try {
      const response = await fetch(url, {
        method,
        headers: { ...this.getHeaders(), ...headers },
        body: body ? JSON.stringify(body) : undefined,
      })

      // Parse response body for error details
      const data = await response.json()

      if (!response.ok) {
        // Extract error message from backend response
        const errorMessage = data.message || data.error || `API Error: ${response.status}`
        
        // Handle 401 Unauthorized - but NOT during login attempts
        if (response.status === 401 && !endpoint.includes('/auth/login')) {
          this.clearToken()
          if (typeof window !== "undefined") {
            localStorage.removeItem("upanglearn_user")
            // Redirect to login page
            window.location.href = "/login"
          }
        }

        // Throw error with status and message for proper handling
        const error: any = new Error(errorMessage)
        error.status = response.status
        error.message = errorMessage
        throw error
      }

      return data
    } catch (error: any) {
      console.error("API Request Error:", error)
      // Re-throw with status and message intact
      throw error
    }
  }

  setToken(token: string): void {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token)
    }
  }

  clearToken(): void {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken")
    }
  }
}

export const apiClient = new ApiClient()
