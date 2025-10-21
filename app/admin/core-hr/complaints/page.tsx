import type { Metadata } from "next"
import { ComplaintsContent } from "./complaints-content"

export const metadata: Metadata = {
  title: "Employee Complaints | IPPIS Admin",
  description: "Manage employee complaints and grievances",
}

export default function ComplaintsPage() {
  return <ComplaintsContent />
}
