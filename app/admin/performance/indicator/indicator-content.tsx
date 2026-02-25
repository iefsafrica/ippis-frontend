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
import { BarChart3, CheckCircle2, Edit, Eye, Loader2, RefreshCw, Trash2, XCircle } from "lucide-react"
import { toast } from "sonner"
import {
  useCreateIndicator,
  useDeleteIndicator,
  useGetIndicatorById,
  useGetIndicators,
  useUpdateIndicator,
} from "@/services/hooks/performance/useIndicator"
import { useGetDepartments } from "@/services/hooks/organizations/department/useDepartment"
import { useGetDesignations } from "@/services/hooks/organizations/designation/useDesignation"
import type {
  CreateIndicatorPayload,
  Indicator,
  UpdateIndicatorPayload,
} from "@/types/performance/indicator"

type IndicatorFormState = {
  indicator_name: string
  department_id: string
  designation_id: string
  description: string
  status: string
  added_by: string
}

const defaultFormState: IndicatorFormState = {
  indicator_name: "",
  department_id: "",
  designation_id: "",
  description: "",
  status: "active",
  added_by: "",
}

const formatDate = (value?: string | null) => {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleString()
}

export default function IndicatorContent() {
  const { data, isLoading, error, refetch } = useGetIndicators()
  const { data: departmentsResponse, isLoading: isLoadingDepartments } = useGetDepartments()
  const { data: designationsResponse, isLoading: isLoadingDesignations } = useGetDesignations()
  const createIndicatorMutation = useCreateIndicator()
  const updateIndicatorMutation = useUpdateIndicator()
  const deleteIndicatorMutation = useDeleteIndicator()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null)
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string | number | undefined>(undefined)
  const [form, setForm] = useState<IndicatorFormState>(defaultFormState)

  const { data: selectedIndicatorResponse, isFetching: isFetchingIndicator } = useGetIndicatorById(selectedIndicatorId)

  const indicators = data?.data || []
  const departments = departmentsResponse?.data || []
  const designations = designationsResponse?.data || []
  const selectedIndicatorDetails = selectedIndicatorResponse?.data || selectedIndicator

  const activeCount = useMemo(
    () => indicators.filter((row) => row.status?.toLowerCase() === "active").length,
    [indicators]
  )
  const inactiveCount = useMemo(
    () => indicators.filter((row) => row.status?.toLowerCase() === "inactive").length,
    [indicators]
  )
  const recentCount = useMemo(() => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return indicators.filter((row) => {
      const value = row.created_at || row.updated_at
      if (!value) return false
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return false
      return date >= sevenDaysAgo
    }).length
  }, [indicators])

  const searchFields = [
    { name: "indicator_name", label: "Indicator Name", type: "text" as const },
    { name: "department_id", label: "Department ID", type: "text" as const },
    { name: "designation_id", label: "Designation ID", type: "text" as const },
    { name: "added_by", label: "Added By", type: "text" as const },
    {
      name: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ]

  const resetForm = () => setForm(defaultFormState)

  const openAddDialog = () => {
    resetForm()
    setShowAddDialog(true)
  }

  const openEditDialog = (indicator: Indicator) => {
    setSelectedIndicator(indicator)
    setSelectedIndicatorId(indicator.id)
    setForm({
      indicator_name: indicator.indicator_name || "",
      department_id: String(indicator.department_id ?? ""),
      designation_id: String(indicator.designation_id ?? ""),
      description: indicator.description || "",
      status: indicator.status || "active",
      added_by: indicator.added_by || "",
    })
    setShowEditDialog(true)
  }

  const openViewDialog = (indicator: Indicator) => {
    setSelectedIndicator(indicator)
    setSelectedIndicatorId(indicator.id)
    setShowViewDialog(true)
  }

  const openDeleteDialog = (indicator: Indicator) => {
    setSelectedIndicator(indicator)
    setSelectedIndicatorId(indicator.id)
    setShowDeleteDialog(true)
  }

  const handleCreateIndicator = async () => {
    if (!form.indicator_name.trim() || !form.department_id.trim() || !form.designation_id.trim() || !form.description.trim() || !form.added_by.trim()) {
      toast.error("Please fill all required fields")
      return
    }

    const payload: CreateIndicatorPayload = {
      indicator_name: form.indicator_name.trim(),
      department_id: Number(form.department_id),
      designation_id: Number(form.designation_id),
      description: form.description.trim(),
      status: form.status,
      added_by: form.added_by.trim(),
    }

    try {
      await createIndicatorMutation.mutateAsync(payload)
      toast.success("Indicator created successfully")
      setShowAddDialog(false)
      resetForm()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create indicator"
      toast.error(message)
    }
  }

  const handleUpdateIndicator = async () => {
    if (!selectedIndicator) return
    if (!form.department_id.trim() || !form.description.trim() || !form.status.trim()) {
      toast.error("Please fill all required fields")
      return
    }

    const payload: UpdateIndicatorPayload = {
      id: selectedIndicator.id,
      department_id: Number(form.department_id),
      designation_id: form.designation_id ? Number(form.designation_id) : undefined,
      indicator_name: form.indicator_name.trim() || undefined,
      description: form.description.trim(),
      status: form.status,
      added_by: form.added_by.trim() || undefined,
    }

    try {
      await updateIndicatorMutation.mutateAsync(payload)
      toast.success("Indicator updated successfully")
      setShowEditDialog(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update indicator"
      toast.error(message)
    }
  }

  const handleDeleteIndicator = async () => {
    if (!selectedIndicator) return
    try {
      await deleteIndicatorMutation.mutateAsync(selectedIndicator.id)
      toast.success("Indicator deleted successfully")
      setShowDeleteDialog(false)
      setSelectedIndicator(null)
      setSelectedIndicatorId(undefined)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete indicator"
      toast.error(message)
    }
  }

  const getStatusBadge = (status: string) => {
    if (status?.toLowerCase() === "active") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 py-1 px-2" variant="outline">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Active
        </Badge>
      )
    }
    return (
      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 py-1 px-2" variant="outline">
        <XCircle className="h-3 w-3 mr-1" />
        {status || "Inactive"}
      </Badge>
    )
  }

  const columns = [
    {
      key: "indicator_name",
      label: "Indicator",
      sortable: true,
      render: (value: string, row: Indicator) => (
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-md bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate max-w-[220px]">{value}</div>
            <div className="text-xs text-gray-500">
              Dept: {row.department_name || row.department_id} | Desig: {row.designation_name || row.designation_id}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "added_by",
      label: "Added By",
      sortable: true,
      render: (value: string) => <div className="text-sm text-gray-700">{value || "N/A"}</div>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: "created_at",
      label: "Created At",
      sortable: true,
      render: (value: string) => <div className="text-sm text-gray-700">{formatDate(value)}</div>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, row: Indicator) => (
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
            disabled={deleteIndicatorMutation.isPending}
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
        <p className="text-red-600 text-sm">{error.message || "Failed to load indicators"}</p>
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
          <div className="hidden h-12 w-12 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm sm:flex sm:items-center sm:justify-center">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Performance Indicators
            </h1>
            <p className="text-gray-600 mt-1">
              Manage key performance indicators
              <span className="ml-2 text-sm text-gray-500">({indicators.length} records)</span>
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
          <Button
            className="h-10 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg"
            onClick={openAddDialog}
          >
            Add Indicator
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Inactive Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{inactiveCount}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Recent Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{recentCount}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{indicators.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <DataTable
            title="Performance Indicators"
            columns={columns}
            data={indicators}
            searchFields={searchFields}
            onAdd={openAddDialog}
          />
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Add Performance Indicator</DialogTitle>
            <DialogDescription>Create a new performance indicator.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="indicator-name">Indicator Name</Label>
              <Input
                id="indicator-name"
                value={form.indicator_name}
                onChange={(e) => setForm((prev) => ({ ...prev, indicator_name: e.target.value }))}
              />
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
              <Label htmlFor="indicator-description">Description</Label>
              <Textarea
                id="indicator-description"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="added-by">Added By</Label>
              <Input
                id="added-by"
                value={form.added_by}
                onChange={(e) => setForm((prev) => ({ ...prev, added_by: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateIndicator} disabled={createIndicatorMutation.isPending}>
              {createIndicatorMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Edit Performance Indicator</DialogTitle>
            <DialogDescription>Update indicator details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
              <Label htmlFor="edit-indicator-description">Description</Label>
              <Textarea
                id="edit-indicator-description"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={updateIndicatorMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleUpdateIndicator} disabled={updateIndicatorMutation.isPending}>
              {updateIndicatorMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Indicator Details</DialogTitle>
            <DialogDescription>View full indicator record.</DialogDescription>
          </DialogHeader>
          {isFetchingIndicator ? (
            <div className="flex items-center justify-center min-h-[120px]">
              <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
            </div>
          ) : selectedIndicatorDetails ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Indicator Name</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedIndicatorDetails.indicator_name || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Added By</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedIndicatorDetails.added_by || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Department</Label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedIndicatorDetails.department_name || selectedIndicatorDetails.department_id || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Designation</Label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedIndicatorDetails.designation_name || selectedIndicatorDetails.designation_id || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedIndicatorDetails.status || "inactive")}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Created At</Label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(selectedIndicatorDetails.created_at)}</p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Description</Label>
                <div className="mt-1 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 whitespace-pre-wrap">
                  {selectedIndicatorDetails.description || "N/A"}
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
          setSelectedIndicator(null)
          setSelectedIndicatorId(undefined)
        }}
        onConfirm={handleDeleteIndicator}
        title="Delete Indicator"
        description={`Are you sure you want to delete ${selectedIndicator?.indicator_name || "this indicator"}?`}
        itemName={selectedIndicator?.indicator_name || "this indicator"}
        isLoading={deleteIndicatorMutation.isPending}
      />
    </div>
  )
}
