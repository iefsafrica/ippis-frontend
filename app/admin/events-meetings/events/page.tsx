import { Suspense } from "react"
import EventsContent from "./events-content"
import Loading from "./loading"

export default function EventsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <EventsContent />
    </Suspense>
  )
}
