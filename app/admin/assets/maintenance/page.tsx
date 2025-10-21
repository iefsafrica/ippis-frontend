import type { Metadata } from "next"
import { MaintenanceContent } from "./maintenance-content"

export const metadata: Metadata = {
  title: "Asset Maintenance | IPPIS Admin",
  description: "Manage and schedule maintenance for organizational assets",
}

export default function MaintenancePage() {
  return <MaintenanceContent />
}
