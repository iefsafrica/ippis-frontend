import type { Metadata } from "next"
import { AssetsAnalytics } from "@/app/admin/components/module-analytics/assets-analytics"

export const metadata: Metadata = {
  title: "Assets Analytics | IPPIS Admin",
  description: "Executive analytics for Federal fixed assets, capital allocations, and lifecycle tracking",
}

export default function AssetsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <AssetsAnalytics />
    </div>
  )
}
