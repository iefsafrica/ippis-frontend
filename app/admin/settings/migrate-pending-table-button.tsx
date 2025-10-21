"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Database } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function MigratePendingTableButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    message?: string
    error?: string
    status?: string
  } | null>(null)
  const { toast } = useToast()

  const handleMigration = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/migrate-pending-table", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to migrate pending employees table")
      }

      setResult(data)

      toast({
        title: data.status === "existing" ? "Already Updated" : "Migration Successful",
        description: data.message,
        variant: "default",
      })
    } catch (error) {
      console.error("Error during migration:", error)

      setResult({
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      })

      toast({
        title: "Migration Failed",
        description: error instanceof Error ? error.message : "Failed to migrate pending employees table",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <h4 className="text-sm font-medium">Pending Employees Table Migration</h4>
        <p className="text-sm text-muted-foreground">
          Update the pending employees table to include separate surname and firstname columns.
        </p>
        <Button onClick={handleMigration} disabled={isLoading} className="w-fit">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Migrating...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Migrate Pending Table
            </>
          )}
        </Button>
      </div>

      {result && (
        <Alert className={result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
          <AlertTitle className={result.success ? "text-green-800" : "text-red-800"}>
            {result.success
              ? result.status === "existing"
                ? "Already Updated"
                : "Migration Successful"
              : "Migration Failed"}
          </AlertTitle>
          <AlertDescription className={result.success ? "text-green-700" : "text-red-700"}>
            {result.message || result.error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
