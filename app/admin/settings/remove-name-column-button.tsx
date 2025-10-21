"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, Check, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function RemoveNameColumnButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    status?: string
    error?: string
  } | null>(null)
  const { toast } = useToast()

  const handleMigration = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/migrate-remove-name-column", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          status: data.status,
        })

        toast({
          title: "Success",
          description: data.message,
        })
      } else {
        setResult({
          success: false,
          message: "Migration failed",
          error: data.error || "Unknown error",
        })

        toast({
          title: "Error",
          description: data.error || "Failed to run migration",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error running migration:", error)
      setResult({
        success: false,
        message: "Migration failed",
        error: error instanceof Error ? error.message : String(error),
      })

      toast({
        title: "Error",
        description: "Failed to run migration",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Remove Name Column</h3>
          <p className="text-sm text-muted-foreground">
            Remove the name column from the pending_employees table and ensure surname and firstname columns are used
            instead.
          </p>
        </div>
        <Button onClick={handleMigration} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? "Running Migration..." : "Run Migration"}
        </Button>
      </div>

      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          {result.success ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>
            {result.message}
            {result.error && (
              <div className="mt-2">
                <code className="text-xs">{result.error}</code>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
