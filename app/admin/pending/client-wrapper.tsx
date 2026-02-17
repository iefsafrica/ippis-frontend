"use client"

import { PendingContent } from "./pending-content"

interface ClientWrapperProps {
  refreshKey?: number
}

export default function ClientWrapper({ refreshKey = 0 }: ClientWrapperProps) {
  return (
    <PendingContent key={refreshKey} />
  )
}
