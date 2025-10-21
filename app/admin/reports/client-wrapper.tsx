"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

// Import the content component with SSR disabled
const ReportsContent = dynamic(() => import("./reports-content"), {
  ssr: false,
  loading: () => <div className="p-8 text-center">Loading reports...</div>,
})

export default function ClientWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading reports...</div>}>
      <ReportsContent />
    </Suspense>
  )
}
