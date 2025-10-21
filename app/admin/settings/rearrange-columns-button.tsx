"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function RearrangeColumnsButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    error?: string
    details?: string
  } | null>(null)

  const handleRearrangeColumns = async () => {
    if (
      !confirm(
        "Are you sure you want to re-arrange the columns in the pending_employees table? This operation is safe but may take some time.",
      )
    ) {
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/rearrange-columns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: "An error occurred while re-arranging columns",
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Re-arrange Table Columns</h3>
          <p className="text-sm text-muted-foreground">
            Re-arrange columns in the pending_employees table to match the specified order.
          </p>
        </div>
        <Button onClick={handleRearrangeColumns} disabled={isLoading} variant="outline">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Re-arranging...
            </>
          ) : (
            "Re-arrange Columns"
          )}
        </Button>
      </div>

      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>
            {result.message}
            {result.details && (
              <div className="mt-2 text-xs">
                <pre className="whitespace-pre-wrap">{result.details}</pre>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
