"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

// Use dynamic import with ssr: false to prevent server-side rendering
const BackupContent = dynamic(() => import("./backup-content"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      <span className="ml-2 text-lg text-gray-500">Loading backup interface...</span>
    </div>
  ),
})

export default function ClientWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[50vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-lg text-gray-500">Loading backup interface...</span>
        </div>
      }
    >
      <BackupContent />
    </Suspense>
  )
}
