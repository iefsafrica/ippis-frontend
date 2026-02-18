import type { Metadata } from "next"
import OrganizationTableContent from "../components/organization-table-content"
import { departmentData } from "../data"

export const metadata: Metadata = {
  title: "Department | IPPIS Admin",
  description: "Manage organization departments",
}

export default function DepartmentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Department</h1>
      </div>
      <div className="p-6 bg-white">
        <OrganizationTableContent title="Department" records={departmentData} />
      </div>
    </div>
  )
}
