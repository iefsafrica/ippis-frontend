import { OfficialDocuments } from "./official-documents"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Official Documents | IPPIS Admin",
  description: "Manage official organizational documents",
}

export default function OfficialDocumentsPage() {
  return <OfficialDocuments />
}
