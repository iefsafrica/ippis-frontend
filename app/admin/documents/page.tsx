import type { Metadata } from "next"
import ClientWrapper from "./client-wrapper"

export const metadata: Metadata = {
  title: "Documents | IPPIS Admin",
  description: "Manage and verify employee documents",
}

export default function DocumentsPage() {
  return <ClientWrapper />
}
