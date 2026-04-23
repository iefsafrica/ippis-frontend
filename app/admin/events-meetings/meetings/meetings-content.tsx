"use client"

import { useCallback, useMemo, useEffect, useState } from "react"
import { CoreHRClientWrapper } from "@/app/admin/core-hr/components/core-hr-client-wrapper"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Briefcase, Loader2, RefreshCw } from "lucide-react"
import { StatusChangeDialog } from "@/app/admin/core-hr/components/status-change-dialog"
import { useGetCalendarMeetings, useUpdateCalendarMeeting } from "@/services/hooks/calendar/meetings"
import type { CalendarMeeting } from "@/types/calendar/meetings"
import { toast } from "sonner"

const columns = [
  { key: "meeting_title", label: "Meeting Title", sortable: true },
  { key: "type", label: "Type", sortable: true },
  {
    key: "date_time",
    label: "Date",
    sortable: true,
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
  { key: "location", label: "Location", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "participants", label: "Participants", sortable: true },
]

export function MeetingsContent() {
  const { data, isLoading, error, refetch } = useGetCalendarMeetings()
  const updateCalendarMeetingMutation = useUpdateCalendarMeeting()
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [meetingToUpdateStatus, setMeetingToUpdateStatus] = useState<CalendarMeeting | null>(null)

  const meetings = useMemo(() => data?.data ?? [], [data])

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ]

  const stats = useMemo(
    () => ({
      total: meetings.length,
      upcoming: meetings.filter((meeting) => meeting.status === "active").length,
      virtual: meetings.filter((meeting) => meeting.type?.toLowerCase().includes("virtual")).length,
    }),
    [meetings],
  )

  useEffect(() => {
    if (error) toast.error("Unable to load meetings")
  }, [error])

  const handleRefresh = async () => {
    try {
      await refetch()
      toast.success("Meetings refreshed")
    } catch {
      toast.error("Unable to refresh meetings")
    }
  }

  const handleOpenStatusDialog = useCallback(
    (id: number) => {
      const meeting = meetings.find((item) => item.id === id)
      if (!meeting) {
        toast.error("Meeting not found")
        return
      }
      setMeetingToUpdateStatus(meeting)
      setIsStatusDialogOpen(true)
    },
    [meetings],
  )

  const handleStatusUpdate = async (status: string) => {
    if (!meetingToUpdateStatus) return

    try {
      await updateCalendarMeetingMutation.mutateAsync({
        id: meetingToUpdateStatus.id,
        status,
      })
      toast.success("Meeting status updated successfully")
      setIsStatusDialogOpen(false)
    } catch (statusError: any) {
      toast.error(statusError.message || "Failed to update meeting status")
    }
  }

  const meetingColumns = useMemo(
    () => [
      ...columns,
      {
        key: "actions",
        label: "Actions",
        render: (_: any, row: CalendarMeeting) => (
          <div className="flex justify-start gap-2">
            <Button variant="outline" size="icon" onClick={() => handleOpenStatusDialog(row.id)} title="Change Status">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [handleOpenStatusDialog],
  )

  return (
    <CoreHRClientWrapper title="Meetings" endpoint="/api/admin/hr/calendar/meetings">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center shadow-sm">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Meetings
              </h1>
              <p className="text-gray-600 mt-1">Keep track of organizational meetings.</p>
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
                  <p>Reload meetings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-widest">Total Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-widest">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.upcoming}</div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-widest">Virtual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.virtual}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Meetings Overview</CardTitle>
              <CardDescription className="text-gray-600">Browse meetings with live data.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable title="Meetings" columns={meetingColumns} data={meetings} searchFields={[]} itemsPerPage={10} />
          </CardContent>
        </Card>

        {meetingToUpdateStatus && (
          <StatusChangeDialog
            isOpen={isStatusDialogOpen}
            onClose={() => {
              setIsStatusDialogOpen(false)
              setMeetingToUpdateStatus(null)
            }}
            title="Change Meeting Status"
            description={`Update the status for ${meetingToUpdateStatus.meeting_title}.`}
            currentStatus={meetingToUpdateStatus.status}
            options={statusOptions}
            onConfirm={handleStatusUpdate}
            isLoading={updateCalendarMeetingMutation.isPending}
          />
        )}
      </div>
    </CoreHRClientWrapper>
  )
}
