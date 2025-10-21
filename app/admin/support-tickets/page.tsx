import { Suspense } from "react"
import AllTicketsContent from "./all-tickets-content"
import Loading from "./loading"

export const metadata = {
  title: "Support Tickets | IPPIS Admin",
  description: "Manage and respond to employee support requests",
}

export default function SupportTicketsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AllTicketsContent />
    </Suspense>
  )
}
