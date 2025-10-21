"use client"

import dynamic from "next/dynamic"
import { Suspense, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Import the content component with SSR disabled
const ImportContent = dynamic(() => import("./import-content"), {
  ssr: false,
  loading: () => <div className="p-8 text-center">Loading import functionality...</div>,
})

export default function ClientWrapper() {
  const [error, setError] = useState<Error | null>(null)

  if (error) {
    return (
      <Alert variant="destructive" className="my-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading import functionality</AlertTitle>
        <AlertDescription>
          {error.message}
          <button className="ml-2 underline" onClick={() => window.location.reload()}>
            Try again
          </button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading import functionality...</div>}>
      <ImportContent />
    </Suspense>
  )
}
