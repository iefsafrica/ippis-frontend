import type { Metadata } from "next"
import { WarningsContent } from "./warnings-content"

export const metadata: Metadata = {
  title: "Employee Warnings | IPPIS Admin",
  description: "Manage employee disciplinary warnings and notices",
}

export default function WarningsPage() {
  return <WarningsContent />
}
