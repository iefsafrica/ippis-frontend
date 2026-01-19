"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Building, FileText, Users, MapPin, Clock, X } from "lucide-react"
import type { CalendarEvent } from "@/types/calendar/events"
import { format } from "date-fns"

interface ViewCalendarEventDialogProps {
  isOpen: boolean
  onClose: () => void
  event: CalendarEvent
}

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-800 hover:bg-green-100",
  inactive: "bg-gray-100 text-gray-800 hover:bg-gray-100",
}

const eventTypeStyles: Record<string, string> = {
  meeting: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  training: "bg-green-100 text-green-800 hover:bg-green-100",
  holiday: "bg-red-100 text-red-800 hover:bg-red-100",
  deadline: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  other: "bg-gray-100 text-gray-800 hover:bg-gray-100",
}

export function ViewCalendarEventDialog({ isOpen, onClose, event }: ViewCalendarEventDialogProps) {
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [showFullAttendees, setShowFullAttendees] = useState(false)

  const MAX_PREVIEW = 300

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP")
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPpp")
    } catch {
      return dateString
    }
  }

  const eventTypeKey = (event.event_type || "other").toLowerCase()
  const eventTypeClass = eventTypeStyles[eventTypeKey] || eventTypeStyles.other
  const statusKey = (event.status || "inactive").toLowerCase()
  const statusClass = statusStyles[statusKey] || statusStyles.inactive

  const attendeesList = useMemo(() => {
    if (!event.attendees || event.attendees.length === 0) return ""
    return event.attendees.join(", ")
  }, [event.attendees])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-3xl overflow-hidden border border-gray-200 shadow-xl">
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Calendar className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Calendar Event Details
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  View event information for {event.title}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-gray-500 hover:text-gray-700"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Event Summary</h3>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <FileText className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-xs text-gray-500 font-medium">Event Title</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.department}</p>
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <Building className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-xs text-gray-500 font-medium">Department</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{event.department}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-xs text-gray-500 font-medium">Event Type</span>
                      </div>
                      <Badge className={`${eventTypeClass} py-1 px-2`} variant="outline">
                        {event.event_type}
                      </Badge>
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-xs text-gray-500 font-medium">Status</span>
                      </div>
                      <Badge className={`${statusClass} py-1 px-2`} variant="outline">
                        {event.status || "inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-6">Schedule Details</h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-xs text-gray-500 font-medium">Event Dates</span>
                    </div>
                    <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2">
                      <p className="text-sm font-medium text-gray-900">Start Date</p>
                      <p className="text-xs text-gray-500">{formatDate(event.start_date)}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mt-2">
                      <p className="text-sm font-medium text-gray-900">End Date</p>
                      <p className="text-xs text-gray-500">{formatDate(event.end_date)}</p>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {event.all_day ? "All-day event" : "Timed event"}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-xs text-gray-500 font-medium">Location</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {event.location || "No location specified"}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <FileText className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-xs text-gray-500 font-medium">Description</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    {event.description ? (
                      <>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {event.description.length > MAX_PREVIEW && !showFullDescription
                            ? `${event.description.slice(0, MAX_PREVIEW)}...`
                            : event.description}
                        </p>
                        {event.description.length > MAX_PREVIEW && (
                          <button
                            onClick={() => setShowFullDescription((value) => !value)}
                            className="mt-2 text-sm text-blue-600 hover:underline"
                            aria-expanded={showFullDescription}
                          >
                            {showFullDescription ? "Show less" : "Show more"}
                          </button>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">No description provided</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Users className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-xs text-gray-500 font-medium">Attendees</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    {attendeesList ? (
                      <>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {attendeesList.length > MAX_PREVIEW && !showFullAttendees
                            ? `${attendeesList.slice(0, MAX_PREVIEW)}...`
                            : attendeesList}
                        </p>
                        {attendeesList.length > MAX_PREVIEW && (
                          <button
                            onClick={() => setShowFullAttendees((value) => !value)}
                            className="mt-2 text-sm text-blue-600 hover:underline"
                            aria-expanded={showFullAttendees}
                          >
                            {showFullAttendees ? "Show less" : "Show more"}
                          </button>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">No attendees listed</p>
                    )}
                  </div>
                </div>

                {(event.created_at || event.updated_at) && (
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4">Metadata</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {event.created_at && (
                        <div>
                          <div className="flex items-center mb-2">
                            <Clock className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-xs text-gray-500 font-medium">Created At</span>
                          </div>
                          <p className="text-sm text-gray-600">{formatDateTime(event.created_at)}</p>
                        </div>
                      )}

                      {event.updated_at && (
                        <div>
                          <div className="flex items-center mb-2">
                            <Clock className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-xs text-gray-500 font-medium">Last Updated</span>
                          </div>
                          <p className="text-sm text-gray-600">{formatDateTime(event.updated_at)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-8 py-5 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-gray-300 hover:bg-gray-100 text-gray-700"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
