"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Database } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function SetupDatabaseButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSetupDatabase = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/setup-db", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to set up database")
      }

      const data = await response.json()

      toast({
        title: "Success",
        description: data.message || "Database setup completed successfully",
      })

      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error("Database setup error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set up database. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleSetupDatabase} disabled={isLoading} className="gap-2">
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
      {isLoading ? "Setting up..." : "Initialize Database"}
    </Button>
  )
}
