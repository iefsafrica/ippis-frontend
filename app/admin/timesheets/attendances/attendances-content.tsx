"use client"

import { useMemo, useState } from "react"
import { format, isValid } from "date-fns"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { EnhancedForm, type FormField } from "@/app/admin/components/enhanced-form"
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
import { toast } from "sonner"
import {
  useAttendances,
  useDeleteAttendance,
  useMarkAttendance,
  useUpdateAttendance,
} from "@/services/hooks/timesheets/attendance"
import {
  AttendanceRecord,
  MarkAttendancePayload,
  UpdateAttendancePayload,
} from "@/types/timesheets/attendance"
import { useEmployeesList } from "@/services/hooks/employees/useEmployees"
import { Calendar, Download, Edit, Eye, FileUp, RefreshCw, Trash2, UserCheck } from "lucide-react"

const ATTENDANCE_STATUS_OPTIONS = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "leave", label: "Leave" },
]

const STATUS_BADGE_STYLES: Record<string, string> = {
  present: "bg-green-100 text-green-800",
  absent: "bg-red-100 text-red-800",
  late: "bg-yellow-100 text-yellow-800",
  leave: "bg-blue-100 text-blue-800",
  unknown: "bg-gray-100 text-gray-800",
}

type AttendanceRow = {
  id: string
  employeeId: string
  name: string
  department: string | null
  date: string
  clockIn: string
  clockOut: string
  status: string
  notes: string
}

const parseDateValue = (value?: string) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const formatDateForForm = (value?: string) => {
  const parsed = parseDateValue(value)
  return parsed ? parsed.toISOString().split("T")[0] : ""
}

const getIsoDateValue = (value?: unknown) => {
  if (!value) return ""
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }
  const parsed = value instanceof Date ? value : new Date(value as string)
  if (isValid(parsed)) {
    return format(parsed, "yyyy-MM-dd")
  }
  return ""
}

