import type { Metadata } from "next"
import ClientWrapper from "./client-wrapper"

export const metadata: Metadata = {
  title: "Update Attendances | IPPIS Admin",
  description: "Edit and update employee attendance records",
}

export default function UpdateAttendancesPage() {
  return <ClientWrapper />
}
