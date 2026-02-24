import type { Metadata } from "next"
import DesignationContent from "./designation-content"

export const metadata: Metadata = {
  title: "Designation | IPPIS Admin",
  description: "Manage organization designations",
}

export default function DesignationPage() {
  return <DesignationContent />
}
