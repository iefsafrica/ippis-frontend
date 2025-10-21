import type { Metadata } from "next"
import ClientWrapper from "./client-wrapper"

export const metadata: Metadata = {
  title: "Import Attendances | IPPIS Admin",
  description: "Import attendance data from CSV/Excel",
}

export default function ImportAttendancesPage() {
  return <ClientWrapper />
}
