import type { Metadata } from "next"
import { SupportTicketsAnalytics } from "@/app/admin/components/module-analytics/support-tickets-analytics"

export const metadata: Metadata = {
  title: "Support Desk Analytics | IPPIS Admin",
  description: "Executive analytics for civil service support tickets, SLA performance, and resolution velocity",
}

export default function SupportTicketsAnalyticsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <SupportTicketsAnalytics />
    </div>
  )
}
