import type { Metadata } from "next"
import CompanyPolicyContent from "./company-policy-content"

export const metadata: Metadata = {
  title: "Company Policy | IPPIS Admin",
  description: "Manage organization company policies",
}

export default function CompanyPolicyPage() {
  return <CompanyPolicyContent />
}
