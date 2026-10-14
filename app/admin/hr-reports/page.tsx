import type { Metadata } from "next"
import { HRReportsAnalytics } from "@/app/admin/components/module-analytics/hr-reports-analytics"

export const metadata: Metadata = {
  title: "HR Reports & Statutory Intelligence | IPPIS Admin",
  description: "Executive analytics and reporting catalog for civil service statutory compliance, nominal rolls, and audits",
}

export default function HRReportsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <HRReportsAnalytics />
    </div>
  )
}
