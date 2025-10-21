import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "HR Calendar | IPPIS Admin",
  description: "View and manage HR events and schedules",
}

export default function HRCalendarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="space-y-6">{children}</div>
}
