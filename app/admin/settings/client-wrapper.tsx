"use client"

import { useState, useEffect } from "react"
import { SettingsContent } from "./settings-content"
import { Loader2 } from "lucide-react"

export default function ClientWrapper() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/admin/settings")

        if (!response.ok) {
          throw new Error(`Failed to fetch settings: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          setSettings(data.data || {})
        } else {
          throw new Error(data.error || "Failed to load settings")
        }
      } catch (err) {
        console.error("Error loading settings:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        // Set default settings
        setSettings({})
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-lg">
          <h2 className="text-red-700 text-lg font-medium mb-2">Error Loading Settings</h2>
          <p className="text-red-600">{error}</p>
          <p className="mt-4 text-sm text-gray-600">
            Please check your network connection and API endpoints, or contact the system administrator.
          </p>
        </div>
      </div>
    )
  }

  return <SettingsContent initialSettings={settings} />
}
