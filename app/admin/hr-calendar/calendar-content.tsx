"use client"

import { useMemo, useState } from "react"
import { addDays, differenceInCalendarDays, format, isSameDay, isWithinInterval } from "date-fns"
import { Calendar as CalendarIcon, Clock, MapPin, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useGetCalendarEvents } from "@/services/hooks/calendar/events"
import { toast } from "sonner"
import { AddCalendarEventDialog } from "./add-calendar-event-dialog"
import { ViewCalendarEventDialog } from "./view-calendar-event-dialog"
import type { CalendarEvent } from "@/types/calendar/events"

const eventTypeBadgeClasses: Record<string, string> = {
  holiday: "bg-red-100 text-red-800",
  meeting: "bg-blue-100 text-blue-800",
  training: "bg-green-100 text-green-800",
  deadline: "bg-orange-100 text-orange-800",
  leave: "bg-purple-100 text-purple-800",
  travel: "bg-pink-100 text-pink-800",
  project: "bg-teal-100 text-teal-800",
  task: "bg-amber-100 text-amber-800",
  other: "bg-gray-100 text-gray-800",
}

const dateKey = (date: Date) => format(date, "yyyy-MM-dd")

export function CalendarContent() {
  const [currentEvent, setCurrentEvent] = useState<CalendarEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const { 
    data: calendarEventsResponse, 
    isLoading: isLoadingCalendarEvents, 
    isError: isCalendarEventsError,
    error: calendarEventsError,
    refetch: refetchCalendarEvents
  } = useGetCalendarEvents()

  const events = useMemo(() => {
    return (calendarEventsResponse?.data || []).map((event) => ({
      id: event.id,
      title: event.title,
      start: new Date(event.start_date),
      end: new Date(event.end_date),
      type: event.event_type?.toLowerCase?.() || "other",
      allDay: event.all_day,
      description: event.description,
      location: event.location,
      attendees: event.attendees,
      department: event.department,
      status: event.status,
    }))
  }, [calendarEventsResponse])

  const isBusy = isLoadingCalendarEvents

  const handleSelectEvent = (eventId: number) => {
    const matchedEvent = calendarEventsResponse?.data?.find((item) => item.id === eventId) || null
    if (matchedEvent) {
      setCurrentEvent(matchedEvent)
      setIsViewDialogOpen(true)
    }
  }

  const handleManualRefresh = async () => {
    await refetchCalendarEvents()
    toast.info("Refreshing calendar events...")
  }

  const eventDates = useMemo(() => {
    const dates: Date[] = []
    events.forEach((event) => {
      const start = new Date(event.start)
      const end = new Date(event.end)
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return
      const span = Math.max(differenceInCalendarDays(end, start), 0)
      for (let index = 0; index <= span; index += 1) {
        dates.push(addDays(start, index))
      }
    })
    return dates
  }, [events])

  const selectedDayEvents = useMemo(() => {
    return events.filter((event) => {
      const start = new Date(event.start)
      const end = new Date(event.end)
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false
      if (isSameDay(start, end)) {
        return isSameDay(start, selectedDate)
      }
      return isWithinInterval(selectedDate, { start, end })
    })
  }, [events, selectedDate])

  if (isLoadingCalendarEvents) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-sm text-gray-600">Loading calendar events...</div>
        </CardContent>
      </Card>
    )
  }

  if (isCalendarEventsError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-sm text-red-600">Error loading calendar events</div>
          <div className="text-xs text-gray-600 mt-2">{calendarEventsError?.message}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchCalendarEvents()}
            className="mt-4"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-200 shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">HR Calendar</CardTitle>
              <p className="text-sm text-gray-500">Select a day to view scheduled events</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleManualRefresh} disabled={isBusy}>
              Refresh
            </Button>
            <Button size="sm" disabled={isBusy} onClick={() => setIsAddDialogOpen(true)}>
              Add Event
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              modifiers={{ hasEvent: eventDates }}
              modifiersClassNames={{
                hasEvent: "bg-blue-100 text-blue-900 font-semibold",
              }}
              className="w-full rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
              classNames={{
                months: "w-full",
                month: "w-full space-y-4",
                caption: "flex items-center justify-between px-1",
                caption_label: "text-sm font-semibold text-gray-900",
                nav: "flex items-center gap-2",
                nav_button: "h-8 w-8 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50",
                table: "w-full border-collapse",
                head_row: "flex w-full justify-between",
                head_cell: "w-9 text-center text-[11px] font-semibold text-gray-500 uppercase",
                row: "mt-2 flex w-full justify-between",
                cell: "relative flex h-9 w-9 items-center justify-center p-0",
                day: "h-9 w-9 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-100",
                day_today: "border border-blue-200 bg-blue-50",
                day_selected: "bg-blue-600 text-white hover:bg-blue-600",
                day_outside: "text-gray-300",
                day_disabled: "text-gray-300 opacity-60",
              }}
            />
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-100 border border-blue-200" />
              Days with events
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {format(selectedDate, "PPP")}
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedDayEvents.length} event{selectedDayEvents.length === 1 ? "" : "s"} scheduled
                </p>
              </div>
            </div>
            <Separator />
            {selectedDayEvents.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                No events scheduled for this day.
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayEvents.map((event) => {
                  const badgeClass = eventTypeBadgeClasses[event.type] || eventTypeBadgeClasses.other
                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => handleSelectEvent(event.id)}
                      className="w-full text-left rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{event.title}</p>
                          <p className="text-xs text-gray-500">{event.department || "General"}</p>
                        </div>
                        <Badge className={badgeClass}>{event.type}</Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {event.allDay
                              ? "All day"
                              : `${format(event.start, "p")} - ${format(event.end, "p")}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{event.location || "No location"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5" />
                          <span>
                            {Array.isArray(event.attendees) && event.attendees.length > 0
                              ? `${event.attendees.length} attendees`
                              : "No attendees"}
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <AddCalendarEventDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
        />

        {currentEvent && (
          <ViewCalendarEventDialog
            isOpen={isViewDialogOpen}
            onClose={() => {
              setIsViewDialogOpen(false)
              setCurrentEvent(null)
            }}
            event={currentEvent}
          />
        )}
      </CardContent>
    </Card>
  )
}
