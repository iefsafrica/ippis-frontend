/**
 * API client for making requests to backend services
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api"

interface FetchOptions extends RequestInit {
  params?: Record<string, string>
}

/**
 * Formats URL with query parameters
 */
function formatUrl(endpoint: string, params?: Record<string, string>): string {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  const url = new URL(`${API_BASE_URL}${path}`, baseUrl)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  }

  return url.toString()
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint: string, options: FetchOptions = {}): Promise<any> {
  const { params, ...fetchOptions } = options
  const url = formatUrl(endpoint, params)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`API request failed for ${url}:`, error)
    throw error
  }
}

/**
 * API client methods
 */
export const api = {
  get: (endpoint: string, options: FetchOptions = {}) => fetchAPI(endpoint, { method: "GET", ...options }),

  post: (endpoint: string, data: any, options: FetchOptions = {}) =>
    fetchAPI(endpoint, { method: "POST", body: JSON.stringify(data), ...options }),

  put: (endpoint: string, data: any, options: FetchOptions = {}) =>
    fetchAPI(endpoint, { method: "PUT", body: JSON.stringify(data), ...options }),

  patch: (endpoint: string, data: any, options: FetchOptions = {}) =>
    fetchAPI(endpoint, { method: "PATCH", body: JSON.stringify(data), ...options }),

  delete: (endpoint: string, options: FetchOptions = {}) => fetchAPI(endpoint, { method: "DELETE", ...options }),
}
