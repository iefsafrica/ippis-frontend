"use client"

import { Suspense } from "react"
import GoalTrackingContent from "./goal-tracking-content"

export default function ClientWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GoalTrackingContent />
    </Suspense>
  )
}
