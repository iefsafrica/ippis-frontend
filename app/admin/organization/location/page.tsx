import type { Metadata } from "next"
import OrganizationTableContent from "../components/organization-table-content"
import { locationData } from "../data"

export const metadata: Metadata = {
  title: "Location | IPPIS Admin",
  description: "Manage organization locations",
}

export default function LocationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Location</h1>
      </div>
      <div className="p-6 bg-white">
        <OrganizationTableContent title="Location" records={locationData} />
      </div>
    </div>
  )
}
