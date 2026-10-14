import type { Metadata } from "next"
import { OrganizationAnalytics } from "@/app/admin/components/module-analytics/organization-analytics"

export const metadata: Metadata = {
  title: "Organization & MDA Structure Analytics | IPPIS Admin",
  description: "Executive analytics for Federal ministries, departments, extra-ministerial agencies, cadres, and circulars",
}

export default function OrganizationPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <OrganizationAnalytics />
    </div>
  )
}
