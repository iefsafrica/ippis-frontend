"use client"

import { useMemo, useState } from "react"
import { format, differenceInDays, isValid } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { EnhancedForm, type FormField } from "@/app/admin/components/enhanced-form"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { toast } from "sonner"
import { Download, FileUp, RefreshCw, Trash2, UserCheck, Eye, Pencil } from "lucide-react"
import {
  useCreateLeave,
  useDeleteLeave,
  useLeaves,
  useUpdateLeave,
} from "@/services/hooks/timesheets/leaves"
import { useEmployeesList } from "@/services/hooks/employees/useEmployees"
import {
  CreateLeavePayload,
  LeaveRecord,
  UpdateLeavePayload,
} from "@/types/timesheets/leaves"

const LEAVE_TYPE_OPTIONS = [
  { value: "Annual Leave", label: "Annual Leave" },
  { value: "Sick Leave", label: "Sick Leave" },
  { value: "Casual Leave", label: "Casual Leave" },
  { value: "Maternity Leave", label: "Maternity Leave" },
  { value: "Paternity Leave", label: "Paternity Leave" },
  { value: "Bereavement Leave", label: "Bereavement Leave" },
]

const LEAVE_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
]

const STATUS_BADGE_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
}

const parseDateValue = (value?: string | null) => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const formatDateForDisplay = (value?: string | null) => {
  const parsed = parseDateValue(value)
  return parsed ? format(parsed, "PPP") : "Not set"
}

const getIsoDateValue = (value?: string) => {
  if (!value) return ""
  const parsed = new Date(value)
  return isValid(parsed) ? parsed.toISOString() : ""
}

type LeaveRow = {
  id: string
  employeeCode: string
  name: string
  department: string
  leaveType: string
  fromDate: string
  toDate: string
  days: number
  status: string
  reason: string
}

