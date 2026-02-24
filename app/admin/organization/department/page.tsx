import type { Metadata } from "next"
import DepartmentContent from "./department-content"

export const metadata: Metadata = {
  title: "Department | IPPIS Admin",
  description: "Manage organization departments",
}

export default function DepartmentPage() {
  return <DepartmentContent />
}
