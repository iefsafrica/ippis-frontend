"use client"

import { Suspense } from "react"
import IndicatorContent from "./indicator-content"

export default function ClientWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IndicatorContent />
    </Suspense>
  )
}
