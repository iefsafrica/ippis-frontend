import type { Metadata } from "next"
import { HRCalendarAnalytics } from "@/app/admin/components/module-analytics/hr-calendar-analytics"

export const metadata: Metadata = {
  title: "HR Calendar Analytics | IPPIS Admin",
  description: "Executive analytics for civil service events, leave schedules, public holidays, and project milestones",
}

export default function HRCalendarAnalyticsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <HRCalendarAnalytics />
    </div>
  )
}
