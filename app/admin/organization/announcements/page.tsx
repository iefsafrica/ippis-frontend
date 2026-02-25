import type { Metadata } from "next"
import AnnouncementsContent from "./announcements-content"

export const metadata: Metadata = {
  title: "Announcements | IPPIS Admin",
  description: "Manage organization announcements",
}

export default function AnnouncementsPage() {
  return <AnnouncementsContent />
}
