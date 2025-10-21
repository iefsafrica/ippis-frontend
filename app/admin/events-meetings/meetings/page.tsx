import { Suspense } from "react"
import MeetingsContent from "./meetings-content"
import Loading from "./loading"

export default function MeetingsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <MeetingsContent />
    </Suspense>
  )
}
