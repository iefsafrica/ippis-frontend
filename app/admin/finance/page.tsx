import type { Metadata } from "next"
import { FinanceAnalytics } from "@/app/admin/components/module-analytics/finance-analytics"

export const metadata: Metadata = {
  title: "Finance & Treasury Analytics | IPPIS Admin",
  description: "Executive analytics for Treasury Single Account (TSA) allocations, warrants, overhead expenses, and MDA ledgers",
}

export default function FinancePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <FinanceAnalytics />
    </div>
  )
}
