import type { Metadata } from "next"
import ClientWrapper from "./client-wrapper"

export const metadata: Metadata = {
  title: "Monthly Attendances | IPPIS Admin",
  description: "View monthly attendance summaries for employees",
}

export default function MonthlyAttendancesPage() {
  return <ClientWrapper />
}
