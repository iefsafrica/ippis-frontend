"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { useEmployeesList } from "@/services/hooks/employees/useEmployees"
import { useGetDepartments } from "@/services/hooks/organizations/department/useDepartment"
import { useGetDesignations } from "@/services/hooks/organizations/designation/useDesignation"
import {
  useCreateAppraiser,
  useDeleteAppraiser,
  useGetAppraiserById,
  useGetAppraisers,
  useUpdateAppraiser,
} from "@/services/hooks/performance/useAppraiser"
import type {
  Appraiser,
  AppraiserStatus,
  CreateAppraiserPayload,
  UpdateAppraiserPayload,
} from "@/types/performance/appraiser"
import { CalendarDays, CheckCircle2, ClipboardCheck, Edit, Eye, Loader2, RefreshCw, Trash2, XCircle } from "lucide-react"
import { toast } from "sonner"

type AppraiserFormState = {
  employee_id: string
  department_id: string
  designation_id: string
  appraisal_date: string
  status: AppraiserStatus
  rating: string
  remarks: string
  added_by: string
}

const defaultFormState: AppraiserFormState = {
  employee_id: "",
  department_id: "",
  designation_id: "",
  appraisal_date: "",
  status: "scheduled",
  rating: "",
  remarks: "",
  added_by: "",
}

const toInputDate = (value?: string | null) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 10)
}

const formatDateTime = (value?: string | null) => {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleString()
}

const isValidRating = (value: string) => {
  if (!value.trim()) return true
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric >= 0 && numeric <= 100
}

