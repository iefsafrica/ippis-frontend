import type { Metadata } from "next"
import { EventsMeetingsAnalytics } from "@/app/admin/components/module-analytics/events-meetings-analytics"

export const metadata: Metadata = {
  title: "Events & Meetings Analytics | IPPIS Admin",
  description: "Executive analytics for civil service convenings, board hearings, virtual forums, and participant engagement",
}

export default function EventsMeetingsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <EventsMeetingsAnalytics />
    </div>
  )
}
