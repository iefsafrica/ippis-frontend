"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: string | string[]
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  // For demo purposes, consider the user always authenticated
  const isDemoMode = true // Set to true for demo purposes
  const effectiveIsAuthenticated = isDemoMode || isAuthenticated

  useEffect(() => {
    // Skip authentication checks in demo mode
    if (isDemoMode) return

    if (!isLoading && !isAuthenticated) {
      router.push("/admin/login")
    }

    if (!isLoading && isAuthenticated && requiredRole) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
      if (user && !roles.includes(user.role)) {
        router.push("/admin/unauthorized")
      }
    }
  }, [isLoading, isAuthenticated, router, requiredRole, user, isDemoMode])

  if (isLoading && !isDemoMode) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  // In demo mode, always render children
  if (!effectiveIsAuthenticated && !isDemoMode) {
    return null
  }

  if (requiredRole && user && !isDemoMode) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!roles.includes(user.role)) {
      return null
    }
  }

  return <>{children}</>
}
