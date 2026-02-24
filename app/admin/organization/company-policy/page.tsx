import type { Metadata } from "next"
import OrganizationTableContent from "../components/organization-table-content"
import { companyPolicyData } from "../data"

export const metadata: Metadata = {
  title: "Company Policy | IPPIS Admin",
  description: "Manage organization company policies",
}

export default function CompanyPolicyPage() {
  return <OrganizationTableContent title="Company Policy" records={companyPolicyData} />
}
