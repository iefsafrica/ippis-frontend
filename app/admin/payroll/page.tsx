import type { Metadata } from "next"
import { PayrollAnalytics } from "@/app/admin/components/module-analytics/payroll-analytics"

export const metadata: Metadata = {
  title: "Payroll & Compensation Analytics | IPPIS Admin",
  description: "Executive analytics for Federal payroll disimbursements, deductions, CONPSS salary structures, and payslips",
}

export default function PayrollPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <PayrollAnalytics />
    </div>
  )
}
