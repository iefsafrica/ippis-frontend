"use client"

import { Suspense } from "react"
import AppraisalContent from "./appraisal-content"

export default function ClientWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppraisalContent />
    </Suspense>
  )
}
