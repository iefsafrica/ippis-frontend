"use client"

import { useEffect, useState } from "react"
import DocumentsContent from "./documents-content"
import { Skeleton } from "@/components/ui/skeleton"

export default function ClientWrapper() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  return <DocumentsContent />
}
