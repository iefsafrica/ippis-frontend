import type { Metadata } from "next"
import ClientWrapper from "./client-wrapper"

export const metadata: Metadata = {
  title: "Office Shift | IPPIS Admin",
  description: "Manage office shift schedules and assignments",
}

export default function OfficeShiftPage() {
  return <ClientWrapper />
}
