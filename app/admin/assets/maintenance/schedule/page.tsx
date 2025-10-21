import type { Metadata } from "next"
import { MaintenanceScheduleContent } from "./maintenance-schedule-content"

export const metadata: Metadata = {
  title: "Maintenance Schedule | IPPIS Admin",
  description: "Schedule and manage upcoming maintenance for organizational assets",
}

export default function MaintenanceSchedulePage() {
  return <MaintenanceScheduleContent />
}
