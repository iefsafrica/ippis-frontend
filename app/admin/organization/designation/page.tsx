import type { Metadata } from "next"
import OrganizationTableContent from "../components/organization-table-content"
import { designationData } from "../data"

export const metadata: Metadata = {
  title: "Designation | IPPIS Admin",
  description: "Manage organization designations",
}

export default function DesignationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Designation</h1>
      </div>
      <div className="p-6 bg-white">
        <OrganizationTableContent title="Designation" records={designationData} />
      </div>
    </div>
  )
}
