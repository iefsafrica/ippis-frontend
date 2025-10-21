"use client"

import type React from "react"

import { ErrorBoundary } from "react-error-boundary"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-red-100">
      <div className="flex flex-col items-center text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Dashboard Error</h2>
        <p className="text-gray-600 mb-4 max-w-md">There was an error loading the dashboard content.</p>
        <p className="text-sm text-gray-500 mb-4 max-w-md bg-gray-50 p-2 rounded">{error.message || "Unknown error"}</p>
        <Button onClick={resetErrorBoundary} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    </div>
  )
}

export default function DashboardErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => console.error("Dashboard error caught:", error)}
      onReset={() => {
        // Reset any state here if needed
        console.log("Dashboard error boundary reset")
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
