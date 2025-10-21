"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export function LeaveRequestDetails({ event, onClose }) {
  const formatDate = (date) => {
    return format(new Date(date), "PPP")
  }

  const getStatusColor = (status) => {
    const colors = {
      Approved: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Rejected: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Badge className="bg-purple-100 text-purple-800">Leave Request</Badge>
        <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <div className="font-semibold">Employee:</div>
          <div className="col-span-2">{event.employee}</div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="font-semibold">Leave Type:</div>
          <div className="col-span-2">{event.leaveType}</div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="font-semibold">Date Range:</div>
          <div className="col-span-2">
            {formatDate(event.start)} to {formatDate(event.end)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="font-semibold">Duration:</div>
          <div className="col-span-2">
            {Math.ceil((new Date(event.end) - new Date(event.start)) / (1000 * 60 * 60 * 24))} days
          </div>
        </div>

        {event.description && (
          <div className="grid grid-cols-3 gap-2">
            <div className="font-semibold">Reason:</div>
            <div className="col-span-2">{event.description}</div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        {event.status === "Pending" && (
          <>
            <Button variant="destructive">Reject</Button>
            <Button variant="default">Approve</Button>
          </>
        )}
        {event.status !== "Pending" && <Button>Edit Request</Button>}
      </div>
    </div>
  )
}
