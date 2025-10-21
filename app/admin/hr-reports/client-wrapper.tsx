"use client"

import { useEffect, useState } from "react"
import HRReportsContent from "./hr-reports-content"

export default function ClientWrapper() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <HRReportsContent />
}
