import type { Metadata } from "next"
import ClientWrapper from "./client-wrapper"

export const metadata: Metadata = {
  title: "Attendances | IPPIS Admin",
  description: "Manage employee attendance records",
}

export default function AttendancesPage() {
  return <ClientWrapper />
}
