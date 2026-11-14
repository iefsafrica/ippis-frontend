import { Metadata } from "next"
import { AccessRequestsContent } from "./access-requests-content"

export const metadata: Metadata = {
  title: "Temporary Access Requests | IPPIS Admin",
  description: "Request and manage temporary roles across MDAs for up to 90 days.",
}

export default function AccessRequestsPage() {
  return <AccessRequestsContent />
}
