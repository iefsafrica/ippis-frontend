"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Database } from "lucide-react"

export function SetupDashboardTablesButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSetupTables = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/setup-dashboard-tables", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Dashboard tables have been set up successfully.",
          duration: 3000,
        })
      } else {
        throw new Error(data.error || "Failed to set up dashboard tables")
      }
    } catch (error) {
      console.error("Error setting up dashboard tables:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set up dashboard tables",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleSetupTables} disabled={isLoading} className="hidden">
      <Database className="h-4 w-4" />
      <span className="sr-only">Setup Dashboard Tables</span>
    </Button>
  )
}
