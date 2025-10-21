"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function SeedPendingButton() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSeedPending = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/seed-pending-employees", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to seed pending employees: ${response.status}`)
      }

      const data = await response.json()

      toast({
        title: "Success",
        description: data.message,
      })
    } catch (error) {
      console.error("Failed to seed pending employees:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleSeedPending} disabled={loading} variant="outline" className="w-full">
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {loading ? "Seeding..." : "Seed Pending Employees"}
    </Button>
  )
}
