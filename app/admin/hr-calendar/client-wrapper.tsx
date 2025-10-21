"use client"

import { useState } from "react"
import { CalendarContent } from "./calendar-content"

export default function HRCalendarClientWrapper() {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div>
      <CalendarContent />
    </div>
  )
}
