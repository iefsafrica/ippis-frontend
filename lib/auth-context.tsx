"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// Define the User type
export interface User {
  id: string
  name: string
  email: string
  role: string
  username?: string
}

// Define the AuthContextType
interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => false,
  logout: () => {},
  updateUser: () => {},
})

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext)

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Function to check if the user is authenticated
  const checkAuth = async () => {
    try {
      setLoading(true)

      // Check if we have a token in cookies
      const cookies = document.cookie.split(";")
      const tokenCookie = cookies.find((cookie) => cookie.trim().startsWith("ippis_token="))

      if (tokenCookie) {
        // We have a token, so we're authenticated
        // For demo purposes, set the mock user
        const mockUser: User = {
          id: "1",
          name: "Admin User",
          email: "admin@example.com",
          role: "admin",
        }

        setUser(mockUser)
        setError(null)
        return
      }

      // No token found, user is not authenticated
      setUser(null)
    } catch (err) {
      console.error("Auth check error:", err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Check authentication status on component mount
  useEffect(() => {
    checkAuth()
  }, [])

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)

      // For demo purposes, always succeed
      const mockUser: User = {
        id: "1",
        name: username || "Admin User",
        email: "admin@example.com",
        role: "admin",
      }

      setUser(mockUser)
      setError(null)

      // Set a mock token in a cookie
      document.cookie = `ippis_token=mock-token; path=/; max-age=${60 * 60 * 8}` // 8 hours

      return true
    } catch (err: any) {
      setError(err.message || "Login failed")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    try {
      // Clear the token cookie
      document.cookie = "ippis_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      setUser(null)
      router.push("/admin/login")
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

  // Update user data
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, updateUser }}>{children}</AuthContext.Provider>
  )
}
