import type { Metadata } from "next"
import { PerformanceAnalytics } from "@/app/admin/components/module-analytics/performance-analytics"

export const metadata: Metadata = {
  title: "Performance Management Analytics | IPPIS Admin",
  description: "Executive analytics for civil service annual appraisals, KPI scorecards, and institutional performance tracking",
}

export default function PerformancePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <PerformanceAnalytics />
    </div>
  )
}
