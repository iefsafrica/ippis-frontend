import type { Metadata } from "next"
import OrganizationTableContent from "../components/organization-table-content"
import { announcementsData } from "../data"

export const metadata: Metadata = {
  title: "Announcements | IPPIS Admin",
  description: "Manage organization announcements",
}

export default function AnnouncementsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
      </div>
      <div className="p-6 bg-white">
        <OrganizationTableContent title="Announcements" records={announcementsData} />
      </div>
    </div>
  )
}
