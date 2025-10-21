import type { Metadata } from "next"
import ClientWrapper from "./client-wrapper"

export const metadata: Metadata = {
  title: "Manage Holiday | IPPIS Admin",
  description: "Manage company holidays and special days",
}

export default function ManageHolidayPage() {
  return <ClientWrapper />
}
