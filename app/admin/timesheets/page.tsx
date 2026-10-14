import type { Metadata } from "next"
import { TimesheetsAnalytics } from "@/app/admin/components/module-analytics/timesheets-analytics"

export const metadata: Metadata = {
  title: "Timesheets & Attendance Analytics | IPPIS Admin",
  description: "Executive analytics for civil service biometric clock-in rates, punctuality compliance, and leave management",
}

export default function TimesheetsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <TimesheetsAnalytics />
    </div>
  )
}
