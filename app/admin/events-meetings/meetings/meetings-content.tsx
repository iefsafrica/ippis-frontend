"use client"

import { useState } from "react"
import { EnhancedDataTable } from "@/app/admin/components/enhanced-data-table"
import { EnhancedForm, type FormField } from "@/app/admin/components/enhanced-form"
import { DetailsView, type DetailTab } from "@/app/admin/components/details-view"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, User, CheckSquare, Tag, Video } from "lucide-react"
import { format } from "date-fns"

// Mock data for meetings
const mockMeetings = [
  {
    id: "1",
    title: "Weekly Team Standup",
    agenda: "1. Project updates\n2. Blockers\n3. Next steps",
    meetingType: "team",
    location: "Conference Room A",
    isVirtual: true,
    virtualLink: "https://zoom.us/j/123456789",
    startTime: "2025-05-15T09:00:00",
    endTime: "2025-05-15T09:30:00",
    organizer: "John Adebayo",
    organizerEmail: "john.adebayo@example.com",
    status: "scheduled",
    participants: ["Team Alpha", "Product Managers"],
    participantCount: 12,
    recurring: true,
    recurrencePattern: "weekly",
    createdAt: "2025-01-10T12:00:00",
    updatedAt: "2025-01-15T14:30:00",
  },
  {
    id: "2",
    title: "Project Kickoff: Mobile App Redesign",
    agenda: "1. Project overview\n2. Timeline review\n3. Resource allocation\n4. Q&A",
    meetingType: "project",
    location: "Executive Conference Room",
    isVirtual: false,
    virtualLink: "",
    startTime: "2025-05-20T14:00:00",
    endTime: "2025-05-20T15:30:00",
    organizer: "Amina Ibrahim",
    organizerEmail: "amina.ibrahim@example.com",
    status: "scheduled",
    participants: ["Design Team", "Development Team", "Product Team", "Stakeholders"],
    participantCount: 15,
    recurring: false,
    recurrencePattern: "",
    createdAt: "2025-04-25T09:15:00",
    updatedAt: "2025-04-25T09:15:00",
  },
  {
    id: "3",
    title: "Budget Review Q2",
    agenda: "1. Q2 financial review\n2. Budget adjustments\n3. Forecast for Q3",
    meetingType: "finance",
    location: "Finance Department",
    isVirtual: true,
    virtualLink: "https://teams.microsoft.com/l/meetup-join/123456789",
    startTime: "2025-04-10T10:00:00",
    endTime: "2025-04-10T11:30:00",
    organizer: "Chidi Okonkwo",
    organizerEmail: "chidi.okonkwo@example.com",
    status: "completed",
    participants: ["Finance Team", "Department Heads"],
    participantCount: 8,
    recurring: true,
    recurrencePattern: "quarterly",
    createdAt: "2025-03-01T10:30:00",
    updatedAt: "2025-04-11T09:00:00",
  },
  {
    id: "4",
    title: "Client Presentation: XYZ Corp",
    agenda: "1. Solution overview\n2. Implementation timeline\n3. Pricing discussion\n4. Next steps",
    meetingType: "client",
    location: "Client Office",
    isVirtual: false,
    virtualLink: "",
    startTime: "2025-05-25T13:00:00",
    endTime: "2025-05-25T14:30:00",
    organizer: "Folake Adeleke",
    organizerEmail: "folake.adeleke@example.com",
    status: "scheduled",
    participants: ["Sales Team", "Implementation Team", "Client Representatives"],
    participantCount: 10,
    recurring: false,
    recurrencePattern: "",
    createdAt: "2025-04-15T11:45:00",
    updatedAt: "2025-04-20T13:20:00",
  },
  {
    id: "5",
    title: "HR Policy Updates",
    agenda: "1. New leave policy\n2. Remote work guidelines\n3. Employee feedback",
    meetingType: "hr",
    location: "Training Room B",
    isVirtual: true,
    virtualLink: "https://zoom.us/j/987654321",
    startTime: "2025-05-05T11:00:00",
    endTime: "2025-05-05T12:00:00",
    organizer: "Ngozi Eze",
    organizerEmail: "ngozi.eze@example.com",
    status: "scheduled",
    participants: ["All Staff"],
    participantCount: 150,
    recurring: false,
    recurrencePattern: "",
    createdAt: "2025-04-20T14:00:00",
    updatedAt: "2025-04-25T16:10:00",
  },
  {
    id: "6",
    title: "Board Meeting",
    agenda: "1. Financial performance\n2. Strategic initiatives\n3. Market expansion\n4. Executive appointments",
    meetingType: "board",
    location: "Boardroom",
    isVirtual: false,
    virtualLink: "",
    startTime: "2025-04-01T15:00:00",
    endTime: "2025-04-01T17:00:00",
    organizer: "Oluwaseun Adeyemi",
    organizerEmail: "oluwaseun.adeyemi@example.com",
    status: "completed",
    participants: ["Board Members", "Executive Team"],
    participantCount: 12,
    recurring: true,
    recurrencePattern: "quarterly",
    createdAt: "2025-03-01T09:00:00",
    updatedAt: "2025-04-02T10:15:00",
  },
  {
    id: "7",
    title: "IT Security Briefing",
    agenda: "1. Recent security incidents\n2. New security measures\n3. Staff training requirements",
    meetingType: "it",
    location: "Online",
    isVirtual: true,
    virtualLink: "https://teams.microsoft.com/l/meetup-join/987654321",
    startTime: "2025-05-15T14:00:00",
    endTime: "2025-05-15T15:00:00",
    organizer: "Tunde Bakare",
    organizerEmail: "tunde.bakare@example.com",
    status: "scheduled",
    participants: ["IT Team", "Department Representatives"],
    participantCount: 25,
    recurring: false,
    recurrencePattern: "",
    createdAt: "2025-04-10T13:30:00",
    updatedAt: "2025-04-10T13:30:00",
  },
  {
    id: "8",
    title: "One-on-One: Performance Review",
    agenda: "1. Performance feedback\n2. Goal setting\n3. Career development\n4. Questions and concerns",
    meetingType: "one-on-one",
    location: "Manager's Office",
    isVirtual: false,
    virtualLink: "",
    startTime: "2025-05-22T10:00:00",
    endTime: "2025-05-22T11:00:00",
    organizer: "Chioma Nwosu",
    organizerEmail: "chioma.nwosu@example.com",
    status: "scheduled",
    participants: ["Manager", "Employee"],
    participantCount: 2,
    recurring: false,
    recurrencePattern: "",
    createdAt: "2025-04-15T11:00:00",
    updatedAt: "2025-04-20T14:45:00",
  },
]

