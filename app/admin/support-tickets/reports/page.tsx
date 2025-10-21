import { Suspense } from "react"
import ReportsContent from "./reports-content"
import Loading from "./loading"

export const metadata = {
  title: "Support Ticket Reports | IPPIS Admin",
  description: "Analyze support ticket metrics and performance",
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ReportsContent />
    </Suspense>
  )
}
