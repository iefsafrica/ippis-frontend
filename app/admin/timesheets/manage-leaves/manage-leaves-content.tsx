"use client"

import { useMemo, useState } from "react"
import { format, differenceInDays, isValid, isAfter } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { StatusChangeDialog } from "@/app/admin/core-hr/components/status-change-dialog"
import { EnhancedForm, type FormField } from "@/app/admin/components/enhanced-form"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { toast } from "sonner"
import {
  FileUp,
  RefreshCw,
  Trash2,
  UserCheck,
  Eye,
  Pencil,
  ShieldCheck,
  Calendar,
  PlusCircle,
  FileText,
  AlertCircle,
  Ban,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/lib/auth-context"
import { canApproveLeave, isSelfLeave } from "@/lib/leave-permissions"
import {
  useCreateLeave,
  useDeleteLeave,
  useLeaves,
  useUpdateLeave,
} from "@/services/hooks/timesheets/leaves"
import {
  useEmployeeLeaves,
  useEmployeeLeaveBalances,
  useCancelLeave,
} from "@/services/hooks/employee/useEmployeeLeave"
import { useEmployeesList } from "@/services/hooks/employees/useEmployees"
import {
  CreateLeavePayload,
  LeaveRecord,
  UpdateLeavePayload,
} from "@/types/timesheets/leaves"
import type { EmployeeLeaveRequest, LeaveBalanceItem } from "@/types/employee/leave"
import { ApplyLeaveDialog } from "./apply-leave-dialog"
import { LeaveReviewDialog } from "./leave-review-dialog"

const LEAVE_TYPE_OPTIONS = [
  { value: "Annual Leave", label: "Annual Leave" },
  { value: "Sick Leave", label: "Sick Leave" },
  { value: "Casual Leave", label: "Casual Leave" },
  { value: "Maternity Leave", label: "Maternity Leave" },
  { value: "Paternity Leave", label: "Paternity Leave" },
  { value: "Bereavement Leave", label: "Bereavement Leave" },
  { value: "Examination / Study Leave", label: "Examination / Study Leave" },
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
  cancelled: "bg-gray-100 text-gray-700",
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
  originalRecord: LeaveRecord
}

type SearchFieldType = {
  name: string
  label: string
  type: "text" | "select" | "date"
  options?: Array<{ value: string; label: string }>
}

export function ManageLeavesContent() {
  const { user } = useAuth()
  const userCanApprove = canApproveLeave(user)

  // 1. Organization-wide leaves query (GET /api/timesheets/attendance/leaves)
  const leavesQuery = useLeaves()
  const createLeaveMutation = useCreateLeave()
  const updateLeaveMutation = useUpdateLeave()
  const deleteLeaveMutation = useDeleteLeave()
  const employeesQuery = useEmployeesList()

  // 2. Employee self-service queries & mutations
  const [ownStatusFilter, setOwnStatusFilter] = useState<string>("all")
  const ownLeavesQuery = useEmployeeLeaves(ownStatusFilter)
  const balancesQuery = useEmployeeLeaveBalances()
  const cancelLeaveMutation = useCancelLeave()

  // UI state
  const [activeTab, setActiveTab] = useState<"approvals" | "self-service">("approvals")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [applyDialogOpen, setApplyDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  const [selectedLeave, setSelectedLeave] = useState<LeaveRecord | null>(null)
  const [leaveToDelete, setLeaveToDelete] = useState<LeaveRecord | null>(null)
  const [leaveToCancel, setLeaveToCancel] = useState<EmployeeLeaveRequest | null>(null)
  const [statusValue, setStatusValue] = useState("pending")

  const leavesList = useMemo<LeaveRecord[]>(() => {
    return Array.isArray(leavesQuery.data) ? leavesQuery.data : []
  }, [leavesQuery.data])

  const ownLeavesList = useMemo<EmployeeLeaveRequest[]>(() => {
    return Array.isArray(ownLeavesQuery.data) ? ownLeavesQuery.data : []
  }, [ownLeavesQuery.data])

  // Management table data
  const tableData = useMemo<LeaveRow[]>(() => {
    return leavesList.map((leave) => {
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
        originalRecord: leave,
      }
    })
  }, [leavesList])

  const statusCounts = useMemo(() => {
    return tableData.reduce<Record<string, number>>((acc, row) => {
      const key = row.status?.toLowerCase() ?? "pending"
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {})
  }, [tableData])

  const statsCards = useMemo(
    () => [
      { title: "Pending Approvals", value: statusCounts.pending ?? 0, description: "Awaiting supervisor action" },
      { title: "Approved Leaves", value: statusCounts.approved ?? 0, description: "Statutory leave granted" },
      { title: "Rejected Requests", value: statusCounts.rejected ?? 0, description: "Declined applications" },
      { title: "Total In-Scope", value: tableData.length, description: "Active MDA leave records" },
    ],
    [statusCounts, tableData],
  )

  const employeeOptions = useMemo(() => {
    return (employeesQuery.data?.employees ?? []).map((employee) => ({
      value: employee.id,
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

  const searchFields = useMemo<SearchFieldType[]>(
    () => [
      { name: "employeeCode", label: "Employee Code / IPPIS", type: "text" },
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
      },
      {
        name: "toDate",
        label: "To Date",
        type: "date",
        required: true,
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

  const editFields = useMemo(
    () => formFields.filter((field) => field.name !== "status"),
    [formFields],
  )

  const editInitialValues = useMemo(() => {
    if (!selectedLeave) return undefined
    return {
      employeeCode: selectedLeave.employee_code,
      leaveType: selectedLeave.leave_type,
      fromDate: selectedLeave.from_date?.split("T")[0] ?? "",
      toDate: selectedLeave.to_date?.split("T")[0] ?? "",
      reason: selectedLeave.reason,
    }
  }, [selectedLeave])

  const handleReview = (leave: LeaveRecord) => {
    setSelectedLeave(leave)
    setReviewDialogOpen(true)
  }

  const columns = [
    { key: "employeeCode", label: "IPPIS / Code", sortable: true },
    { key: "name", label: "Employee Name", sortable: true },
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
    {
      key: "days",
      label: "Days",
      render: (value: number) => (
        <span className="font-semibold text-slate-800">{value}d</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge
          className={`capitalize ${
            STATUS_BADGE_STYLES[value?.toLowerCase() ?? "pending"] ?? STATUS_BADGE_STYLES.pending
          }`}
        >
          {value || "Pending"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, row: LeaveRow) => {
        const isSelf = isSelfLeave(user, row.originalRecord)
        const canDecide = userCanApprove && !isSelf
        const reviewTooltip = isSelf
          ? "Civil Service PSR: Cannot approve your own leave"
          : !userCanApprove
          ? "Department Heads / Central HR authority required"
          : "Review & Decide (Approve / Reject)"

        return (
          <div className="flex items-center justify-start gap-1.5">
            {/* Review & Approve Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="outline"
                      size="icon"
                      className={`h-8 w-8 ${
                        canDecide
                          ? "text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                          : "text-slate-400 opacity-60 cursor-not-allowed"
                      }`}
                      onClick={() => handleReview(row.originalRecord)}
                    >
                      <ShieldCheck className="h-4 w-4" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{reviewTooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Quick Status Dropdown Dialog */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-amber-600 hover:text-amber-800 disabled:opacity-40 disabled:cursor-not-allowed"
                      onClick={() => openStatusDialog(row.id)}
                      disabled={!canDecide}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {canDecide ? "Quick Status Change" : reviewTooltip}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* View Details */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-slate-600 hover:bg-slate-50"
              onClick={() => handleView(row.id)}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>

            {/* Edit */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-slate-600 hover:bg-slate-50"
              onClick={() => handleEdit(row.id)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>

            {/* Delete */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
              onClick={() => openDeleteDialog(row.id)}
              disabled={deleteLeaveMutation.isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )
      },
    },
  ]

  const handleRefresh = () => {
    leavesQuery.refetch()
    ownLeavesQuery.refetch()
    balancesQuery.refetch()
    toast.success("Refreshed", {
      description: "Showing the latest statutory leave records.",
    })
  }

  const handleAdd = () => {
    setSelectedLeave(null)
    setAddDialogOpen(true)
  }

  const handleEdit = (id: string) => {
    const leave = leavesList.find((item) => item.id.toString() === id)
    if (!leave) return
    setSelectedLeave(leave)
    setEditDialogOpen(true)
  }

  const handleView = (id: string) => {
    const leave = leavesList.find((item) => item.id.toString() === id)
    if (!leave) return
    setSelectedLeave(leave)
    setViewDialogOpen(true)
  }

  const openStatusDialog = (id: string) => {
    const leave = leavesList.find((item) => item.id.toString() === id)
    if (!leave) return
    if (isSelfLeave(user, leave)) {
      toast.error("Civil Service PSR: Nobody can approve or alter their own leave.")
      return
    }
    if (!userCanApprove) {
      toast.error(
        "Leave approval permission required. Department heads and central HR can approve; HR officers cannot."
      )
      return
    }
    setSelectedLeave(leave)
    setStatusValue(leave.status)
    setStatusDialogOpen(true)
  }

  const openDeleteDialog = (id: string) => {
    const leave = leavesList.find((item) => item.id.toString() === id)
    if (!leave) return
    setLeaveToDelete(leave)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
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
        toast.success("Leave created", { description: "Leave record has been saved." })
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

  const handleUpdateStatus = (nextStatus: string) => {
    if (!selectedLeave) return

    if (isSelfLeave(user, selectedLeave)) {
      toast.error("Nobody can approve or modify their own leave.")
      return
    }

    if (!userCanApprove) {
      toast.error(
        "Leave approval permission required. Department heads and central HR can approve; HR officers cannot."
      )
      return
    }

    const payload: UpdateLeavePayload = {
      id: Number(selectedLeave.id),
      status: nextStatus,
    }

    updateLeaveMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Leave status updated", {
          description: "The request status has been updated.",
        })
        leavesQuery.refetch()
        setStatusDialogOpen(false)
        setSelectedLeave(null)
      },
      onError: (error) => {
        const description = error instanceof Error ? error.message : "Unable to update leave status"
        toast.error("Status update failed", { description })
      },
    })
  }

  // Cancel employee's own request
  const handleConfirmCancel = () => {
    if (!leaveToCancel) return

    cancelLeaveMutation.mutate(leaveToCancel.id, {
      onSuccess: () => {
        toast.success("Leave Request Cancelled", {
          description: "Your leave application has been cancelled.",
        })
        setCancelDialogOpen(false)
        setLeaveToCancel(null)
        ownLeavesQuery.refetch()
        balancesQuery.refetch()
      },
      onError: (err: any) => {
        toast.error("Cancellation Failed", {
          description: err?.message || "Could not cancel this leave request.",
        })
        setCancelDialogOpen(false)
      },
    })
  }

  // Check if an own leave can be cancelled (pending, or approved with future start date)
  const canCancelLeave = (req: EmployeeLeaveRequest) => {
    if (req.status === "cancelled" || req.status === "rejected") return false
    if (req.status === "pending") return true
    if (req.status === "approved" && req.from_date) {
      const start = new Date(req.from_date)
      return isValid(start) && isAfter(start, new Date())
    }
    return false
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
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="hidden h-12 w-12 rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-white shadow-sm sm:flex sm:items-center sm:justify-center">
            <UserCheck className="h-6 w-6 text-green-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Leave Management & Approvals
              </h1>
              <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 text-[11px]">
                PSR Chapter 10
              </Badge>
            </div>
            <p className="text-gray-600 mt-1 text-xs">
              Civil Service statutory leave administration, approvals workflow, and personal balance tracking.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-9 px-3 border-gray-300 text-gray-700 font-medium rounded-lg text-xs"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>

          {/* Primary Apply Leave Action */}
          <Button
            size="sm"
            onClick={() => setApplyDialogOpen(true)}
            className="h-9 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg text-xs shadow-sm"
          >
            <PlusCircle className="mr-1.5 h-4 w-4" />
            Apply for Leave
          </Button>
        </div>
      </div>

      {/* Main Tabs: Management Approvals vs Personal Self-Service */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "approvals" | "self-service")}
        className="space-y-6"
      >
        <TabsList className="bg-slate-100 p-1 border border-slate-200">
          <TabsTrigger
            value="approvals"
            className="text-xs px-4 py-2 font-medium data-[state=active]:bg-white data-[state=active]:text-emerald-800 data-[state=active]:shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 mr-2 text-emerald-600" />
            Leave Requests & Approvals ({tableData.length})
          </TabsTrigger>
          <TabsTrigger
            value="self-service"
            className="text-xs px-4 py-2 font-medium data-[state=active]:bg-white data-[state=active]:text-emerald-800 data-[state=active]:shadow-sm"
          >
            <Calendar className="w-4 h-4 mr-2 text-blue-600" />
            My Balances & Applications
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Management & HR Approvals */}
        <TabsContent value="approvals" className="space-y-6 mt-0">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.map((card) => (
              <Card
                key={card.title}
                className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-extrabold text-gray-900">{card.value}</div>
                  <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* DataTable of Requests */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-0">
              <DataTable
                title="Nominal Roll Leave Applications"
                columns={columns}
                data={tableData}
                searchFields={searchFields}
                itemsPerPage={10}
                defaultSortColumn="id"
                defaultSortDirection="desc"
                onAdd={handleAdd}
                addButtonLabel="Record Leave on Behalf"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Employee Self-Service (Balances & Own Requests) */}
        <TabsContent value="self-service" className="space-y-6 mt-0">
          {/* Statutory Balances Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Your Statutory Leave Entitlements
                </h3>
                <p className="text-xs text-slate-500">
                  Calculated per Public Service Rules (PSR 020801 - 020815) for your active cadre.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setApplyDialogOpen(true)}
                className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                Submit Application
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(balancesQuery.data || []).map((b) => (
                <Card
                  key={b.leave_type}
                  className="border border-slate-200 bg-white hover:border-emerald-300 transition-colors shadow-sm"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-bold text-slate-800">
                        {b.leave_type}
                      </CardTitle>
                      <Badge className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-0.5">
                        {b.days_available}d Left
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Annual Entitlement:</span>
                      <strong className="text-slate-900">{b.days_allowed} days</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Days Utilized:</span>
                      <span className="font-semibold text-slate-700">{b.days_taken} days</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Pending Verification:</span>
                      <span className="font-semibold text-amber-600">{b.days_pending} days</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Own Leave History Table */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  My Submitted Leave Applications
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track the real-time review and approval status of your leave requests.
                </p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                {(["all", "pending", "approved", "rejected", "cancelled"] as const).map(
                  (status) => (
                    <Button
                      key={status}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setOwnStatusFilter(status)}
                      className={`h-7 px-2.5 text-xs capitalize ${
                        ownStatusFilter === status
                          ? "bg-white text-emerald-800 shadow-sm font-bold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {status}
                    </Button>
                  )
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {ownLeavesQuery.isLoading ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  Loading your leave records...
                </div>
              ) : ownLeavesList.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-medium text-slate-700">No leave records found</p>
                  <p className="text-slate-400">
                    {ownStatusFilter !== "all"
                      ? `No ${ownStatusFilter} leave applications on file.`
                      : "You have not submitted any statutory leave requests yet."}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setApplyDialogOpen(true)}
                    className="mt-2 text-xs"
                  >
                    Apply for Leave
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Leave Type</th>
                        <th className="py-3 px-4 font-semibold">Period</th>
                        <th className="py-3 px-4 font-semibold">Days</th>
                        <th className="py-3 px-4 font-semibold">Reason</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                        <th className="py-3 px-4 font-semibold">Applied On</th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ownLeavesList.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-800">
                            {req.leave_type}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {formatDateForDisplay(req.from_date)} &rarr; {formatDateForDisplay(req.to_date)}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {req.days}d
                          </td>
                          <td className="py-3 px-4 text-slate-600 max-w-[220px] truncate" title={req.reason}>
                            {req.reason}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={`capitalize ${
                                STATUS_BADGE_STYLES[req.status.toLowerCase()] ??
                                STATUS_BADGE_STYLES.pending
                              }`}
                            >
                              {req.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {formatDateForDisplay(req.created_at)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {canCancelLeave(req) ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2.5 text-red-600 border-red-200 hover:bg-red-50 text-[11px]"
                                onClick={() => {
                                  setLeaveToCancel(req)
                                  setCancelDialogOpen(true)
                                }}
                              >
                                <Ban className="w-3 h-3 mr-1" />
                                Cancel
                              </Button>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                Locked
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 1. APPLY LEAVE DIALOG (Self-Service) */}
      <ApplyLeaveDialog
        isOpen={applyDialogOpen}
        onClose={() => setApplyDialogOpen(false)}
        balances={balancesQuery.data || []}
        onSuccess={() => {
          ownLeavesQuery.refetch()
          balancesQuery.refetch()
          leavesQuery.refetch()
        }}
      />

      {/* 2. LEAVE REVIEW & DECIDE DIALOG (Management / Central HR) */}
      <LeaveReviewDialog
        isOpen={reviewDialogOpen}
        onClose={() => {
          setReviewDialogOpen(false)
          setSelectedLeave(null)
        }}
        leave={selectedLeave}
        onSuccess={() => {
          leavesQuery.refetch()
          ownLeavesQuery.refetch()
          balancesQuery.refetch()
        }}
      />

      {/* 3. CANCEL REQUEST CONFIRMATION DIALOG */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Cancel Leave Application
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 pt-2">
              Are you sure you want to cancel your application for{" "}
              <strong>{leaveToCancel?.leave_type}</strong> (
              {formatDateForDisplay(leaveToCancel?.from_date)} &mdash;{" "}
              {formatDateForDisplay(leaveToCancel?.to_date)})? This will restore your available leave days.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCancelDialogOpen(false)
                setLeaveToCancel(null)
              }}
            >
              Keep Request
            </Button>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white font-medium"
              onClick={handleConfirmCancel}
              disabled={cancelLeaveMutation.isPending}
            >
              {cancelLeaveMutation.isPending ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. RECORD ON BEHALF (Legacy Admin Add Modal) */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Record Leave on Behalf</DialogTitle>
            <DialogDescription>
              Record an official or emergency leave directly for an in-scope officer.
            </DialogDescription>
          </DialogHeader>
          <EnhancedForm
            fields={formFields}
            onSubmit={handleSubmitAdd}
            onCancel={() => setAddDialogOpen(false)}
            isSubmitting={createLeaveMutation.isPending}
            submitLabel="Save Leave Record"
          />
        </DialogContent>
      </Dialog>

      {/* 5. EDIT LEAVE DIALOG */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => (open ? setEditDialogOpen(true) : closeEditModal())}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Edit Leave Request</DialogTitle>
            <DialogDescription>Update dates or reason for the selected request.</DialogDescription>
          </DialogHeader>
          <EnhancedForm
            fields={editFields}
            onSubmit={handleSubmitEdit}
            onCancel={closeEditModal}
            isSubmitting={updateLeaveMutation.isPending}
            submitLabel="Update Leave"
            initialValues={editInitialValues}
          />
        </DialogContent>
      </Dialog>

      {/* 6. STATUS CHANGE MODAL */}
      <StatusChangeDialog
        isOpen={statusDialogOpen}
        onClose={() => {
          setStatusDialogOpen(false)
          setSelectedLeave(null)
        }}
        title="Change Leave Status"
        description={`Update the status for ${
          selectedLeave?.employee_name || selectedLeave?.employee_code || "this leave request"
        }.`}
        currentStatus={statusValue}
        options={[
          { value: "pending", label: "Pending" },
          { value: "approved", label: "Approved" },
          { value: "rejected", label: "Rejected" },
        ]}
        onConfirm={handleUpdateStatus}
        confirmLabel="Save Status"
        isLoading={updateLeaveMutation.isPending}
      />

      {/* 7. DELETE CONFIRMATION DIALOG */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setLeaveToDelete(null)
        }}
        onConfirm={handleDelete}
        title="Delete Leave"
        description={`Remove leave for ${
          leaveToDelete?.employee_name ?? leaveToDelete?.employee_code ?? "this employee"
        }?`}
        itemName={leaveToDelete?.employee_name ?? leaveToDelete?.employee_code ?? "this request"}
        isLoading={deleteLeaveMutation.isPending}
      />

      {/* 8. VIEW FULL DETAILS MODAL */}
      <Dialog
        open={viewDialogOpen}
        onOpenChange={(open) => (open ? setViewDialogOpen(true) : closeViewModal())}
      >
        <DialogContent className="p-0 sm:max-w-3xl">
          <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100 shadow-sm">
                <UserCheck className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Leave Details & Audit
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Comprehensive nominal roll record and statutory tracking.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-6 px-8 pb-8 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Employee
                  </h3>
                  <p className="mt-2 text-lg font-semibold text-gray-900">
                    {selectedLeave.employee_code} - {selectedLeave.employee_name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{selectedLeave.department}</p>
                </section>

                <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </h3>
                  <Badge
                    className={`mt-3 px-3 py-1.5 text-sm capitalize ${
                      STATUS_BADGE_STYLES[selectedLeave.status?.toLowerCase() ?? "pending"] ??
                      STATUS_BADGE_STYLES.pending
                    }`}
                  >
                    {selectedLeave.status}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-2">
                    Submitted: {formatDateForDisplay(selectedLeave.created_at)}
                  </p>
                </section>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <section className="rounded-2xl border border-dashed border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Commencement Date
                  </h3>
                  <p className="mt-3 text-lg font-medium text-gray-900">
                    {formatDateForDisplay(selectedLeave.from_date)}
                  </p>
                </section>
                <section className="rounded-2xl border border-dashed border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Resumption Date
                  </h3>
                  <p className="mt-3 text-lg font-medium text-gray-900">
                    {formatDateForDisplay(selectedLeave.to_date)}
                  </p>
                </section>
              </div>

              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Justification / Purpose
                </h3>
                <p className="mt-2 text-gray-700">
                  {selectedLeave.reason || "No explicit reason was recorded."}
                </p>
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
