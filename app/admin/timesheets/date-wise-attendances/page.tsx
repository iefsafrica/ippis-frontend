import type { Metadata } from "next"
import ClientWrapper from "./client-wrapper"

export const metadata: Metadata = {
  title: "Date-wise Attendances | IPPIS Admin",
  description: "View attendance records for specific date ranges",
}

export default function DateWiseAttendancesPage() {
  return <ClientWrapper />
}
