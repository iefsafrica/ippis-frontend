import type { Metadata } from "next"
import OrganizationTableContent from "../components/organization-table-content"
import { companyPolicyData } from "../data"

export const metadata: Metadata = {
  title: "Company Policy | IPPIS Admin",
  description: "Manage organization company policies",
}

export default function CompanyPolicyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Company Policy</h1>
      </div>
      <div className="p-6 bg-white">
        <OrganizationTableContent title="Company Policy" records={companyPolicyData} />
      </div>
    </div>
  )
}