export default function AppraisalContent() {
  const { data, isLoading, error, refetch } = useGetAppraisers()
  const { data: employeesResponse, isLoading: isLoadingEmployees } = useEmployeesList(1)
  const { data: departmentsResponse, isLoading: isLoadingDepartments } = useGetDepartments()
  const { data: designationsResponse, isLoading: isLoadingDesignations } = useGetDesignations()
  const createAppraiserMutation = useCreateAppraiser()
  const updateAppraiserMutation = useUpdateAppraiser()
  const deleteAppraiserMutation = useDeleteAppraiser()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedAppraiser, setSelectedAppraiser] = useState<Appraiser | null>(null)
  const [selectedAppraiserId, setSelectedAppraiserId] = useState<string | number | undefined>(undefined)
  const [form, setForm] = useState<AppraiserFormState>(defaultFormState)

  const { data: selectedAppraiserResponse, isFetching: isFetchingAppraiser } =
    useGetAppraiserById(selectedAppraiserId)

  const appraisers = data?.data || []
  const employees = employeesResponse?.employees || []
  const departments = departmentsResponse?.data || []
  const designations = designationsResponse?.data || []
  const selectedAppraiserDetails = selectedAppraiserResponse?.data || selectedAppraiser

  const completedCount = useMemo(
    () => appraisers.filter((row) => row.status?.toLowerCase() === "completed").length,
    [appraisers]
  )
  const scheduledCount = useMemo(
    () => appraisers.filter((row) => row.status?.toLowerCase() === "scheduled").length,
    [appraisers]
  )
  const inProgressCount = useMemo(
    () => appraisers.filter((row) => row.status?.toLowerCase() === "in-progress").length,
    [appraisers]
  )

  const searchFields = [
    { name: "employee_id", label: "Employee ID", type: "text" as const },
    { name: "department_id", label: "Department ID", type: "text" as const },
    { name: "designation_id", label: "Designation ID", type: "text" as const },
    {
      name: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "scheduled", label: "Scheduled" },
        { value: "in-progress", label: "In Progress" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
    { name: "appraisal_date", label: "Appraisal Date", type: "date" as const },
  ]

  const resetForm = () => setForm(defaultFormState)

  const openAddDialog = () => {
    resetForm()
    setShowAddDialog(true)
  }

  const openEditDialog = (appraiser: Appraiser) => {
    setSelectedAppraiser(appraiser)
    setSelectedAppraiserId(appraiser.id)
    setForm({
      employee_id: appraiser.employee_id || "",
      department_id: String(appraiser.department_id ?? ""),
      designation_id: String(appraiser.designation_id ?? ""),
      appraisal_date: toInputDate(appraiser.appraisal_date),
      status: appraiser.status || "scheduled",
      rating: appraiser.rating == null ? "" : String(appraiser.rating),
      remarks: appraiser.remarks || "",
      added_by: appraiser.added_by || "",
    })
    setShowEditDialog(true)
  }

  const openViewDialog = (appraiser: Appraiser) => {
    setSelectedAppraiser(appraiser)
    setSelectedAppraiserId(appraiser.id)
    setShowViewDialog(true)
  }

  const openDeleteDialog = (appraiser: Appraiser) => {
    setSelectedAppraiser(appraiser)
    setSelectedAppraiserId(appraiser.id)
    setShowDeleteDialog(true)
  }

  const handleCreateAppraiser = async () => {
    if (
      !form.employee_id.trim() ||
      !form.department_id.trim() ||
      !form.designation_id.trim() ||
      !form.appraisal_date.trim() ||
      !form.status.trim()
    ) {
      toast.error("Please fill all required fields")
      return
    }

    if (!isValidRating(form.rating)) {
      toast.error("Rating must be between 0 and 100")
      return
    }

    const payload: CreateAppraiserPayload = {
      employee_id: form.employee_id.trim(),
      department_id: Number(form.department_id),
      designation_id: Number(form.designation_id),
      appraisal_date: form.appraisal_date,
      status: form.status,
      remarks: form.remarks.trim() || undefined,
      rating: form.rating.trim() ? Number(form.rating) : undefined,
      added_by: form.added_by.trim() || undefined,
    }

    try {
      await createAppraiserMutation.mutateAsync(payload)
      toast.success("Appraiser created successfully")
      setShowAddDialog(false)
      resetForm()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create appraiser"
      toast.error(message)
    }
  }

  const handleUpdateAppraiser = async () => {
    if (!selectedAppraiser) return
    if (!form.status.trim()) {
      toast.error("Status is required")
      return
    }

    if (!isValidRating(form.rating)) {
      toast.error("Rating must be between 0 and 100")
      return
    }

    const payload: UpdateAppraiserPayload = {
      id: selectedAppraiser.id,
      employee_id: form.employee_id.trim() || undefined,
      department_id: form.department_id.trim() ? Number(form.department_id) : undefined,
      designation_id: form.designation_id.trim() ? Number(form.designation_id) : undefined,
      appraisal_date: form.appraisal_date || undefined,
      status: form.status,
      remarks: form.remarks.trim() || undefined,
      rating: form.rating.trim() ? Number(form.rating) : null,
      added_by: form.added_by.trim() || undefined,
    }

    try {
      await updateAppraiserMutation.mutateAsync(payload)
      toast.success("Appraiser updated successfully")
      setShowEditDialog(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update appraiser"
      toast.error(message)
    }
  }

  const handleDeleteAppraiser = async () => {
    if (!selectedAppraiser) return

    try {
      await deleteAppraiserMutation.mutateAsync(selectedAppraiser.id)
      toast.success("Appraiser deleted successfully")
      setShowDeleteDialog(false)
      setSelectedAppraiser(null)
      setSelectedAppraiserId(undefined)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete appraiser"
      toast.error(message)
    }
  }

  const getStatusBadge = (status: string) => {
    const key = status?.toLowerCase()
    if (key === "completed") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 py-1 px-2" variant="outline">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      )
    }

    if (key === "in-progress") {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 py-1 px-2" variant="outline">
          <CalendarDays className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      )
    }

    if (key === "cancelled") {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 py-1 px-2" variant="outline">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>
      )
    }

    return (
      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 py-1 px-2" variant="outline">
        Scheduled
      </Badge>
    )
  }

  const columns = [
    {
      key: "employee_id",
      label: "Employee",
      sortable: true,
      render: (value: string, row: Appraiser) => (
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-md bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center mr-2 flex-shrink-0">
            <ClipboardCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate max-w-[220px]">{value || "N/A"}</div>
            <div className="text-xs text-gray-500">
              Dept: {row.department_name || row.department_id} | Desig: {row.designation_name || row.designation_id}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "appraisal_date",
      label: "Appraisal Date",
      sortable: true,
      render: (value: string) => <div className="text-sm text-gray-700">{formatDateTime(value)}</div>,
    },
    {
      key: "rating",
      label: "Rating",
      sortable: true,
      render: (value: number | null) => <div className="text-sm text-gray-700">{value ?? "N/A"}</div>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, row: Appraiser) => (
        <div className="flex justify-start space-x-2">
          <Button variant="outline" size="icon" onClick={() => openViewDialog(row)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="text-blue-600 hover:text-blue-800" onClick={() => openEditDialog(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-red-600 hover:text-red-800"
            onClick={() => openDeleteDialog(row)}
            disabled={deleteAppraiserMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] gap-3">
        <p className="text-red-600 text-sm">{error.message || "Failed to load appraisers"}</p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-3">
          <div className="hidden h-12 w-12 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-sm sm:flex sm:items-center sm:justify-center">
            <ClipboardCheck className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Performance Appraisers
            </h1>
            <p className="text-gray-600 mt-1">
              Manage employee appraisal schedules and outcomes
              <span className="ml-2 text-sm text-gray-500">({appraisers.length} records)</span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-10 px-3.5 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{completedCount}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{scheduledCount}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{inProgressCount}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{appraisers.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <DataTable
            title="Performance Appraisers"
            columns={columns}
            data={appraisers}
            searchFields={searchFields}
            onAdd={openAddDialog}
          />
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Add Appraiser</DialogTitle>
            <DialogDescription>Create a new appraisal record.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Employee ID</Label>
              <Select
                value={form.employee_id}
                onValueChange={(value) => setForm((prev) => ({ ...prev, employee_id: value }))}
                disabled={isLoadingEmployees}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingEmployees ? "Loading employees..." : "Select employee"} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => {
                    const employeeValue = employee.registration_id || employee.id
                    return (
                      <SelectItem key={employee.id} value={employeeValue}>
                        {employeeValue} - {employee.name}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department ID</Label>
              <Select
                value={form.department_id}
                onValueChange={(value) => setForm((prev) => ({ ...prev, department_id: value }))}
                disabled={isLoadingDepartments}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingDepartments ? "Loading departments..." : "Select department"} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={String(department.id)}>
                      {department.id} - {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Designation ID</Label>
              <Select
                value={form.designation_id}
                onValueChange={(value) => setForm((prev) => ({ ...prev, designation_id: value }))}
                disabled={isLoadingDesignations}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingDesignations ? "Loading designations..." : "Select designation"} />
                </SelectTrigger>
                <SelectContent>
                  {designations.map((designation) => (
                    <SelectItem key={designation.id} value={String(designation.id)}>
                      {designation.id} - {designation.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="appraisal-date">Appraisal Date</Label>
              <Input
                id="appraisal-date"
                type="date"
                value={form.appraisal_date}
                onChange={(e) => setForm((prev) => ({ ...prev, appraisal_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="appraisal-rating">Rating (0 - 100)</Label>
              <Input
                id="appraisal-rating"
                type="number"
                min={0}
                max={100}
                value={form.rating}
                onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appraisal-remarks">Remarks</Label>
              <Textarea
                id="appraisal-remarks"
                value={form.remarks}
                onChange={(e) => setForm((prev) => ({ ...prev, remarks: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appraisal-added-by">Added By</Label>
              <Input
                id="appraisal-added-by"
                value={form.added_by}
                onChange={(e) => setForm((prev) => ({ ...prev, added_by: e.target.value }))}
                placeholder="Optional"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAppraiser} disabled={createAppraiserMutation.isPending}>
              {createAppraiserMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Edit Appraiser</DialogTitle>
            <DialogDescription>Update appraiser details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-appraisal-rating">Rating (0 - 100)</Label>
              <Input
                id="edit-appraisal-rating"
                type="number"
                min={0}
                max={100}
                value={form.rating}
                onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-appraisal-remarks">Remarks</Label>
              <Textarea
                id="edit-appraisal-remarks"
                value={form.remarks}
                onChange={(e) => setForm((prev) => ({ ...prev, remarks: e.target.value }))}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={updateAppraiserMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAppraiser} disabled={updateAppraiserMutation.isPending}>
              {updateAppraiserMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Appraiser Details</DialogTitle>
            <DialogDescription>View full appraiser record.</DialogDescription>
          </DialogHeader>
          {isFetchingAppraiser ? (
            <div className="flex items-center justify-center min-h-[120px]">
              <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
            </div>
          ) : selectedAppraiserDetails ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Employee ID</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedAppraiserDetails.employee_id || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedAppraiserDetails.status || "scheduled")}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Department</Label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedAppraiserDetails.department_name || selectedAppraiserDetails.department_id || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Designation</Label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedAppraiserDetails.designation_name || selectedAppraiserDetails.designation_id || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Appraisal Date</Label>
                  <p className="text-sm text-gray-900 mt-1">{formatDateTime(selectedAppraiserDetails.appraisal_date)}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Rating</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedAppraiserDetails.rating ?? "N/A"}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Added By</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedAppraiserDetails.added_by || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Created At</Label>
                  <p className="text-sm text-gray-900 mt-1">{formatDateTime(selectedAppraiserDetails.created_at)}</p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Remarks</Label>
                <div className="mt-1 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 whitespace-pre-wrap">
                  {selectedAppraiserDetails.remarks || "N/A"}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No record selected.</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setSelectedAppraiser(null)
          setSelectedAppraiserId(undefined)
        }}
        onConfirm={handleDeleteAppraiser}
        title="Delete Appraiser"
        description={`Are you sure you want to delete appraisal for ${selectedAppraiser?.employee_id || "this employee"}?`}
        itemName={selectedAppraiser?.employee_id || "this appraiser"}
        isLoading={deleteAppraiserMutation.isPending}
      />
    </div>
  )
}
