"use client"

import { useState } from "react"
import { EnhancedDataTable } from "@/app/admin/components/enhanced-data-table"
import { EnhancedForm, type FormField } from "@/app/admin/components/enhanced-form"
import { DetailsView, type DetailTab } from "@/app/admin/components/details-view"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, User, DollarSign, FileText, Tag } from "lucide-react"
import { format } from "date-fns"

// Mock data for events
const mockEvents = [
  {
    id: "1",
    title: "Annual Company Conference",
    description: "Annual gathering of all employees for company updates and team building",
    eventType: "conference",
    location: "Grand Hyatt Hotel, Lagos",
    startDate: "2025-06-15T09:00:00",
    endDate: "2025-06-17T17:00:00",
    organizer: "HR Department",
    status: "upcoming",
    budget: 5000000,
    attendeeCount: 250,
    createdAt: "2025-01-10T12:00:00",
    updatedAt: "2025-01-15T14:30:00",
  },
  {
    id: "2",
    title: "New Employee Orientation",
    description: "Orientation session for new employees joining this quarter",
    eventType: "orientation",
    location: "Training Room A, Headquarters",
    startDate: "2025-05-20T10:00:00",
    endDate: "2025-05-20T16:00:00",
    organizer: "Onboarding Team",
    status: "upcoming",
    budget: 150000,
    attendeeCount: 15,
    createdAt: "2025-04-25T09:15:00",
    updatedAt: "2025-04-25T09:15:00",
  },
  {
    id: "3",
    title: "Leadership Workshop",
    description: "Workshop for department managers on effective leadership strategies",
    eventType: "workshop",
    location: "Executive Conference Room, 5th Floor",
    startDate: "2025-04-10T13:00:00",
    endDate: "2025-04-10T17:00:00",
    organizer: "Training & Development",
    status: "completed",
    budget: 350000,
    attendeeCount: 25,
    createdAt: "2025-03-01T10:30:00",
    updatedAt: "2025-04-11T09:00:00",
  },
  {
    id: "4",
    title: "Team Building Retreat",
    description: "Offsite team building activities for the IT department",
    eventType: "team-building",
    location: "Lakeside Resort, Abuja",
    startDate: "2025-07-25T08:00:00",
    endDate: "2025-07-27T16:00:00",
    organizer: "IT Department",
    status: "upcoming",
    budget: 2000000,
    attendeeCount: 40,
    createdAt: "2025-02-15T11:45:00",
    updatedAt: "2025-03-01T13:20:00",
  },
  {
    id: "5",
    title: "Product Launch Event",
    description: "Official launch of our new digital service platform",
    eventType: "launch",
    location: "Civic Center, Victoria Island",
    startDate: "2025-05-05T18:00:00",
    endDate: "2025-05-05T21:00:00",
    organizer: "Marketing Team",
    status: "upcoming",
    budget: 3500000,
    attendeeCount: 150,
    createdAt: "2025-01-20T14:00:00",
    updatedAt: "2025-03-15T16:10:00",
  },
  {
    id: "6",
    title: "Quarterly Town Hall",
    description: "Quarterly company-wide meeting to discuss performance and goals",
    eventType: "meeting",
    location: "Main Auditorium",
    startDate: "2025-04-01T14:00:00",
    endDate: "2025-04-01T16:00:00",
    organizer: "Executive Office",
    status: "completed",
    budget: 200000,
    attendeeCount: 200,
    createdAt: "2025-03-01T09:00:00",
    updatedAt: "2025-04-02T10:15:00",
  },
  {
    id: "7",
    title: "Charity Fundraiser",
    description: "Annual charity event to raise funds for local education initiatives",
    eventType: "charity",
    location: "Community Center",
    startDate: "2025-08-15T17:00:00",
    endDate: "2025-08-15T21:00:00",
    organizer: "CSR Committee",
    status: "upcoming",
    budget: 1500000,
    attendeeCount: 100,
    createdAt: "2025-03-10T13:30:00",
    updatedAt: "2025-03-10T13:30:00",
  },
  {
    id: "8",
    title: "IT Security Training",
    description: "Mandatory security awareness training for all staff",
    eventType: "training",
    location: "Online (Zoom)",
    startDate: "2025-04-22T10:00:00",
    endDate: "2025-04-22T12:00:00",
    organizer: "IT Security Team",
    status: "upcoming",
    budget: 100000,
    attendeeCount: 300,
    createdAt: "2025-03-15T11:00:00",
    updatedAt: "2025-03-20T14:45:00",
  },
]

// Event types for dropdown
const eventTypes = [
  { value: "conference", label: "Conference" },
  { value: "workshop", label: "Workshop" },
  { value: "training", label: "Training" },
  { value: "team-building", label: "Team Building" },
  { value: "meeting", label: "Meeting" },
  { value: "orientation", label: "Orientation" },
  { value: "launch", label: "Product Launch" },
  { value: "charity", label: "Charity Event" },
  { value: "social", label: "Social Gathering" },
  { value: "other", label: "Other" },
]

