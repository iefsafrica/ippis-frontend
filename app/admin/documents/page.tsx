import type { Metadata } from "next"
import ClientWrapper from "./client-wrapper"

export const metadata: Metadata = {
  title: "Documents | IPPIS Admin",
  description: "Manage and verify employee documents",
}

export default function DocumentsPage() {
  return (
    <div className="px-2 sm:px-4 lg:px-6">
      <ClientWrapper />
    </div>
  )
}
