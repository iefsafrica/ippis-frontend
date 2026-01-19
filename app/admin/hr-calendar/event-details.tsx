"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export function EventDetails({ event, onClose, onEdit, onDelete }) {
  const formatDate = (date) => {
    return format(new Date(date), "PPP")
  }

  const formatTime = (date) => {
    return format(new Date(date), "p")
  }

  const getEventTypeColor = (type) => {
    const colors = {
      holiday: "bg-red-100 text-red-800",
      meeting: "bg-blue-100 text-blue-800",
      training: "bg-green-100 text-green-800",
      deadline: "bg-orange-100 text-orange-800",
      other: "bg-gray-100 text-gray-800",
    }
    return colors[type] || colors.other
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Badge className={getEventTypeColor(event.type)}>
          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <div className="font-semibold">Date:</div>
          <div className="col-span-2">
            {event.allDay ? (
              formatDate(event.start)
            ) : (
              <>
                {formatDate(event.start)} at {formatTime(event.start)}
              </>
            )}
            {event.end && event.start.toDateString() !== event.end.toDateString() && <> to {formatDate(event.end)}</>}
          </div>
        </div>

        {event.department && (
          <div className="grid grid-cols-3 gap-2">
            <div className="font-semibold">Department:</div>
            <div className="col-span-2">{event.department}</div>
          </div>
        )}

        {event.location && (
          <div className="grid grid-cols-3 gap-2">
            <div className="font-semibold">Location:</div>
            <div className="col-span-2">{event.location}</div>
          </div>
        )}

        {event.description && (
          <div className="grid grid-cols-3 gap-2">
            <div className="font-semibold">Description:</div>
            <div className="col-span-2">{event.description}</div>
          </div>
        )}

        {event.attendees && (
          <div className="grid grid-cols-3 gap-2">
            <div className="font-semibold">Attendees:</div>
            <div className="col-span-2">
              {Array.isArray(event.attendees) ? event.attendees.join(", ") : event.attendees}
            </div>
          </div>
        )}

        {event.trainer && (
          <div className="grid grid-cols-3 gap-2">
            <div className="font-semibold">Trainer:</div>
            <div className="col-span-2">{event.trainer}</div>
          </div>
        )}

        {event.responsible && (
          <div className="grid grid-cols-3 gap-2">
            <div className="font-semibold">Responsible:</div>
            <div className="col-span-2">{event.responsible}</div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        {onEdit && <Button onClick={onEdit}>Edit Event</Button>}
        {onDelete && (
          <Button variant="destructive" onClick={onDelete}>
            Delete Event
          </Button>
        )}
      </div>
    </div>
  )
}
