"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getAuthToken, clearAuth, login as authLogin } from "@/lib/auth"
import { adminGetProfile, adminLogout } from "@/services/endpoints/auth/admin-auth"

// Define the User type
export interface User {
  id: string
  name: string
  email: string
  role: string
  role_key?: string
  username?: string
  modules?: string[]
  accessible_modules?: string[]
  permissions?: string[]
  roles?: Array<{ id: number; key?: string; name: string }>
}

// Define the AuthContextType
interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  canAccessModule: (moduleIdentifier: string) => boolean
  hasPermission: (permKey: string) => boolean
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => false,
  logout: () => {},
  updateUser: () => {},
  canAccessModule: () => false,
  hasPermission: () => false,
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
          const rawUser: any = profile.data.user
          const primaryRole =
            rawUser.role ||
            profile.data.roles?.[0]?.name ||
            "Administrator"
          const primaryRoleKey =
            rawUser.role_key ||
            profile.data.roles?.[0]?.key ||
            "admin"

          const modules =
            profile.data.modules ||
            rawUser.accessible_modules ||
            []

          const permissions = (profile.data.permissions || []).map((p: any) => p.key)

          const profileUser: User = {
            id: String(rawUser.id),
            name: rawUser.fullName || rawUser.full_name || rawUser.username,
            email: rawUser.email,
            role: primaryRole,
            role_key: primaryRoleKey,
            username: rawUser.username,
            modules,
            accessible_modules: modules,
            permissions,
            roles: profile.data.roles || [],
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

  // Check if current user has access to a specific module
  const canAccessModule = useCallback(
    (moduleIdentifier: string): boolean => {
      if (!user) return false

      const roleLower = (user.role || "").toLowerCase()
      const roleKeyLower = (user.role_key || "").toLowerCase()
      const isSuper =
        roleLower.includes("super") ||
        roleKeyLower.includes("super")

      if (isSuper) return true

      if (!moduleIdentifier || moduleIdentifier === "/admin" || moduleIdentifier.toLowerCase() === "dashboard") {
        return true
      }

      const target = moduleIdentifier.toLowerCase().trim()
      const allowed = (user.accessible_modules || user.modules || []).map((m) => m.toLowerCase().trim())

      if (allowed.includes(target)) return true

      // Aliases
      if (
        (target === "employee-list" || target === "employees" || target === "employee" || target.includes("employee")) &&
        (allowed.includes("employees") || allowed.includes("employees list") || allowed.includes("employee-list") || allowed.includes("/admin/employees"))
      ) {
        return true
      }

      if (
        (target === "core-hr" || target === "corehr" || target === "hr") &&
        (allowed.includes("core hr") || allowed.includes("core-hr") || allowed.includes("corehr") || allowed.includes("/admin/core-hr"))
      ) {
        return true
      }

      if (
        (target === "hr-reports" || target === "reports" || target === "hr reports") &&
        (allowed.includes("hr reports") || allowed.includes("reports") || allowed.includes("hr-reports") || allowed.includes("/admin/hr-reports"))
      ) {
        return true
      }

      if (
        target === "payroll" &&
        (allowed.includes("payroll") || allowed.includes("/admin/payroll"))
      ) {
        return true
      }

      if (
        target === "finance" &&
        (allowed.includes("finance") || allowed.includes("/admin/finance"))
      ) {
        return true
      }

      if (
        (target === "event-meetings" || target === "events" || target === "meetings" || target === "events & meetings") &&
        (allowed.includes("events & meetings") || allowed.includes("event-meetings") || allowed.includes("events") || allowed.includes("/admin/events-meetings"))
      ) {
        return true
      }

      if (
        (target === "hr-calendar" || target === "calendar") &&
        (allowed.includes("hr calendar") || allowed.includes("hr-calendar") || allowed.includes("calendar") || allowed.includes("/admin/hr-calendar"))
      ) {
        return true
      }

      if (
        target === "timesheets" &&
        (allowed.includes("timesheets") || allowed.includes("/admin/timesheets"))
      ) {
        return true
      }

      if (
        target === "performance" &&
        (allowed.includes("performance") || allowed.includes("/admin/performance"))
      ) {
        return true
      }

      if (
        target === "organization" &&
        (allowed.includes("organization") || allowed.includes("/admin/organization"))
      ) {
        return true
      }

      if (
        target === "recruitment" &&
        (allowed.includes("recruitment") || allowed.includes("/admin/recruitment"))
      ) {
        return true
      }

      if (
        target === "training" &&
        (allowed.includes("training") || allowed.includes("/admin/training"))
      ) {
        return true
      }

      if (
        target === "assets" &&
        (allowed.includes("assets") || allowed.includes("/admin/assets"))
      ) {
        return true
      }

      if (
        (target === "file-manager" || target === "files" || target === "file manager") &&
        (allowed.includes("file manager") || allowed.includes("file-manager") || allowed.includes("files") || allowed.includes("/admin/file-manager"))
      ) {
        return true
      }

      if (
        (target === "project-managment" || target === "project-management" || target === "projects" || target === "project management") &&
        (allowed.includes("project management") || allowed.includes("project-managment") || allowed.includes("project-management") || allowed.includes("projects") || allowed.includes("/admin/project-management"))
      ) {
        return true
      }

      if (
        (target === "support-tickets" || target === "support" || target === "tickets" || target === "support tickets") &&
        (allowed.includes("support tickets") || allowed.includes("support-tickets") || allowed.includes("support") || allowed.includes("tickets") || allowed.includes("/admin/support-tickets"))
      ) {
        return true
      }

      if (
        (target === "users" || target === "user management" || target === "/admin/users") &&
        (allowed.includes("user management") || allowed.includes("users") || allowed.includes("/admin/users"))
      ) {
        return true
      }

      if (
        (target === "roles" || target === "/admin/roles") &&
        (allowed.includes("roles") || allowed.includes("/admin/roles"))
      ) {
        return true
      }

      if (
        (target === "permissions" || target === "/admin/permissions") &&
        (allowed.includes("permissions") || allowed.includes("/admin/permissions"))
      ) {
        return true
      }

      if (
        (target === "settings" || target === "/admin/settings") &&
        (allowed.includes("settings") || allowed.includes("/admin/settings"))
      ) {
        return true
      }

      if (
        (target === "backup" || target === "backup database" || target === "/admin/backup") &&
        (allowed.includes("backup database") || allowed.includes("backup") || allowed.includes("/admin/backup"))
      ) {
        return true
      }

      return false
    },
    [user]
  )

  // Check if current user has a specific permission
  const hasPermission = useCallback(
    (permKey: string): boolean => {
      if (!user) return false
      const roleLower = (user.role || "").toLowerCase()
      if (roleLower.includes("super")) return true

      const pLower = permKey.toLowerCase()
      const perms = (user.permissions || []).map((p) => p.toLowerCase())
      return perms.includes(pLower) || perms.includes("*")
    },
    [user]
  )

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
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        updateUser,
        canAccessModule,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
