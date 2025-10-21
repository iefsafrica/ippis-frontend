import type { Metadata } from "next"
import { MaintenanceLogContent } from "./maintenance-log-content"

export const metadata: Metadata = {
  title: "Maintenance Log | IPPIS Admin",
  description: "View and manage maintenance logs for organizational assets",
}

export default function MaintenanceLogPage() {
  return <MaintenanceLogContent />
}
