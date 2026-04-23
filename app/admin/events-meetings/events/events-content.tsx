"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Calendar as CalendarIcon, Eye, Edit, Trash2, Briefcase, Loader2, RefreshCw, MapPin } from "lucide-react"
import { CoreHRClientWrapper } from "@/app/admin/core-hr/components/core-hr-client-wrapper"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { StatusChangeDialog } from "@/app/admin/core-hr/components/status-change-dialog"
import { AddCalendarEventDialog } from "@/app/admin/hr-calendar/add-calendar-event-dialog"
import { EditCalendarEventDialog } from "@/app/admin/hr-calendar/edit-calendar-event-dialog"
import { ViewCalendarEventDialog } from "@/app/admin/hr-calendar/view-calendar-event-dialog"
import { useDeleteCalendarEvent, useGetCalendarEvents, useUpdateCalendarEvent } from "@/services/hooks/calendar/events"
import type { CalendarEvent } from "@/types/calendar/events"
import { format } from "date-fns"
import { toast } from "sonner"

export function EventsContent() {
  const { data, isLoading, error, refetch } = useGetCalendarEvents()
  const deleteCalendarEventMutation = useDeleteCalendarEvent()
  const updateCalendarEventMutation = useUpdateCalendarEvent()
  const [currentEvent, setCurrentEvent] = useState<CalendarEvent | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [eventToUpdateStatus, setEventToUpdateStatus] = useState<CalendarEvent | null>(null)

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ]

  const events = useMemo(() => data?.data ?? [], [data])
  const sortedEvents = useMemo(() => [...events].sort((a, b) => b.id - a.id), [events])

  const stats = useMemo(
    () => ({
      total: sortedEvents.length,
      scheduled: sortedEvents.filter((event) => event.status === "scheduled").length,
      completed: sortedEvents.filter((event) => event.status === "completed").length,
    }),
    [sortedEvents],
  )

  useEffect(() => {
    if (error) toast.error("Unable to load calendar events")
  }, [error])

  const handleRefresh = async () => {
    try {
      await refetch()
      toast.success("Calendar events refreshed")
    } catch {
      toast.error("Unable to refresh calendar events")
    }
  }

  const handleAddEvent = () => {
    setCurrentEvent(null)
    setIsAddDialogOpen(true)
  }

  const handleViewEvent = useCallback(
    (id: number) => {
      const event = sortedEvents.find((item) => item.id === id)
      if (!event) {
        toast.error("Calendar event not found")
        return
      }
      setCurrentEvent(event)
      setIsViewDialogOpen(true)
    },
    [sortedEvents],
  )

  const handleEditEvent = useCallback(
    (id: number) => {
      const event = sortedEvents.find((item) => item.id === id)
      if (!event) {
        toast.error("Calendar event not found")
        return
      }
      setCurrentEvent(event)
      setIsEditDialogOpen(true)
    },
    [sortedEvents],
  )

  const handleOpenDeleteDialog = useCallback(
    (id: number) => {
      const event = sortedEvents.find((item) => item.id === id)
      if (!event) {
        toast.error("Calendar event not found")
        return
      }
      setCurrentEvent(event)
      setIsDeleteDialogOpen(true)
    },
    [sortedEvents],
  )

  const handleOpenStatusDialog = useCallback(
    (id: number) => {
      const event = sortedEvents.find((item) => item.id === id)
      if (!event) {
        toast.error("Calendar event not found")
        return
      }
      setEventToUpdateStatus(event)
      setIsStatusDialogOpen(true)
    },
    [sortedEvents],
  )

  const handleDeleteEvent = async () => {
    if (!currentEvent) return
    try {
      await deleteCalendarEventMutation.mutateAsync(currentEvent.id)
      toast.success("Calendar event deleted successfully")
      setIsDeleteDialogOpen(false)
      setCurrentEvent(null)
    } catch (deleteError: any) {
      toast.error(deleteError.message || "Failed to delete calendar event")
    }
  }

  const handleStatusUpdate = async (status: string) => {
    if (!eventToUpdateStatus) return
    try {
      await updateCalendarEventMutation.mutateAsync({
        id: eventToUpdateStatus.id,
        status,
      })
      toast.success("Calendar event status updated successfully")
      setIsStatusDialogOpen(false)
    } catch (statusError: any) {
      toast.error(statusError.message || "Failed to update calendar event status")
    }
  }

  const columns = useMemo(
    () => [
      {
        key: "title",
        label: "Event Title",
        sortable: true,
        render: (value: string, row: CalendarEvent) => (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 truncate">{value}</span>
            <span className="text-xs text-gray-500 truncate">{row.department}</span>
          </div>
        ),
      },
      {
        key: "event_type",
        label: "Type",
        sortable: true,
      },
      {
        key: "start_date",
        label: "Start Date",
        sortable: true,
        render: (value: string) => format(new Date(value), "PPP"),
      },
      {
        key: "location",
        label: "Location",
        sortable: true,
        render: (value: string) => (
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-gray-500" />
            {value}
          </div>
        ),
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
      },
      {
        key: "actions",
        label: "Actions",
        render: (_: any, row: CalendarEvent) => (
          <div className="flex justify-start gap-2">
            <Button variant="outline" size="icon" onClick={() => handleOpenStatusDialog(row.id)} title="Change Status">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleViewEvent(row.id)} title="View">
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
    ],
    [handleEditEvent, handleOpenDeleteDialog, handleOpenStatusDialog, handleViewEvent],
  )

  return (
    <CoreHRClientWrapper title="Events" endpoint="/api/admin/hr/calendar/events">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center shadow-sm">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Events
              </h1>
              <p className="text-gray-600 mt-1">Manage HR calendar events.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    <span className="ml-2 hidden sm:inline">Refresh</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reload calendar events</p>
                </TooltipContent>
                </Tooltip>
              </TooltipProvider>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest">Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.scheduled}</div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Events Overview</CardTitle>
              <CardDescription className="text-gray-600">Browse and manage HR events.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              title="Events"
              columns={columns}
              data={sortedEvents}
              searchFields={[]}
              itemsPerPage={10}
              onAdd={handleAddEvent}
              addButtonLabel="Add Event"
            />
          </CardContent>
        </Card>

        <AddCalendarEventDialog isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} />

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

        {eventToUpdateStatus && (
          <StatusChangeDialog
            isOpen={isStatusDialogOpen}
            onClose={() => {
              setIsStatusDialogOpen(false)
              setEventToUpdateStatus(null)
            }}
            title="Change Event Status"
            description={`Update the status for ${eventToUpdateStatus.title}.`}
            currentStatus={eventToUpdateStatus.status}
            options={statusOptions}
            onConfirm={handleStatusUpdate}
            isLoading={updateCalendarEventMutation.isPending}
          />
        )}
      </div>
    </CoreHRClientWrapper>
  )
}
