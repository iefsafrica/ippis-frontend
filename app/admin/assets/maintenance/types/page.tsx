import type { Metadata } from "next"
import { MaintenanceTypesContent } from "./maintenance-types-content"

export const metadata: Metadata = {
  title: "Maintenance Types | IPPIS Admin",
  description: "Manage types of maintenance for organizational assets",
}

export default function MaintenanceTypesPage() {
  return <MaintenanceTypesContent />
}