// Meeting types for dropdown
const meetingTypes = [
  { value: "team", label: "Team Meeting" },
  { value: "project", label: "Project Meeting" },
  { value: "client", label: "Client Meeting" },
  { value: "board", label: "Board Meeting" },
  { value: "one-on-one", label: "One-on-One" },
  { value: "hr", label: "HR Meeting" },
  { value: "finance", label: "Finance Meeting" },
  { value: "it", label: "IT Meeting" },
  { value: "other", label: "Other" },
]

// Status options for dropdown
const statusOptions = [
  { value: "scheduled", label: "Scheduled" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "rescheduled", label: "Rescheduled" },
]

// Recurrence pattern options
const recurrenceOptions = [
  { value: "", label: "None" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
]

export default function MeetingsContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null)

  // Form fields for adding/editing meetings
  const meetingFormFields: FormField[] = [
    {
      name: "title",
      label: "Meeting Title",
      type: "text",
      placeholder: "Enter meeting title",
      required: true,
    },
    {
      name: "agenda",
      label: "Agenda",
      type: "textarea",
      placeholder: "Enter meeting agenda",
      required: true,
    },
    {
      name: "meetingType",
      label: "Meeting Type",
      type: "select",
      options: meetingTypes,
      required: true,
    },
    {
      name: "isVirtual",
      label: "Virtual Meeting",
      type: "switch",
      description: "Is this a virtual/online meeting?",
    },
    {
      name: "location",
      label: "Location",
      type: "text",
      placeholder: "Enter meeting location",
      required: true,
    },
    {
      name: "virtualLink",
      label: "Virtual Meeting Link",
      type: "text",
      placeholder: "Enter virtual meeting link (Zoom, Teams, etc.)",
    },
    {
      name: "startTime",
      label: "Start Date & Time",
      type: "date",
      required: true,
    },
    {
      name: "endTime",
      label: "End Date & Time",
      type: "date",
      required: true,
    },
    {
      name: "organizer",
      label: "Organizer Name",
      type: "text",
      placeholder: "Enter organizer name",
      required: true,
    },
    {
      name: "organizerEmail",
      label: "Organizer Email",
      type: "email",
      placeholder: "Enter organizer email",
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
      name: "participants",
      label: "Participants",
      type: "textarea",
      placeholder: "Enter participant names or groups (one per line)",
      required: true,
    },
    {
      name: "participantCount",
      label: "Number of Participants",
      type: "number",
      placeholder: "Enter expected number of participants",
      required: true,
    },
    {
      name: "recurring",
      label: "Recurring Meeting",
      type: "switch",
      description: "Is this a recurring meeting?",
    },
    {
      name: "recurrencePattern",
      label: "Recurrence Pattern",
      type: "select",
      options: recurrenceOptions,
    },
  ]

  // Table columns for meetings
  const columns = [
    {
      key: "title",
      label: "Meeting Title",
      sortable: true,
    },
    {
      key: "meetingType",
      label: "Type",
      sortable: true,
      render: (value: string) => {
        const meetingType = meetingTypes.find((type) => type.value === value)
        return <Badge variant="outline">{meetingType?.label || value}</Badge>
      },
    },
    {
      key: "startTime",
      label: "Date & Time",
      sortable: true,
      render: (value: string) => format(new Date(value), "PPP p"),
    },
    {
      key: "location",
      label: "Location",
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center">
          {row.isVirtual && <Video className="h-4 w-4 mr-1 text-blue-500" />}
          {value}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        let badgeClass = ""
        switch (value) {
          case "scheduled":
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
          case "rescheduled":
            badgeClass = "bg-yellow-100 text-yellow-800"
            break
          default:
            badgeClass = "bg-gray-100 text-gray-800"
        }
        return <Badge className={badgeClass}>{value.charAt(0).toUpperCase() + value.slice(1)}</Badge>
      },
    },
    {
      key: "participantCount",
      label: "Participants",
      sortable: true,
      render: (value: number) => value.toLocaleString(),
    },
  ]

  // Filter options for meetings
  const filterOptions = [
    {
      id: "meetingType",
      label: "Meeting Type",
      options: meetingTypes,
      type: "select",
    },
    {
      id: "status",
      label: "Status",
      options: statusOptions,
      type: "select",
    },
    {
      id: "startTime",
      label: "Date",
      options: [],
      type: "date",
    },
    {
      id: "isVirtual",
      label: "Meeting Format",
      options: [
        { value: "true", label: "Virtual" },
        { value: "false", label: "In-Person" },
      ],
      type: "select",
    },
  ]

  // Handle adding a new meeting
  const handleAddMeeting = (data: Record<string, any>) => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      console.log("Adding meeting:", data)
      setIsLoading(false)
      setIsAddDialogOpen(false)
      // In a real app, you would add the meeting to the database and refresh the list
    }, 1000)
  }

  // Handle editing a meeting
  const handleEditMeeting = (data: Record<string, any>) => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      console.log("Editing meeting:", data)
      setIsLoading(false)
      setIsEditDialogOpen(false)
      // In a real app, you would update the meeting in the database and refresh the list
    }, 1000)
  }

  // Handle deleting a meeting
  const handleDeleteMeeting = (id: string) => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      console.log("Deleting meeting:", id)
      setIsLoading(false)
      // In a real app, you would delete the meeting from the database and refresh the list
    }, 1000)
  }

  // Handle viewing meeting details
  const handleViewMeeting = (id: string) => {
    const meeting = mockMeetings.find((meeting) => meeting.id === id)
    setSelectedMeeting(meeting)
    setIsViewDialogOpen(true)
  }

  // Handle editing a meeting
  const handleEditMeetingClick = (id: string) => {
    const meeting = mockMeetings.find((meeting) => meeting.id === id)
    setSelectedMeeting(meeting)
    setIsEditDialogOpen(true)
  }

  // Detail tabs for meeting view
  const meetingDetailTabs: DetailTab[] = [
    {
      id: "details",
      label: "Meeting Details",
      sections: [
        {
          title: "Basic Information",
          fields: [
            { label: "Meeting Title", value: selectedMeeting?.title },
            {
              label: "Meeting Type",
              value: selectedMeeting?.meetingType,
              type: "badge",
              options: {
                statusMap: Object.fromEntries(
                  meetingTypes.map((type) => [type.value, { label: type.label, color: "bg-gray-100 text-gray-800" }]),
                ),
              },
            },
            {
              label: "Status",
              value: selectedMeeting?.status,
              type: "status",
              options: {
                statusMap: {
                  scheduled: { label: "Scheduled", color: "bg-blue-100 text-blue-800" },
                  "in-progress": { label: "In Progress", color: "bg-green-100 text-green-800" },
                  completed: { label: "Completed", color: "bg-gray-100 text-gray-800" },
                  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
                  rescheduled: { label: "Rescheduled", color: "bg-yellow-100 text-yellow-800" },
                },
              },
            },
            {
              label: "Meeting Format",
              value: selectedMeeting?.isVirtual ? "Virtual" : "In-Person",
              type: "badge",
            },
          ],
        },
        {
          title: "Date & Location",
          fields: [
            { label: "Start Time", value: selectedMeeting?.startTime, type: "date", options: { format: "PPP p" } },
            { label: "End Time", value: selectedMeeting?.endTime, type: "date", options: { format: "PPP p" } },
            { label: "Location", value: selectedMeeting?.location },
            {
              label: "Virtual Meeting Link",
              value: selectedMeeting?.virtualLink,
              type: "url",
            },
            {
              label: "Recurring",
              value: selectedMeeting?.recurring ? "Yes" : "No",
            },
            {
              label: "Recurrence Pattern",
              value: selectedMeeting?.recurrencePattern
                ? selectedMeeting.recurrencePattern.charAt(0).toUpperCase() + selectedMeeting.recurrencePattern.slice(1)
                : "None",
            },
          ],
        },
        {
          title: "Organization",
          fields: [
            { label: "Organizer", value: selectedMeeting?.organizer },
            { label: "Organizer Email", value: selectedMeeting?.organizerEmail, type: "email" },
            { label: "Participant Count", value: selectedMeeting?.participantCount },
          ],
        },
      ],
    },
    {
      id: "agenda",
      label: "Agenda",
      sections: [
        {
          title: "Meeting Agenda",
          fields: [{ label: "Agenda Items", value: selectedMeeting?.agenda }],
        },
      ],
    },
    {
      id: "participants",
      label: "Participants",
      sections: [
        {
          title: "Participant Information",
          fields: [
            { label: "Total Participants", value: selectedMeeting?.participantCount },
            { label: "Participant Groups", value: selectedMeeting?.participants.join(", ") },
          ],
        },
      ],
      content: (
        <div className="p-4 text-center text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Participant Management</h3>
          <p>Participant management features will be available here.</p>
          <p className="mt-2 text-sm">You can add, remove, and manage participants for this meeting.</p>
        </div>
      ),
    },
    {
      id: "minutes",
      label: "Minutes & Actions",
      sections: [],
      content: (
        <div className="p-4 text-center text-gray-500">
          <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Meeting Minutes & Action Items</h3>
          <p>Record meeting minutes and track action items.</p>
          <p className="mt-2 text-sm">This feature will allow you to document discussions and assign tasks.</p>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meetings Management</h1>
          <p className="text-muted-foreground">Schedule and manage organization meetings and discussions.</p>
        </div>
      </div>

      <EnhancedDataTable
        title="Meetings"
        columns={columns}
        data={mockMeetings}
        filterOptions={filterOptions}
        onAdd={() => setIsAddDialogOpen(true)}
        onEdit={handleEditMeetingClick}
        onDelete={handleDeleteMeeting}
        onView={handleViewMeeting}
        isLoading={isLoading}
      />

      {/* Add Meeting Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Schedule New Meeting</DialogTitle>
          </DialogHeader>
          <EnhancedForm
            fields={meetingFormFields}
            onSubmit={handleAddMeeting}
            onCancel={() => setIsAddDialogOpen(false)}
            isSubmitting={isLoading}
            submitLabel="Schedule Meeting"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Meeting Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Meeting</DialogTitle>
          </DialogHeader>
          <EnhancedForm
            fields={meetingFormFields}
            initialValues={selectedMeeting}
            onSubmit={handleEditMeeting}
            onCancel={() => setIsEditDialogOpen(false)}
            isSubmitting={isLoading}
            submitLabel="Update Meeting"
          />
        </DialogContent>
      </Dialog>

      {/* View Meeting Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} className="w-full max-w-4xl">
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          {selectedMeeting && (
            <DetailsView
              title={selectedMeeting.title}
              subtitle={format(new Date(selectedMeeting.startTime), "PPP p")}
              data={selectedMeeting}
              tabs={meetingDetailTabs}
              onEdit={() => {
                setIsViewDialogOpen(false)
                setIsEditDialogOpen(true)
              }}
              onPrint={() => console.log("Print meeting:", selectedMeeting.id)}
              onExport={() => console.log("Export meeting:", selectedMeeting.id)}
              headerContent={
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(selectedMeeting.startTime), "PPP")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(new Date(selectedMeeting.startTime), "p")} -{" "}
                      {format(new Date(selectedMeeting.endTime), "p")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedMeeting.location}</span>
                  </div>
                  {selectedMeeting.isVirtual && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Video className="h-4 w-4" />
                      <span>Virtual Meeting</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-500">
                    <User className="h-4 w-4" />
                    <span>{selectedMeeting.organizer}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>{selectedMeeting.participantCount} participants</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Tag className="h-4 w-4" />
                    <span>
                      {meetingTypes.find((type) => type.value === selectedMeeting.meetingType)?.label ||
                        selectedMeeting.meetingType}
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
