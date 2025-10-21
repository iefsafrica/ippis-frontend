"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, Home } from "lucide-react"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Admin error caught:", error)
  }, [error])

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-6 text-center">
      <AlertCircle className="h-16 w-16 text-red-500 mb-6" />
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard Error</h1>
      <p className="text-gray-600 mb-4 max-w-md">
        We apologize for the inconvenience. An error occurred while loading the admin dashboard.
      </p>
      <p className="text-sm text-gray-500 mb-8 max-w-md">Error details: {error.message || "Unknown error"}</p>
      <div className="flex gap-4">
        <Button onClick={reset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")} className="gap-2">
          <Home className="h-4 w-4" />
          Return to home
        </Button>
      </div>
    </div>
  )
}
