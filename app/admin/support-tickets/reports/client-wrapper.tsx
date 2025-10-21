"use client"

import { Suspense } from "react"
import ReportsContent from "./reports-content"

export default function ClientWrapper() {
  return (
    <Suspense fallback={<div>Loading reports...</div>}>
      <ReportsContent />
    </Suspense>
  )
}
