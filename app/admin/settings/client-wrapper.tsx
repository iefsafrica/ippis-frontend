"use client"

import { useGetNormalizedSettings } from "@/services/hooks/settings"
import { DEFAULT_SETTINGS_FORM_STATE } from "@/types/settings"
import { SettingsContent } from "./settings-content"
import { Loader2 } from "lucide-react"

export default function ClientWrapper() {
  const { data, isLoading, isError, error } = useGetNormalizedSettings()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-lg">
          <h2 className="text-red-700 text-lg font-medium mb-2">Error Loading Settings</h2>
          <p className="text-red-600">{error instanceof Error ? error.message : "Failed to load settings"}</p>
          <p className="mt-4 text-sm text-gray-600">
            Please check your network connection and API endpoints, or contact the system administrator.
          </p>
        </div>
      </div>
    )
  }

  return <SettingsContent initialSettings={data ?? DEFAULT_SETTINGS_FORM_STATE} />
}
