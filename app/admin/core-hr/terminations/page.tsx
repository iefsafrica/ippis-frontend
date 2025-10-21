import type { Metadata } from "next"
import { TerminationsContent } from "./terminations-content"

export const metadata: Metadata = {
  title: "Employee Terminations | IPPIS Admin",
  description: "Manage employee termination processes and documentation",
}

export default function TerminationsPage() {
  return <TerminationsContent />
}
