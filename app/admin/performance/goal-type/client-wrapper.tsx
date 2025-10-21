"use client"

import { Suspense } from "react"
import GoalTypeContent from "./goal-type-content"

export default function ClientWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GoalTypeContent />
    </Suspense>
  )
}
