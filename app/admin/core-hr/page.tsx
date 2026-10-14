import type { Metadata } from "next"
import { CoreHRAnalytics } from "@/app/admin/components/module-analytics/core-hr-analytics"

export const metadata: Metadata = {
  title: "Core HR Analytics | IPPIS Admin",
  description: "Executive analytics dashboard for Civil Service personnel movements, promotions, and disciplinary workflows",
}

export default function CoreHRPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <CoreHRAnalytics />
    </div>
  )
}
