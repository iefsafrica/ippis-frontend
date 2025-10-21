import { Suspense } from "react"
import { CalendarContent } from "./calendar-content"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "HR Calendar | IPPIS Admin",
  description: "View and manage HR events and schedules",
}

export default function HRCalendarPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">HR Calendar</h1>
      </div>
      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarContent />
      </Suspense>
    </div>
  )
}

function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-40" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      <Skeleton className="h-[600px] w-full" />
    </div>
  )
}