export function AttendancesContent() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<AttendanceRecord | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [attendanceToDelete, setAttendanceToDelete] = useState<AttendanceRecord | null>(null)
  const attendancesQuery = useAttendances()
  const markAttendanceMutation = useMarkAttendance()
  const updateAttendanceMutation = useUpdateAttendance()
  const deleteAttendanceMutation = useDeleteAttendance()
  const employeesQuery = useEmployeesList()

  const isLoading = attendancesQuery.isFetching

  const tableData = useMemo<AttendanceRow[]>(
    () =>
      attendancesQuery.data?.map((attendance) => ({
        id: attendance.id.toString(),
        employeeId: attendance.employee_code ?? "",
        name: attendance.employee_name,
        department: attendance.department ?? null,
        date: attendance.attendance_date,
        clockIn: attendance.clock_in ?? "",
        clockOut: attendance.clock_out ?? "",
        status: attendance.status,
        notes: attendance.notes ?? "",
      })) ?? [],
    [attendancesQuery.data],
  )

  const departmentOptions = useMemo(() => {
    const unique = new Set<string>()
    tableData.forEach((row) => {
      if (row.department?.trim()) unique.add(row.department)
    })
    return Array.from(unique).map((department) => ({ value: department, label: department }))
  }, [tableData])

  const searchFields = useMemo(
    () => [
      { name: "employeeId", label: "Employee ID", type: "text" },
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
        options: ATTENDANCE_STATUS_OPTIONS,
      },
      { name: "date", label: "Date", type: "date" },
    ],
    [departmentOptions],
  )

  const statusCounts = useMemo(() => {
    return tableData.reduce<Record<string, number>>((acc, row) => {
      const key = row.status?.toLowerCase() ?? "unknown"
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {})
  }, [tableData])

  const totalRecords = tableData.length

  const statsCards = useMemo(
    () => [
      { title: "Present", value: statusCounts.present ?? 0, description: "Employees checked in today" },
      { title: "Absent", value: statusCounts.absent ?? 0, description: "Records marked absent" },
      { title: "Late", value: statusCounts.late ?? 0, description: "Employees who clocked in late" },
      { title: "Total", value: totalRecords, description: "Attendance entries tracked" },
    ],
    [statusCounts, totalRecords],
  )

  const handleRefresh = () => {
    attendancesQuery.refetch()
    toast.success("Attendance refreshed", {
      description: "Showing the latest records.",
    })
  }

  const employeeOptions = useMemo(
    () =>
      (employeesQuery.data?.employees ?? []).map((employee) => {
        const registrationId = employee.registration_id?.trim()
        const sanitizedCode =
          registrationId && registrationId.length
            ? registrationId.replace(/\s+/g, "")
            : employee.id
        return {
          value: sanitizedCode,
          label: `${registrationId ?? employee.id} - ${employee.name}`,
        }
      }),
    [employeesQuery.data],
  )

  const formFields = useMemo<FormField[]>(
    () => [
      {
        name: "employeeId",
        label: "Employee",
        type: "select",
        required: true,
        options: employeeOptions,
      },
      {
        name: "date",
        label: "Date",
        type: "date",
        required: true,
        placeholder: "Select attendance date",
        datePickerVariant: "input",
      },
      {
        name: "clockIn",
        label: "Clock In",
        type: "text",
        placeholder: "HH:MM AM/PM",
      },
      {
        name: "clockOut",
        label: "Clock Out",
        type: "text",
        placeholder: "HH:MM AM/PM",
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: ATTENDANCE_STATUS_OPTIONS,
      },
      {
        name: "notes",
        label: "Notes",
        type: "textarea",
        placeholder: "Add any additional notes here",
        wrapperClassName: "md:col-span-2",
      },
    ],
    [employeeOptions],
  )

  const editFields = useMemo(
    () =>
      formFields.map((field) => {
        if (field.name === "employeeId" || field.name === "date") {
          return { ...field, disabled: true, required: false }
        }
        return field
      }),
    [formFields],
  )

  const editInitialValues = useMemo(() => {
    if (!selectedItem) return undefined
    return {
      ...selectedItem,
      employeeId: selectedItem.employee_code ?? selectedItem.employeeId ?? "",
      date: formatDateForForm(selectedItem.attendance_date),
    }
  }, [selectedItem])

  const columns = [
    {
      key: "employeeId",
      label: "Employee ID",
      sortable: true,
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
    },
    {
      key: "department",
      label: "Department",
      sortable: true,
    },
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (value: string) => {
        const parsedDate = parseDateValue(value)
        if (!parsedDate) {
          return <span className="text-sm text-gray-500">Not set</span>
        }
        return (
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-md border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm flex flex-col items-center justify-center mr-2 flex-shrink-0">
              <Calendar className="h-3 w-3 text-blue-600 mb-0.5" />
              <span className="text-xs font-medium text-blue-700">{parsedDate.getDate()}</span>
            </div>
            <div className="min-w-0">
              <div className="font-medium text-gray-900">
                {parsedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
              <div className="text-xs text-gray-500">
                {parsedDate.toLocaleDateString("en-US", { year: "numeric" })}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      key: "clockIn",
      label: "Clock In",
      sortable: true,
    },
    {
      key: "clockOut",
      label: "Clock Out",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        const normalized = value?.toLowerCase() ?? "unknown"
        const style = STATUS_BADGE_STYLES[normalized] ?? STATUS_BADGE_STYLES.unknown
        return <Badge className={`${style} capitalize`}>{normalized || "Unknown"}</Badge>
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, row: AttendanceRow) => (
        <div className="flex justify-start space-x-2">
          <Button variant="outline" size="icon" onClick={() => handleView(row.id)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="text-blue-600 hover:text-blue-800" onClick={() => handleEdit(row.id)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-red-600 hover:text-red-800"
            onClick={() => openDeleteDialog(row.id)}
            disabled={deleteAttendanceMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const handleAdd = () => {
    setSelectedItem(null)
    setAddDialogOpen(true)
  }

  const handleEdit = (id: string) => {
    const attendance = attendancesQuery.data?.find((item) => item.id.toString() === id)
    if (!attendance) return
    setSelectedItem(attendance)
    setEditDialogOpen(true)
  }

  const handleView = (id: string) => {
    const attendance = attendancesQuery.data?.find((item) => item.id.toString() === id)
    if (!attendance) return
    setSelectedItem(attendance)
    setViewDialogOpen(true)
  }

  const openDeleteDialog = (id: string) => {
    const attendance = attendancesQuery.data?.find((item) => item.id.toString() === id)
    if (!attendance) return
    setAttendanceToDelete(attendance)
    setDeleteDialogOpen(true)
  }

  const handleDelete = () => {
    if (!attendanceToDelete) return
    deleteAttendanceMutation.mutate(Number(attendanceToDelete.id), {
      onSuccess: () => {
        toast.success("Attendance removed", {
          description: "The record has been deleted.",
        })
        attendancesQuery.refetch()
        setDeleteDialogOpen(false)
        setAttendanceToDelete(null)
      },
      onError: (error) => handleMutationError(error, "Unable to delete attendance"),
    })
  }

  const handleSubmitAdd = (data: Record<string, any>) => {
    const attendanceDate = getIsoDateValue(data.date)
    if (!attendanceDate) {
      toast.error("Select a valid date", {
        description: "Please choose an attendance date before saving.",
      })
      return
    }

    const payload: MarkAttendancePayload = {
      employee_code: data.employeeId,
      attendance_date: attendanceDate,
      clock_in: data.clockIn,
      clock_out: data.clockOut,
      status: data.status,
      notes: data.notes ?? "",
    }

    markAttendanceMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Attendance recorded", {
          description: `The attendance entry for ${payload.employee_code} has been saved.`,
        })
        attendancesQuery.refetch()
        setAddDialogOpen(false)
      },
      onError: (error) => handleMutationError(error, "Unable to mark attendance"),
    })
  }

  const handleSubmitEdit = (data: Record<string, any>) => {
    if (!selectedItem) return

    const payload: UpdateAttendancePayload = {
      id: Number(selectedItem.id),
      clock_in: data.clockIn,
      clock_out: data.clockOut,
      status: data.status,
      notes: data.notes ?? "",
    }

    updateAttendanceMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Attendance updated", {
          description: "The changes have been saved.",
        })
        attendancesQuery.refetch()
        setEditDialogOpen(false)
        setSelectedItem(null)
      },
      onError: (error) => handleMutationError(error, "Unable to update attendance"),
    })
  }

  const handleMutationError = (error: unknown, title: string) => {
    const description = error instanceof Error ? error.message : "Something went wrong"
    toast.error(title, {
      description,
    })
  }

  const closeEditModal = () => {
    setEditDialogOpen(false)
    setSelectedItem(null)
  }

  const closeViewModal = () => {
    setViewDialogOpen(false)
    setSelectedItem(null)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-3">
          <div className="hidden h-12 w-12 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm sm:flex sm:items-center sm:justify-center">
            <UserCheck className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Attendance
            </h1>
            <p className="text-gray-600 mt-1">
              Track employee attendance records
              <span className="ml-2 text-sm text-gray-500">({totalRecords} records)</span>
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
          <Button
            className="h-10 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg"
            onClick={handleAdd}
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Mark Attendance
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsCards.map((card) => (
          <Card
            key={card.title}
            className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
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
            title="Attendance Records"
            columns={columns}
            data={tableData}
            searchFields={searchFields}
            onAdd={handleAdd}
            itemsPerPage={10}
          />
        </CardContent>
      </Card>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
            <DialogDescription>Capture daily in/out times and status for payroll accuracy.</DialogDescription>
          </DialogHeader>
          <EnhancedForm
            fields={formFields}
            onSubmit={handleSubmitAdd}
            onCancel={() => setAddDialogOpen(false)}
            isSubmitting={markAttendanceMutation.isPending}
            submitLabel="Save Attendance"
            formClassName="grid gap-4 md:grid-cols-2"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={(open) => (open ? setEditDialogOpen(true) : closeEditModal())}>
        <DialogContent className="p-0 max-w-2xl overflow-hidden border border-gray-200 shadow-xl">
          <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <UserCheck className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">Edit Attendance</DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Adjust clock-in/out times, status, or notes for the selected record.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
            <EnhancedForm
              fields={editFields}
              onSubmit={handleSubmitEdit}
              onCancel={closeEditModal}
              isSubmitting={updateAttendanceMutation.isPending}
              submitLabel="Update Attendance"
              initialValues={editInitialValues}
              formClassName="grid gap-4 md:grid-cols-2"
            />
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setAttendanceToDelete(null)
        }}
        onConfirm={handleDelete}
        title="Delete Attendance"
        description={`Are you sure you want to delete the attendance for ${attendanceToDelete?.employee_name || attendanceToDelete?.employee_code || "this record"}?`}
        itemName={attendanceToDelete?.employee_name || attendanceToDelete?.employee_code || "this record"}
        isLoading={deleteAttendanceMutation.isPending}
      />

      <Dialog open={viewDialogOpen} onOpenChange={(open) => (open ? setViewDialogOpen(true) : closeViewModal())}>
        <DialogContent className="p-0 max-w-3xl overflow-hidden border border-gray-200 shadow-xl">
          <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex items-start">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100 shadow-sm">
                  <UserCheck className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold text-gray-900">Attendance Details</DialogTitle>
                  <DialogDescription className="text-gray-600 mt-1">
                    Review the recorded shift for the selected employee.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6 px-8 pb-8 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Employee</h3>
                  <p className="mt-2 text-lg font-semibold text-gray-900">
                    {selectedItem.employeeId} - {selectedItem.employee_name || selectedItem.employeeId}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{selectedItem.department || "Department not assigned"}</p>
                </section>

                <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status & Date</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge
                      className={`${STATUS_BADGE_STYLES[selectedItem.status?.toLowerCase() ?? "unknown"] ?? STATUS_BADGE_STYLES.unknown} capitalize px-3 py-1.5 text-sm`}
                    >
                      {selectedItem.status}
                    </Badge>
                    <span className="text-sm font-medium text-gray-500">
                      {(() => {
                        const parsed = parseDateValue(selectedItem.attendance_date)
                        return parsed ? format(parsed, "PPP") : "Date not set"
                      })()}
                    </span>
                  </div>
                </section>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <section className="rounded-2xl border border-dashed border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Clock In</h3>
                  <p className="mt-3 text-lg font-medium text-gray-900">{selectedItem.clock_in || "—"}</p>
                </section>
                <section className="rounded-2xl border border-dashed border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Clock Out</h3>
                  <p className="mt-3 text-lg font-medium text-gray-900">{selectedItem.clock_out || "—"}</p>
                </section>
              </div>

              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Notes</h3>
                <p className="mt-2 text-gray-700">{selectedItem.notes || "No notes added for this record."}</p>
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
