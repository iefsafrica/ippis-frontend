"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Progress } from "@/components/ui/progress"

export function ProjectDetails({ event, onClose }) {
  const formatDate = (date) => {
    return format(new Date(date), "PPP")
  }

  const getStatusColor = (status) => {
    const colors = {
      Completed: "bg-green-100 text-green-800",
      "In Progress": "bg-blue-100 text-blue-800",
      "Not Started": "bg-gray-100 text-gray-800",
      "On Hold": "bg-yellow-100 text-yellow-800",
      Cancelled: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Badge className="bg-teal-100 text-teal-800">Project</Badge>
        <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <div className="font-semibold">Project Manager:</div>
          <div className="col-span-2">{event.manager}</div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="font-semibold">Team:</div>
          <div className="col-span-2">{Array.isArray(event.team) ? event.team.join(", ") : event.team}</div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="font-semibold">Timeline:</div>
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
            <div className="font-semibold">Description:</div>
            <div className="col-span-2">{event.description}</div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <div className="font-semibold">Completion:</div>
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <Progress value={event.completion} className="h-2" />
              <span className="text-sm">{event.completion}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button>Edit Project</Button>
        <Button variant="default">View Tasks</Button>
      </div>
    </div>
  )
}
