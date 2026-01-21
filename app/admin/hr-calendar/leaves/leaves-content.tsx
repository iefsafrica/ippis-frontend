"use client"

import { useMemo, useState } from "react"
import { CalendarDays, Edit, Eye, RefreshCw, Trash2, User } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { useDeleteLeave, useGetLeaves, useUpdateLeave } from "@/services/hooks/calendar/leaves"
import type { Leave } from "@/types/calendar/leaves"
import { AddLeaveDialog } from "./add-leave-dialog"
import { EditLeaveDialog } from "./edit-leave-dialog"
import { ViewLeaveDialog } from "./view-leave-dialog"

const statusBadgeClasses: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
}

const leaveSearchFields = [
  { name: "employee_name", label: "Employee Name", type: "text" as const },
  { name: "employee_id", label: "Employee ID", type: "text" as const },
  { name: "leave_type", label: "Leave Type", type: "text" as const },
  { name: "status", label: "Status", type: "select" as const, options: [
    { value: "", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ] },
  { name: "start_date", label: "Start Date", type: "date" as const },
]


export function LeavesContent() {
  const [currentLeave, setCurrentLeave] = useState<Leave | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const {
    data: leavesResponse,
    isLoading: isLoadingLeaves,
    isError: isLeavesError,
    error: leavesError,
    refetch: refetchLeaves,
  } = useGetLeaves()

  const updateLeaveMutation = useUpdateLeave()
  const deleteLeaveMutation = useDeleteLeave()

  const leaves = leavesResponse?.data || []
  const sortedLeaves = useMemo(() => [...leaves].sort((a, b) => b.id - a.id), [leaves])

  const totalCount = sortedLeaves.length
  const pendingCount = sortedLeaves.filter((leave) => leave.status === "pending").length
  const approvedCount = sortedLeaves.filter((leave) => leave.status === "approved").length
  const rejectedCount = sortedLeaves.filter((leave) => leave.status === "rejected").length

  const handleManualRefresh = () => {
    refetchLeaves()
    toast.info("Refreshing leaves...")
  }

  const handleAddLeave = () => {
    setCurrentLeave(null)
    setIsAddDialogOpen(true)
  }

  const handleViewLeave = (id: number) => {
    const leave = sortedLeaves.find((item) => item.id === id)
    if (!leave) {
      toast.error("Leave request not found")
      return
    }
    setCurrentLeave(leave)
    setIsViewDialogOpen(true)
  }

  const handleEditLeave = (id: number) => {
    const leave = sortedLeaves.find((item) => item.id === id)
    if (!leave) {
      toast.error("Leave request not found")
      return
    }
    setCurrentLeave(leave)
    setIsEditDialogOpen(true)
  }

  const handleOpenDeleteDialog = (id: number) => {
    const leave = sortedLeaves.find((item) => item.id === id)
    if (!leave) {
      toast.error("Leave request not found")
      return
    }
    setCurrentLeave(leave)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteLeave = async () => {
    if (!currentLeave) return
    try {
      await deleteLeaveMutation.mutateAsync(currentLeave.id)
      toast.success("Leave deleted successfully")
      setIsDeleteDialogOpen(false)
      setCurrentLeave(null)
    } catch (error: any) {
      toast.error(error.message || "Failed to delete leave")
    }
  }

  const isBusy = updateLeaveMutation.isPending || deleteLeaveMutation.isPending

  const columns = [
    {
      key: "employee_name",
      label: "Employee",
      sortable: true,
      render: (value: string, row: Leave) => (
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center mr-3">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate max-w-[200px]">{value}</div>
            <div className="text-xs text-gray-500 truncate max-w-[200px]">{row.employee_id}</div>
          </div>
        </div>
      ),
    },
    {
      key: "leave_type",
      label: "Leave Type",
      sortable: true,
      render: (value: string) => <span className="text-sm text-gray-700">{value}</span>,
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
        const badgeClass = statusBadgeClasses[value] || "bg-gray-100 text-gray-800"
        return <Badge className={badgeClass}>{value}</Badge>
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: Leave) => (
        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="icon" onClick={() => handleViewLeave(row.id)} title="View Details">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleEditLeave(row.id)} title="Edit">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleOpenDeleteDialog(row.id)} title="Delete">
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ]

  if (isLoadingLeaves) {
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

  if (isLeavesError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-10">
            <p className="text-red-500 font-medium">Error loading leaves</p>
            <p className="text-gray-600 mt-1 text-sm">{leavesError?.message}</p>
            <button
              onClick={() => refetchLeaves()}
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
            <CalendarDays className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Leave Requests
            </h1>
            <p className="text-gray-600 mt-1">
              Manage employee leave requests
              {leavesResponse?.data && (
                <span className="ml-2 text-sm text-gray-500">({totalCount} leaves)</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleManualRefresh}
            disabled={isBusy}
            className="h-10 px-3.5 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Refresh</span>
          </Button>
          <Button
            onClick={handleAddLeave}
            disabled={isBusy}
            className="h-10 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg"
          >
            Add Leave
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center mr-3">
                <span className="text-blue-800 font-bold">{totalCount}</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
                <p className="text-xs text-gray-500 mt-1">All leave requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-yellow-100 border border-yellow-200 flex items-center justify-center mr-3">
                <span className="text-yellow-800 font-bold">{pendingCount}</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{pendingCount}</div>
                <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-green-100 border border-green-200 flex items-center justify-center mr-3">
                <span className="text-green-800 font-bold">{approvedCount}</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{approvedCount}</div>
                <p className="text-xs text-gray-500 mt-1">Approved leaves</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center mr-3">
                <span className="text-red-800 font-bold">{rejectedCount}</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{rejectedCount}</div>
                <p className="text-xs text-gray-500 mt-1">Rejected leaves</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Leave Requests</CardTitle>
              <CardDescription className="text-gray-600">
                View and manage employee leave requests
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            title="Leaves"
            columns={columns}
            data={sortedLeaves}
            searchFields={leaveSearchFields}
            onAdd={handleAddLeave}
          />
        </CardContent>
      </Card>

      <AddLeaveDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
      />

      <EditLeaveDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setCurrentLeave(null)
        }}
        leave={currentLeave}
      />

      {currentLeave && (
        <ViewLeaveDialog
          isOpen={isViewDialogOpen}
          onClose={() => {
            setIsViewDialogOpen(false)
            setCurrentLeave(null)
          }}
          leave={currentLeave}
        />
      )}

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setCurrentLeave(null)
        }}
        onConfirm={handleDeleteLeave}
        title="Delete Leave Request"
        description={`Are you sure you want to delete the leave request for ${currentLeave?.employee_name}?`}
        itemName={`${currentLeave?.employee_name || "Employee"}'s leave`}
        isLoading={deleteLeaveMutation.isPending}
      />
    </div>
  )
}
