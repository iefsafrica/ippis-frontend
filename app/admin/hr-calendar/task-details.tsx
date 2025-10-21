"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export function TaskDetails({ event, onClose }) {
  const formatDate = (date) => {
    return format(new Date(date), "PPP")
  }

  const getStatusColor = (status) => {
    const colors = {
      Completed: "bg-green-100 text-green-800",
      "In Progress": "bg-blue-100 text-blue-800",
      "Not Started": "bg-gray-100 text-gray-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Cancelled: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getPriorityColor = (priority) => {
    const colors = {
      Low: "bg-blue-100 text-blue-800",
      Medium: "bg-yellow-100 text-yellow-800",
      High: "bg-orange-100 text-orange-800",
      Urgent: "bg-red-100 text-red-800",
    }
    return colors[priority] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Badge className="bg-amber-100 text-amber-800">Task</Badge>
        <div className="flex space-x-2">
          <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
          <Badge className={getPriorityColor(event.priority)}>{event.priority} Priority</Badge>
        </div>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <div className="font-semibold">Assignee:</div>
          <div className="col-span-2">{event.assignee}</div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="font-semibold">Due Date:</div>
          <div className="col-span-2">{formatDate(event.end)}</div>
        </div>

        {event.description && (
          <div className="grid grid-cols-3 gap-2">
            <div className="font-semibold">Description:</div>
            <div className="col-span-2">{event.description}</div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button variant="destructive">Mark Cancelled</Button>
        <Button variant="default">Mark Complete</Button>
        <Button>Edit Task</Button>
      </div>
    </div>
  )
}