// Status options for dropdown
const statusOptions = [
  { value: "upcoming", label: "Upcoming" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "postponed", label: "Postponed" },
]

export default function EventsContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  // Form fields for adding/editing events
  const eventFormFields: FormField[] = [
    {
      name: "title",
      label: "Event Title",
      type: "text",
      placeholder: "Enter event title",
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Enter event description",
      required: true,
    },
    {
      name: "eventType",
      label: "Event Type",
      type: "select",
      options: eventTypes,
      required: true,
    },
    {
      name: "location",
      label: "Location",
      type: "text",
      placeholder: "Enter event location",
      required: true,
    },
    {
      name: "startDate",
      label: "Start Date & Time",
      type: "date",
      required: true,
    },
    {
      name: "endDate",
      label: "End Date & Time",
      type: "date",
      required: true,
    },
    {
      name: "organizer",
      label: "Organizer",
      type: "text",
      placeholder: "Enter organizer name or department",
      required: true,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: statusOptions,
      required: true,
    },
    {
      name: "budget",
      label: "Budget (₦)",
      type: "number",
      placeholder: "Enter budget amount",
      required: true,
    },
    {
      name: "attendeeCount",
      label: "Expected Attendees",
      type: "number",
      placeholder: "Enter expected number of attendees",
      required: true,
    },
  ]

  // Table columns for events
  const columns = [
    {
      key: "title",
      label: "Event Title",
      sortable: true,
    },
    {
      key: "eventType",
      label: "Type",
      sortable: true,
      render: (value: string) => {
        const eventType = eventTypes.find((type) => type.value === value)
        return <Badge variant="outline">{eventType?.label || value}</Badge>
      },
    },
    {
      key: "startDate",
      label: "Start Date",
      sortable: true,
      render: (value: string) => format(new Date(value), "PPP"),
    },
    {
      key: "location",
      label: "Location",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        let badgeClass = ""
        switch (value) {
          case "upcoming":
            badgeClass = "bg-blue-100 text-blue-800"
            break
          case "in-progress":
            badgeClass = "bg-green-100 text-green-800"
            break
          case "completed":
            badgeClass = "bg-gray-100 text-gray-800"
            break
          case "cancelled":
            badgeClass = "bg-red-100 text-red-800"
            break
          case "postponed":
            badgeClass = "bg-yellow-100 text-yellow-800"
            break
          default:
            badgeClass = "bg-gray-100 text-gray-800"
        }
        return <Badge className={badgeClass}>{value.charAt(0).toUpperCase() + value.slice(1)}</Badge>
      },
    },
    {
      key: "attendeeCount",
      label: "Attendees",
      sortable: true,
      render: (value: number) => value.toLocaleString(),
    },
  ]

  // Filter options for events
  const filterOptions = [
    {
      id: "eventType",
      label: "Event Type",
      options: eventTypes,
      type: "select",
    },
    {
      id: "status",
      label: "Status",
      options: statusOptions,
      type: "select",
    },
    {
      id: "startDate",
      label: "Start Date",
      options: [],
      type: "date",
    },
  ]

  // Handle adding a new event
  const handleAddEvent = (data: Record<string, any>) => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      console.log("Adding event:", data)
      setIsLoading(false)
      setIsAddDialogOpen(false)
      // In a real app, you would add the event to the database and refresh the list
    }, 1000)
  }

  // Handle editing an event
  const handleEditEvent = (data: Record<string, any>) => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      console.log("Editing event:", data)
      setIsLoading(false)
      setIsEditDialogOpen(false)
      // In a real app, you would update the event in the database and refresh the list
    }, 1000)
  }

  // Handle deleting an event
  const handleDeleteEvent = (id: string) => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      console.log("Deleting event:", id)
      setIsLoading(false)
      // In a real app, you would delete the event from the database and refresh the list
    }, 1000)
  }

  // Handle viewing event details
  const handleViewEvent = (id: string) => {
    const event = mockEvents.find((event) => event.id === id)
    setSelectedEvent(event)
    setIsViewDialogOpen(true)
  }

  // Handle editing an event
  const handleEditEventClick = (id: string) => {
    const event = mockEvents.find((event) => event.id === id)
    setSelectedEvent(event)
    setIsEditDialogOpen(true)
  }

  // Detail tabs for event view
  const eventDetailTabs: DetailTab[] = [
    {
      id: "details",
      label: "Event Details",
      sections: [
        {
          title: "Basic Information",
          fields: [
            { label: "Event Title", value: selectedEvent?.title },
            {
              label: "Event Type",
              value: selectedEvent?.eventType,
              type: "badge",
              options: {
                statusMap: Object.fromEntries(
                  eventTypes.map((type) => [type.value, { label: type.label, color: "bg-gray-100 text-gray-800" }]),
                ),
              },
            },
            {
              label: "Status",
              value: selectedEvent?.status,
              type: "status",
              options: {
                statusMap: {
                  upcoming: { label: "Upcoming", color: "bg-blue-100 text-blue-800" },
                  "in-progress": { label: "In Progress", color: "bg-green-100 text-green-800" },
                  completed: { label: "Completed", color: "bg-gray-100 text-gray-800" },
                  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
                  postponed: { label: "Postponed", color: "bg-yellow-100 text-yellow-800" },
                },
              },
            },
            { label: "Description", value: selectedEvent?.description },
          ],
        },
        {
          title: "Date & Location",
          fields: [
            { label: "Start Date & Time", value: selectedEvent?.startDate, type: "date" },
            { label: "End Date & Time", value: selectedEvent?.endDate, type: "date" },
            { label: "Location", value: selectedEvent?.location },
          ],
        },
        {
          title: "Organization",
          fields: [
            { label: "Organizer", value: selectedEvent?.organizer },
            { label: "Budget", value: selectedEvent?.budget, type: "currency", options: { currency: "NGN" } },
            { label: "Expected Attendees", value: selectedEvent?.attendeeCount },
          ],
        },
      ],
    },
    {
      id: "attendees",
      label: "Attendees",
      sections: [
        {
          title: "Attendee Management",
          fields: [
            { label: "Total Registered", value: selectedEvent?.attendeeCount },
            { label: "Capacity", value: selectedEvent?.attendeeCount + 50 },
            { label: "Check-in Status", value: "Not started", type: "status" },
          ],
        },
      ],
      content: (
        <div className="p-4 text-center text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Attendee List</h3>
          <p>Attendee management features will be available here.</p>
          <p className="mt-2 text-sm">You can add, remove, and manage attendees for this event.</p>
        </div>
      ),
    },
    {
      id: "resources",
      label: "Resources",
      sections: [],
      content: (
        <div className="p-4 text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Event Resources</h3>
          <p>Upload and manage resources related to this event.</p>
          <p className="mt-2 text-sm">Documents, presentations, and other materials can be stored here.</p>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Events Management</h1>
          <p className="text-muted-foreground">Create and manage organization events and activities.</p>
        </div>
      </div>

      <EnhancedDataTable
        title="Events"
        columns={columns}
        data={mockEvents}
        filterOptions={filterOptions}
        onAdd={() => setIsAddDialogOpen(true)}
        onEdit={handleEditEventClick}
        onDelete={handleDeleteEvent}
        onView={handleViewEvent}
        isLoading={isLoading}
      />

      {/* Add Event Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <EnhancedForm
            fields={eventFormFields}
            onSubmit={handleAddEvent}
            onCancel={() => setIsAddDialogOpen(false)}
            isSubmitting={isLoading}
            submitLabel="Create Event"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <EnhancedForm
            fields={eventFormFields}
            initialValues={selectedEvent}
            onSubmit={handleEditEvent}
            onCancel={() => setIsEditDialogOpen(false)}
            isSubmitting={isLoading}
            submitLabel="Update Event"
          />
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} className="w-full max-w-4xl">
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          {selectedEvent && (
            <DetailsView
              title={selectedEvent.title}
              subtitle={`${format(new Date(selectedEvent.startDate), "PPP")} - ${
                new Date(selectedEvent.startDate).toDateString() !== new Date(selectedEvent.endDate).toDateString()
                  ? format(new Date(selectedEvent.endDate), "PPP")
                  : format(new Date(selectedEvent.endDate), "p")
              }`}
              data={selectedEvent}
              tabs={eventDetailTabs}
              onEdit={() => {
                setIsViewDialogOpen(false)
                setIsEditDialogOpen(true)
              }}
              onPrint={() => console.log("Print event:", selectedEvent.id)}
              onExport={() => console.log("Export event:", selectedEvent.id)}
              headerContent={
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(selectedEvent.startDate), "PPP")}
                      {new Date(selectedEvent.startDate).toDateString() !==
                        new Date(selectedEvent.endDate).toDateString() && (
                        <> - {format(new Date(selectedEvent.endDate), "PPP")}</>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(new Date(selectedEvent.startDate), "p")} - {format(new Date(selectedEvent.endDate), "p")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedEvent.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <User className="h-4 w-4" />
                    <span>{selectedEvent.organizer}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>{selectedEvent.attendeeCount} attendees</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <DollarSign className="h-4 w-4" />
                    <span>₦{selectedEvent.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Tag className="h-4 w-4" />
                    <span>
                      {eventTypes.find((type) => type.value === selectedEvent.eventType)?.label ||
                        selectedEvent.eventType}
                    </span>
                  </div>
                </div>
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
