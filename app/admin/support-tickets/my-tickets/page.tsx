import { Suspense } from "react"
import MyTicketsContent from "./my-tickets-content"
import Loading from "./loading"

export const metadata = {
  title: "My Tickets | IPPIS Admin",
  description: "View and manage your support tickets",
}

export default function MyTicketsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <MyTicketsContent />
    </Suspense>
  )
}
