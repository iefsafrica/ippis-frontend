"use client"

import { useState } from "react"
import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import format from "date-fns/format"
import parse from "date-fns/parse"
import startOfWeek from "date-fns/startOfWeek"
import getDay from "date-fns/getDay"
import enUS from "date-fns/locale/en-US"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddEventForm } from "./add-event-form"
import { LeaveRequestForm } from "./leave-request-form"
import { TravelRequestForm } from "./travel-request-form"
import { ProjectForm } from "./project-form"
import { TaskForm } from "./task-form"
import { EventDetails } from "./event-details"
import { LeaveRequestDetails } from "./leave-request-details"
import { TravelRequestDetails } from "./travel-request-details"
import { ProjectDetails } from "./project-details"
import { TaskDetails } from "./task-details"

const locales = {
  "en-US": enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

// Event types with corresponding colors
const eventTypeColors = {
  holiday: "#f87171", // red
  meeting: "#60a5fa", // blue
  training: "#34d399", // green
  deadline: "#f97316", // orange
  leave: "#8b5cf6", // purple
  travel: "#ec4899", // pink
  project: "#14b8a6", // teal
  task: "#f59e0b", // amber
  other: "#6b7280", // gray
}

// Sample events
const events = [
  {
    id: 1,
    title: "Workers' Day",
    start: new Date(2025, 4, 1),
    end: new Date(2025, 4, 2),
    type: "holiday",
    allDay: true,
    description: "National public holiday",
    location: "Nationwide",
  },
  {
    id: 2,
    title: "Department Meeting",
    start: new Date(2025, 4, 5, 10, 0),
    end: new Date(2025, 4, 5, 11, 30),
    type: "meeting",
    description: "Monthly department progress review",
    location: "Conference Room A",
    attendees: ["John Doe", "Jane Smith", "Robert Johnson"],
  },
  {
    id: 3,
    title: "New Employee Orientation",
    start: new Date(2025, 4, 8, 9, 0),
    end: new Date(2025, 4, 8, 16, 0),
    type: "training",
    description: "Orientation for new hires",
    location: "Training Room 2",
    trainer: "HR Training Team",
  },
  {
    id: 4,
    title: "Quarterly Report Due",
    start: new Date(2025, 4, 15),
    end: new Date(2025, 4, 16),
    type: "deadline",
    allDay: true,
    description: "Submit Q1 department reports",
    responsible: "All Department Heads",
  },
  {
    id: 5,
    title: "John's Annual Leave",
    start: new Date(2025, 4, 10),
    end: new Date(2025, 4, 15),
    type: "leave",
    allDay: true,
    description: "Annual leave",
    employee: "John Doe",
    status: "Approved",
    leaveType: "Annual",
  },
  {
    id: 6,
    title: "Lagos Conference Trip",
    start: new Date(2025, 4, 20),
    end: new Date(2025, 4, 23),
    type: "travel",
    allDay: true,
    description: "HR Conference in Lagos",
    employee: "Jane Smith",
    destination: "Lagos",
    status: "Approved",
    travelType: "Conference",
  },
  {
    id: 7,
    title: "IPPIS System Upgrade",
    start: new Date(2025, 4, 5),
    end: new Date(2025, 4, 25),
    type: "project",
    allDay: true,
    description: "Major system upgrade project",
    manager: "Robert Johnson",
    team: ["John Doe", "Jane Smith", "Michael Brown"],
    status: "In Progress",
    completion: 35,
  },
  {
    id: 8,
    title: "Update Employee Records",
    start: new Date(2025, 4, 12),
    end: new Date(2025, 4, 13),
    type: "task",
    allDay: true,
    description: "Update employee records with new information",
    assignee: "Jane Smith",
    priority: "High",
    status: "Pending",
  },
]

export function CalendarContent() {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("events")

  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: eventTypeColors[event.type] || eventTypeColors.other,
      borderRadius: "4px",
      opacity: 0.8,
      color: "white",
      border: "0",
      display: "block",
    }
    return {
      style,
    }
  }

  const handleSelectEvent = (event) => {
    setSelectedEvent(event)
    setIsDetailsOpen(true)
  }

  const renderEventDetails = () => {
    if (!selectedEvent) return null

    switch (selectedEvent.type) {
      case "leave":
        return <LeaveRequestDetails event={selectedEvent} onClose={() => setIsDetailsOpen(false)} />
      case "travel":
        return <TravelRequestDetails event={selectedEvent} onClose={() => setIsDetailsOpen(false)} />
      case "project":
        return <ProjectDetails event={selectedEvent} onClose={() => setIsDetailsOpen(false)} />
      case "task":
        return <TaskDetails event={selectedEvent} onClose={() => setIsDetailsOpen(false)} />
      default:
        return <EventDetails event={selectedEvent} onClose={() => setIsDetailsOpen(false)} />
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              Today
            </Button>
            <Button variant="outline" size="sm">
              Month
            </Button>
            <Button variant="outline" size="sm">
              Week
            </Button>
            <Button variant="outline" size="sm">
              Day
            </Button>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add New</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-white text-black">
              <DialogHeader>
                <DialogTitle>Add to Calendar</DialogTitle>
              </DialogHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="events">Event</TabsTrigger>
                  <TabsTrigger value="leave">Leave</TabsTrigger>
                  <TabsTrigger value="travel">Travel</TabsTrigger>
                  <TabsTrigger value="project">Project</TabsTrigger>
                  <TabsTrigger value="task">Task</TabsTrigger>
                </TabsList>
                <TabsContent value="events">
                  <AddEventForm />
                </TabsContent>
                <TabsContent value="leave">
                  <LeaveRequestForm />
                </TabsContent>
                <TabsContent value="travel">
                  <TravelRequestForm />
                </TabsContent>
                <TabsContent value="project">
                  <ProjectForm />
                </TabsContent>
                <TabsContent value="task">
                  <TaskForm />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>

        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleSelectEvent}
          />
        </div>

        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[600px] bg-white text-black">
            <DialogHeader>
              <DialogTitle>{selectedEvent?.title}</DialogTitle>
            </DialogHeader>
            {renderEventDetails()}
          </DialogContent>
        </Dialog>

        <div className="mt-4 flex flex-wrap gap-3">
          <div className="text-sm font-medium">Legend:</div>
          {Object.entries(eventTypeColors).map(([type, color]) => (
            <div key={type} className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: color }}></div>
              <span className="text-sm capitalize">{type}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