export function ManageLeavesContent() {
  const leavesQuery = useLeaves()
  const createLeaveMutation = useCreateLeave()
  const updateLeaveMutation = useUpdateLeave()
  const deleteLeaveMutation = useDeleteLeave()
  const employeesQuery = useEmployeesList()

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState<LeaveRecord | null>(null)
  const [leaveToDelete, setLeaveToDelete] = useState<LeaveRecord | null>(null)

  const tableData = useMemo<LeaveRow[]>(
    () =>
      leavesQuery.data?.map((leave) => {
        const fromDate = parseDateValue(leave.from_date)
        const toDate = parseDateValue(leave.to_date)
        const days =
          fromDate && toDate
            ? differenceInDays(toDate, fromDate) + 1
            : leave.days ?? 0
        return {
          id: leave.id.toString(),
          employeeCode: leave.employee_code,
          name: leave.employee_name,
          department: leave.department,
          leaveType: leave.leave_type,
          fromDate: leave.from_date,
          toDate: leave.to_date,
          days,
          status: leave.status,
          reason: leave.reason,
        }
      }) ?? [],
    [leavesQuery.data],
  )

  const statusCounts = useMemo(() => {
    return tableData.reduce<Record<string, number>>((acc, row) => {
      const key = row.status?.toLowerCase() ?? "pending"
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {})
  }, [tableData])

  const statsCards = useMemo(
    () => [
      { title: "Pending", value: statusCounts.pending ?? 0, description: "Awaiting review" },
      { title: "Approved", value: statusCounts.approved ?? 0, description: "Leave granted" },
      { title: "Rejected", value: statusCounts.rejected ?? 0, description: "Declined requests" },
      { title: "Total", value: tableData.length, description: "Leave entries" },
    ],
    [statusCounts, tableData],
  )

  const employeeOptions = useMemo(() => {
    return (employeesQuery.data?.employees ?? []).map((employee) => ({
      value: employee.registration_id?.replace(/\s+/g, "") ?? employee.id,
      label: `${employee.name} (${employee.registration_id ?? employee.id})`,
    }))
  }, [employeesQuery.data])

  const departmentOptions = useMemo(() => {
    const departments = tableData.map((row) => row.department).filter(Boolean)
    return Array.from(new Set(departments)).map((department) => ({
      value: department,
      label: department,
    }))
  }, [tableData])

  const searchFields = useMemo<FormField[]>(
    () => [
      { name: "employeeCode", label: "Employee Code", type: "text" },
      { name: "name", label: "Name", type: "text" },
      {
        name: "department",
        label: "Department",
        type: "select",
        options: departmentOptions,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: LEAVE_STATUS_OPTIONS,
      },
    ],
    [departmentOptions],
  )

  const formFields = useMemo<FormField[]>(
    () => [
      {
        name: "employeeCode",
        label: "Employee",
        type: "select",
        placeholder: "Select employee",
        required: true,
        options: employeeOptions,
      },
      {
        name: "leaveType",
        label: "Leave Type",
        type: "select",
        placeholder: "Select leave type",
        required: true,
        options: LEAVE_TYPE_OPTIONS,
      },
      {
        name: "fromDate",
        label: "From Date",
        type: "date",
        required: true,
        datePickerVariant: "input",
      },
      {
        name: "toDate",
        label: "To Date",
        type: "date",
        required: true,
        datePickerVariant: "input",
      },
      {
        name: "reason",
        label: "Reason",
        type: "textarea",
        placeholder: "Tell us why this leave is needed",
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: LEAVE_STATUS_OPTIONS,
        defaultValue: "pending",
      },
    ],
    [employeeOptions],
  )

  const editInitialValues = useMemo(() => {
    if (!selectedLeave) return undefined
    return {
      employeeCode: selectedLeave.employee_code,
      leaveType: selectedLeave.leave_type,
      fromDate: selectedLeave.from_date?.split("T")[0] ?? "",
      toDate: selectedLeave.to_date?.split("T")[0] ?? "",
      reason: selectedLeave.reason,
      status: selectedLeave.status,
    }
  }, [selectedLeave])

  const columns = [
    { key: "employeeCode", label: "Employee Code", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "department", label: "Department", sortable: true },
    { key: "leaveType", label: "Leave Type", sortable: true },
    {
      key: "fromDate",
      label: "From",
      sortable: true,
      render: (value: string) => formatDateForDisplay(value),
    },
    {
      key: "toDate",
      label: "To",
      sortable: true,
      render: (value: string) => formatDateForDisplay(value),
    },
    { key: "days", label: "Days" },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge className={`capitalize ${STATUS_BADGE_STYLES[value?.toLowerCase() ?? "pending"] ?? STATUS_BADGE_STYLES.pending}`}>
          {value || "Pending"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, row: LeaveRow) => (
        <div className="flex items-center justify-start gap-2">
          <Button variant="outline" size="icon" onClick={() => handleView(row.id)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleEdit(row.id)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-red-600 hover:text-red-800"
            onClick={() => openDeleteDialog(row.id)}
            disabled={deleteLeaveMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const isLoading = leavesQuery.isFetching

  const handleRefresh = () => {
    leavesQuery.refetch()
    toast.success("Leaves refreshed", {
      description: "Showing the latest leave requests.",
    })
  }

  const handleAdd = () => {
    setSelectedLeave(null)
    setAddDialogOpen(true)
  }

  const handleEdit = (id: string) => {
    const leave = leavesQuery.data?.find((item) => item.id.toString() === id)
    if (!leave) return
    setSelectedLeave(leave)
    setEditDialogOpen(true)
  }

  const handleView = (id: string) => {
    const leave = leavesQuery.data?.find((item) => item.id.toString() === id)
    if (!leave) return
    setSelectedLeave(leave)
    setViewDialogOpen(true)
  }

  const openDeleteDialog = (id: string) => {
    const leave = leavesQuery.data?.find((item) => item.id.toString() === id)
    if (!leave) return
    setLeaveToDelete(leave)
    setDeleteDialogOpen(true)
  }

  const handleDelete = () => {
    if (!leaveToDelete) return
    deleteLeaveMutation.mutate(Number(leaveToDelete.id), {
      onSuccess: () => {
        toast.success("Leave deleted", {
          description: "The leave request has been removed.",
        })
        leavesQuery.refetch()
        setDeleteDialogOpen(false)
        setLeaveToDelete(null)
      },
      onError: (error) => {
        const description = error instanceof Error ? error.message : "Unable to delete leave"
        toast.error("Delete failed", { description })
        setDeleteDialogOpen(false)
      },
    })
  }

  const handleSubmitAdd = (data: Record<string, any>) => {
    const payload: CreateLeavePayload = {
      employee_code: data.employeeCode,
      leave_type: data.leaveType,
      from_date: getIsoDateValue(data.fromDate),
      to_date: getIsoDateValue(data.toDate),
      reason: data.reason ?? "",
      status: data.status ?? "pending",
    }

    createLeaveMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Leave created", { description: "Leave request has been saved." })
        leavesQuery.refetch()
        setAddDialogOpen(false)
      },
      onError: (error) => {
        const description = error instanceof Error ? error.message : "Unable to create leave"
        toast.error("Creation failed", { description })
      },
    })
  }

  const handleSubmitEdit = (data: Record<string, any>) => {
    if (!selectedLeave) return

    const payload: UpdateLeavePayload = {
      id: Number(selectedLeave.id),
      leave_type: data.leaveType,
      from_date: getIsoDateValue(data.fromDate),
      to_date: getIsoDateValue(data.toDate),
      reason: data.reason ?? "",
      status: data.status ?? selectedLeave.status,
    }

    updateLeaveMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Leave updated", { description: "Changes have been applied." })
        leavesQuery.refetch()
        setEditDialogOpen(false)
        setSelectedLeave(null)
      },
      onError: (error) => {
        const description = error instanceof Error ? error.message : "Unable to update leave"
        toast.error("Update failed", { description })
      },
    })
  }

  const closeEditModal = () => {
    setEditDialogOpen(false)
    setSelectedLeave(null)
  }

  const closeViewModal = () => {
    setViewDialogOpen(false)
    setSelectedLeave(null)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-3">
          <div className="hidden h-12 w-12 rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-white shadow-sm sm:flex sm:items-center sm:justify-center">
            <UserCheck className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Leaves</h1>
            <p className="text-gray-600 mt-1">
              Review and process leave requests
              <span className="ml-2 text-sm text-gray-500">({tableData.length} entries)</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="h-10 px-3.5 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Refresh</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-3.5 border-gray-300 text-gray-700 font-medium rounded-lg"
          >
            <FileUp className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-3.5 border-gray-300 text-gray-700 font-medium rounded-lg"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsCards.map((card) => (
          <Card key={card.title} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              <p className="text-xs text-gray-500 mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <DataTable
            title="Leave Requests"
            columns={columns}
            data={tableData}
            onAdd={handleAdd}
            searchFields={searchFields}
            itemsPerPage={10}
          />
        </CardContent>
      </Card>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>New Leave Request</DialogTitle>
            <DialogDescription>Capture leave dates, type, and reason before submitting for approval.</DialogDescription>
          </DialogHeader>
          <EnhancedForm
            fields={formFields}
            onSubmit={handleSubmitAdd}
            onCancel={() => setAddDialogOpen(false)}
            isSubmitting={createLeaveMutation.isPending}
            submitLabel="Save Leave"
            formClassName="grid gap-4 md:grid-cols-2"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={(open) => (open ? setEditDialogOpen(true) : closeEditModal())}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Edit Leave Request</DialogTitle>
            <DialogDescription>Update dates, reason, or status for the selected request.</DialogDescription>
          </DialogHeader>
          <EnhancedForm
            fields={formFields}
            onSubmit={handleSubmitEdit}
            onCancel={closeEditModal}
            isSubmitting={updateLeaveMutation.isPending}
            submitLabel="Update Leave"
            initialValues={editInitialValues}
            formClassName="grid gap-4 md:grid-cols-2"
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setLeaveToDelete(null)
        }}
        onConfirm={handleDelete}
        title="Delete Leave"
        description={`Remove leave for ${leaveToDelete?.employee_name ?? leaveToDelete?.employee_code ?? "this employee"}?`}
        itemName={leaveToDelete?.employee_name ?? leaveToDelete?.employee_code ?? "this request"}
        isLoading={deleteLeaveMutation.isPending}
      />

      <Dialog open={viewDialogOpen} onOpenChange={(open) => (open ? setViewDialogOpen(true) : closeViewModal())}>
        <DialogContent className="p-0 sm:max-w-3xl">
          <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100 shadow-sm">
                <UserCheck className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">Leave Details</DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Review the leave request before taking action.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-6 px-8 pb-8 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Employee</h3>
                  <p className="mt-2 text-lg font-semibold text-gray-900">
                    {selectedLeave.employee_code} - {selectedLeave.employee_name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{selectedLeave.department}</p>
                </section>

                <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status</h3>
                  <Badge
                    className={`mt-3 px-3 py-1.5 text-sm capitalize ${STATUS_BADGE_STYLES[selectedLeave.status?.toLowerCase() ?? "pending"] ?? STATUS_BADGE_STYLES.pending}`}
                  >
                    {selectedLeave.status}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-2">{formatDateForDisplay(selectedLeave.created_at)}</p>
                </section>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <section className="rounded-2xl border border-dashed border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">From</h3>
                  <p className="mt-3 text-lg font-medium text-gray-900">{formatDateForDisplay(selectedLeave.from_date)}</p>
                </section>
                <section className="rounded-2xl border border-dashed border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">To</h3>
                  <p className="mt-3 text-lg font-medium text-gray-900">{formatDateForDisplay(selectedLeave.to_date)}</p>
                </section>
              </div>

              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Reason</h3>
                <p className="mt-2 text-gray-700">{selectedLeave.reason || "No reason provided."}</p>
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
