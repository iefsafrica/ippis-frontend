"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: string | string[]
  requiredModule?: string
}

export function ProtectedRoute({ children, requiredRole, requiredModule }: ProtectedRouteProps) {
  const { user, loading, canAccessModule } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push("/admin/login")
      return
    }

    const isSuper =
      user.role?.toLowerCase().includes("super") ||
      user.role_key?.toLowerCase().includes("super")

    if (isSuper) return

    if (requiredRole) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
      const hasRole = roles.some((r) =>
        user.role?.toLowerCase().includes(r.toLowerCase()) ||
        user.role_key?.toLowerCase() === r.toLowerCase()
      )
      if (!hasRole) {
        router.push("/admin")
        return
      }
    }

    if (requiredModule && !canAccessModule(requiredModule)) {
      router.push("/admin")
    }
  }, [loading, user, router, requiredRole, requiredModule, canAccessModule])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isSuper =
    user.role?.toLowerCase().includes("super") ||
    user.role_key?.toLowerCase().includes("super")

  if (isSuper) {
    return <>{children}</>
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    const hasRole = roles.some((r) =>
      user.role?.toLowerCase().includes(r.toLowerCase()) ||
      user.role_key?.toLowerCase() === r.toLowerCase()
    )
    if (!hasRole) {
      return null
    }
  }

  if (requiredModule && !canAccessModule(requiredModule)) {
    return null
  }

  return <>{children}</>
}
