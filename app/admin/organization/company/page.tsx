import type { Metadata } from "next"
import CompanyContent from "./company-content"

export const metadata: Metadata = {
  title: "Company | IPPIS Admin",
  description: "Manage organization company records",
}

export default function CompanyPage() {
  return <CompanyContent />
}
