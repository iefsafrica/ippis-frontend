import type { Metadata } from "next"
import OrganizationTableContent from "../components/organization-table-content"
import { designationData } from "../data"

export const metadata: Metadata = {
  title: "Designation | IPPIS Admin",
  description: "Manage organization designations",
}

export default function DesignationPage() {
  return <OrganizationTableContent title="Designation" records={designationData} />
}
