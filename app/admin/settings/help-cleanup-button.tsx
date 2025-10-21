"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cleanupHelpTables } from "@/app/actions/admin-actions"

export function HelpCleanupButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    message?: string
    error?: string
  }>({})

  const handleCleanup = async () => {
    if (!confirm("Are you sure you want to remove all help-related database tables? This action cannot be undone.")) {
      return
    }

    setIsLoading(true)
    setResult({})

    try {
      const response = await cleanupHelpTables()

      if (response.success) {
        setResult({
          success: true,
          message: response.message,
        })
      } else {
        setResult({
          success: false,
          error: response.error || "Failed to remove help database tables",
        })
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button variant="destructive" onClick={handleCleanup} disabled={isLoading} className="flex items-center gap-2">
        <Trash2 className="h-4 w-4" />
        {isLoading ? "Removing Help Tables..." : "Remove Help Database Tables"}
      </Button>

      {result.success && (
        <Alert variant="success" className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">{result.message}</AlertDescription>
        </Alert>
      )}

      {result.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
