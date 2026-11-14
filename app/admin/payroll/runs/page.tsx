import { Metadata } from "next"
import { PayrollRunsContent } from "./payroll-runs-content"

export const metadata: Metadata = {
  title: "Monthly Payroll Runs | IPPIS Admin",
  description: "Prepare and approve monthly payroll runs per MDA with skipped employee reporting.",
}

export default function PayrollRunsPage() {
  return <PayrollRunsContent />
}
