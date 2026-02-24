import type { Metadata } from "next"
import OrganizationTableContent from "../components/organization-table-content"
import { announcementsData } from "../data"

export const metadata: Metadata = {
  title: "Announcements | IPPIS Admin",
  description: "Manage organization announcements",
}

export default function AnnouncementsPage() {
  return <OrganizationTableContent title="Announcements" records={announcementsData} />
}
