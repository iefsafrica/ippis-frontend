"use client"

import type React from "react"

import { Suspense } from "react"
import DashboardContent from "./dashboard-content"
import AdminLoading from "./loading"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// Create a proper error boundary component
function ErrorBoundaryComponent({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.log("Admin error caught:", event.error)
      setHasError(true)
    }

    window.addEventListener("error", handleError)
    return () => window.removeEventListener("error", handleError)
  }, [])

  if (hasError) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-center">
        <h3 className="text-lg font-bold text-red-700 mb-2">Dashboard Error</h3>
        <p className="text-red-600 mb-4">There was an error loading the dashboard. Please try refreshing the page.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    )
  }

  return <>{children}</>
}

export default function AdminDashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin/login")
    }
  }, [user, loading, router])

  if (loading) {
    return <AdminLoading />
  }

  if (!user) {
    return null // Will redirect in the useEffect
  }

  return (
    <ErrorBoundaryComponent>
      <Suspense fallback={<AdminLoading />}>
        <DashboardContent />
      </Suspense>
    </ErrorBoundaryComponent>
  )
}
