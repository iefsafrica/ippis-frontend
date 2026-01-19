"use client"

import { useMemo, useState } from "react"
import { Calendar as CalendarIcon, Edit, Eye, RefreshCw, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { useDeleteCalendarEvent, useGetCalendarEvents } from "@/services/hooks/calendar/events"
import type { CalendarEvent } from "@/types/calendar/events"
import { AddCalendarEventDialog } from "../add-calendar-event-dialog"
import { EditCalendarEventDialog } from "../edit-calendar-event-dialog"
import { ViewCalendarEventDialog } from "../view-calendar-event-dialog"

const eventTypeBadgeClasses: Record<string, string> = {
  holiday: "bg-red-100 text-red-800",
  meeting: "bg-blue-100 text-blue-800",
  training: "bg-green-100 text-green-800",
  deadline: "bg-orange-100 text-orange-800",
  other: "bg-gray-100 text-gray-800",
}

const statusBadgeClasses: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
}

const calendarSearchFields = [
  { name: "title", label: "Title", type: "text" as const },
  { name: "department", label: "Department", type: "text" as const },
  {
    name: "event_type",
    label: "Event Type",
    type: "select" as const,
    options: [
      { value: "holiday", label: "Holiday" },
      { value: "meeting", label: "Meeting" },
      { value: "training", label: "Training" },
      { value: "deadline", label: "Deadline" },
      { value: "other", label: "Other" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { value: "", label: "All" },
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
  { name: "start_date", label: "Start Date", type: "date" as const },
]

export function CalendarEventsContent() {
  const [currentEvent, setCurrentEvent] = useState<CalendarEvent | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const {
    data: calendarEventsResponse,
    isLoading: isLoadingCalendarEvents,
    isError: isCalendarEventsError,
    error: calendarEventsError,
    refetch: refetchCalendarEvents,
  } = useGetCalendarEvents()

  const deleteCalendarEventMutation = useDeleteCalendarEvent()

  const calendarEvents = calendarEventsResponse?.data || []
  const sortedCalendarEvents = useMemo(() => {
    return [...calendarEvents].sort((a, b) => a.id - b.id)
  }, [calendarEvents])

  const totalCount = sortedCalendarEvents.length
  const activeCount = sortedCalendarEvents.filter((event) => event.status === "active").length
  const inactiveCount = sortedCalendarEvents.filter((event) => event.status !== "active").length

  const handleAddEvent = () => {
    setCurrentEvent(null)
    setIsAddDialogOpen(true)
  }

  const handleViewEvent = (id: number) => {
    const event = sortedCalendarEvents.find((item) => item.id === id)
    if (!event) {
      toast.error("Calendar event not found")
      return
    }
    setCurrentEvent(event)
    setIsViewDialogOpen(true)
  }

  const handleEditEvent = (id: number) => {
    const event = sortedCalendarEvents.find((item) => item.id === id)
    if (!event) {
      toast.error("Calendar event not found")
      return
    }
    setCurrentEvent(event)
    setIsEditDialogOpen(true)
  }

  const handleOpenDeleteDialog = (id: number) => {
    const event = sortedCalendarEvents.find((item) => item.id === id)
    if (!event) {
      toast.error("Calendar event not found")
      return
    }
    setCurrentEvent(event)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteEvent = async () => {
    if (!currentEvent) return
    try {
      await deleteCalendarEventMutation.mutateAsync(currentEvent.id)
      toast.success("Calendar event deleted successfully")
      setIsDeleteDialogOpen(false)
      setCurrentEvent(null)
    } catch (error: any) {
      toast.error(error.message || "Failed to delete calendar event")
    }
  }

  const handleManualRefresh = () => {
    refetchCalendarEvents()
    toast.info("Refreshing calendar events...")
  }

  const columns = [
    {
      key: "title",
      label: "Event",
      sortable: true,
      render: (value: string, row: CalendarEvent) => (
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center mr-3">
            <CalendarIcon className="h-4 w-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate max-w-[200px]">{value}</div>
            <div className="text-xs text-gray-500 truncate max-w-[200px]">{row.department}</div>
          </div>
        </div>
      ),
    },
    {
      key: "event_type",
      label: "Type",
      sortable: true,
      render: (value: string) => {
        const key = (value || "other").toLowerCase()
        const badgeClass = eventTypeBadgeClasses[key] || eventTypeBadgeClasses.other
        return <Badge className={badgeClass}>{value || "Other"}</Badge>
      },
    },
    {
      key: "start_date",
      label: "Start Date",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "end_date",
      label: "End Date",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        const badgeClass = statusBadgeClasses[value] || statusBadgeClasses.inactive
        return <Badge className={badgeClass}>{value || "inactive"}</Badge>
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: CalendarEvent) => (
        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="icon" onClick={() => handleViewEvent(row.id)} title="View Details">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleEditEvent(row.id)} title="Edit">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleOpenDeleteDialog(row.id)} title="Delete">
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ]

  if (isLoadingCalendarEvents) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 border border-blue-200 animate-pulse" />
            <div>
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-40 bg-gray-200 rounded animate-pulse mt-2" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-xl shadow border border-gray-200 animate-pulse" />
          ))}
        </div>
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex flex-col space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4" />
            <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (isCalendarEventsError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-10">
            <p className="text-red-500 font-medium">Error loading calendar events</p>
            <p className="text-gray-600 mt-1 text-sm">{calendarEventsError?.message}</p>
            <button
              onClick={() => refetchCalendarEvents()}
              className="mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium shadow-sm hover:shadow-md transition-all"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shadow-sm">
            <CalendarIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Calendar Events
            </h1>
            <p className="text-gray-600 mt-1">
              Manage HR calendar events
              {calendarEventsResponse?.data && (
                <span className="ml-2 text-sm text-gray-500">({totalCount} events)</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleManualRefresh}
            disabled={deleteCalendarEventMutation.isPending}
            className="h-10 px-3.5 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Refresh</span>
          </Button>
          <Button
            onClick={handleAddEvent}
            disabled={deleteCalendarEventMutation.isPending}
            className="h-10 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg"
          >
            Add Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center mr-3">
                <span className="text-blue-800 font-bold">{totalCount}</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
                <p className="text-xs text-gray-500 mt-1">All calendar events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-green-100 border border-green-200 flex items-center justify-center mr-3">
                <span className="text-green-800 font-bold">{activeCount}</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
                <p className="text-xs text-gray-500 mt-1">Active events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center mr-3">
                <span className="text-gray-800 font-bold">{inactiveCount}</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{inactiveCount}</div>
                <p className="text-xs text-gray-500 mt-1">Inactive events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center mr-3">
                <span className="text-purple-800 font-bold">
                  {new Set(sortedCalendarEvents.map((event) => event.department).filter(Boolean)).size}
                </span>
            </div>
            <div>
                <div className="text-2xl font-bold text-gray-900">
                  {new Set(sortedCalendarEvents.map((event) => event.department).filter(Boolean)).size}
                </div>
                <p className="text-xs text-gray-500 mt-1">Departments covered</p>
            </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Calendar Events</CardTitle>
              <CardDescription className="text-gray-600">
                View and manage HR calendar events
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            title="Calendar Events"
            columns={columns}
            data={sortedCalendarEvents}
            searchFields={calendarSearchFields}
            onAdd={handleAddEvent}
          />
        </CardContent>
      </Card>

      <AddCalendarEventDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
      />

      <EditCalendarEventDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setCurrentEvent(null)
        }}
        event={currentEvent}
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

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setCurrentEvent(null)
        }}
        onConfirm={handleDeleteEvent}
        title="Delete Calendar Event"
        description={`Are you sure you want to delete ${currentEvent?.title}?`}
        itemName={currentEvent?.title || "calendar event"}
        isLoading={deleteCalendarEventMutation.isPending}
      />
    </div>
  )
}
