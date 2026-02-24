import type { Metadata } from "next"
import ClientWrapper from "./client-wrapper"

export const metadata: Metadata = {
  title: "Reports | IPPIS Admin",
  description: "Generate and view system reports",
}

export default function ReportsPage() {
  return (
    <div className="px-2 sm:px-4 lg:px-6">
      <ClientWrapper />
    </div>
  )
}
