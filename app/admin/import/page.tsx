import type { Metadata } from "next"
import ClientWrapper from "./client-wrapper"

export const metadata: Metadata = {
  title: "Import Employees | IPPIS Admin",
  description: "Import employee data from CSV files",
}

export default function ImportEmployeesPage() {
  return <ClientWrapper />
}
