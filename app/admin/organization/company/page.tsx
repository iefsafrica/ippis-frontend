import type { Metadata } from "next"
import CompanyContent from "./company-content"

export const metadata: Metadata = {
  title: "Company | IPPIS Admin",
  description: "Manage organization company records",
}

export default function CompanyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Company</h1>
      </div>
      <div className="p-6 bg-white">
        <CompanyContent />
      </div>
    </div>
  )
}
