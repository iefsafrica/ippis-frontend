"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAuthToken, clearAuth, login as authLogin } from "@/lib/auth"
import { adminGetProfile, adminLogout } from "@/services/endpoints/auth/admin-auth"

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

      const token = getAuthToken()
      if (!token) {
        setUser(null)
        return
      }

      // Validate token with backend /api/admin/auth/me
      try {
        const profile = await adminGetProfile()
        if (profile?.data?.user) {
          const profileUser: User = {
            id: String(profile.data.user.id),
            name: profile.data.user.fullName || profile.data.user.username,
            email: profile.data.user.email,
            role: profile.data.roles?.[0]?.name || "admin",
            username: profile.data.user.username,
          }
          setUser(profileUser)
          setError(null)
          if (typeof window !== "undefined") {
            localStorage.setItem("ippis_user", JSON.stringify(profileUser))
          }
          return
        }
      } catch (apiErr: any) {
        // If 401, token is invalid or expired
        if (apiErr.response?.status === 401) {
          clearAuth()
          setUser(null)
          return
        }

        // For other temporary network issues, fall back to cached user if available
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem("ippis_user")
          if (cached) {
            try {
              setUser(JSON.parse(cached))
              return
            } catch {}
          }
        }
      }

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
      const res = await authLogin(username, password)

      if (res.success && res.token) {
        await checkAuth()
        return true
      }

      setError(res.message || "Login failed")
      return false
    } catch (err: any) {
      setError(err.message || "Login failed")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await adminLogout().catch(() => {})
    } finally {
      clearAuth()
      setUser(null)
      router.push("/admin/login")
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
