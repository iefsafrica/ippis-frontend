"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { CheckCircle2, Clock3, Edit, Eye, Loader2, RefreshCw, Target, Trash2, XCircle } from "lucide-react"
import { toast } from "sonner"
import {
  useCreateGoalTracking,
  useDeleteGoalTracking,
  useGetGoalTrackingById,
  useGetGoalTrackings,
  useUpdateGoalTracking,
} from "@/services/hooks/performance/useGoalTracking"
import type {
  CreateGoalTrackingPayload,
  GoalTracking,
  UpdateGoalTrackingPayload,
} from "@/types/performance/goal-tracking"

type GoalTrackingFormState = {
  employee_id: string
  goal_type_id: string
  title: string
  description: string
  status: string
  target_date: string
  achieved: boolean
}

const defaultFormState: GoalTrackingFormState = {
  employee_id: "",
  goal_type_id: "",
  title: "",
  description: "",
  status: "in-progress",
  target_date: "",
  achieved: false,
}

const formatDate = (value?: string | null) => {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleDateString()
}

const toInputDate = (value?: string | null) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 10)
}

export default function GoalTrackingContent() {
  const { data, isLoading, error, refetch } = useGetGoalTrackings()
  const createGoalMutation = useCreateGoalTracking()
  const updateGoalMutation = useUpdateGoalTracking()
  const deleteGoalMutation = useDeleteGoalTracking()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<GoalTracking | null>(null)
  const [selectedGoalId, setSelectedGoalId] = useState<string | number | undefined>(undefined)
  const [form, setForm] = useState<GoalTrackingFormState>(defaultFormState)

  const { data: selectedGoalResponse, isFetching: isFetchingGoal } = useGetGoalTrackingById(selectedGoalId)

  const goals = data?.data || []
  const selectedGoalDetails = selectedGoalResponse?.data || selectedGoal

  const completedCount = useMemo(
    () => goals.filter((row) => row.status?.toLowerCase() === "completed").length,
    [goals]
  )
  const inProgressCount = useMemo(
    () => goals.filter((row) => row.status?.toLowerCase() === "in-progress").length,
    [goals]
  )
  const achievedCount = useMemo(() => goals.filter((row) => row.achieved).length, [goals])

  const searchFields = [
    { name: "employee_id", label: "Employee ID", type: "text" as const },
    { name: "title", label: "Title", type: "text" as const },
    { name: "goal_type_id", label: "Goal Type ID", type: "text" as const },
    {
      name: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "not-started", label: "Not Started" },
        { value: "in-progress", label: "In Progress" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
    { name: "target_date", label: "Target Date", type: "date" as const },
  ]

  const resetForm = () => setForm(defaultFormState)

  const openAddDialog = () => {
    resetForm()
    setShowAddDialog(true)
  }

  const openEditDialog = (goal: GoalTracking) => {
    setSelectedGoal(goal)
    setSelectedGoalId(goal.id)
    setForm({
      employee_id: goal.employee_id || "",
      goal_type_id: String(goal.goal_type_id ?? ""),
      title: goal.title || "",
      description: goal.description || "",
      status: goal.status || "in-progress",
      target_date: toInputDate(goal.target_date),
      achieved: !!goal.achieved,
    })
    setShowEditDialog(true)
  }

  const openViewDialog = (goal: GoalTracking) => {
    setSelectedGoal(goal)
    setSelectedGoalId(goal.id)
    setShowViewDialog(true)
  }

  const openDeleteDialog = (goal: GoalTracking) => {
    setSelectedGoal(goal)
    setSelectedGoalId(goal.id)
    setShowDeleteDialog(true)
  }

  const handleCreateGoal = async () => {
    if (!form.employee_id.trim() || !form.goal_type_id.trim() || !form.title.trim() || !form.description.trim() || !form.target_date.trim()) {
      toast.error("Please fill all required fields")
      return
    }

    const payload: CreateGoalTrackingPayload = {
      employee_id: form.employee_id.trim(),
      goal_type_id: Number(form.goal_type_id),
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      target_date: form.target_date,
    }

    try {
      await createGoalMutation.mutateAsync(payload)
      toast.success("Goal created successfully")
      setShowAddDialog(false)
      resetForm()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create goal"
      toast.error(message)
    }
  }

  const handleUpdateGoal = async () => {
    if (!selectedGoal) return
    if (!form.title.trim() || !form.description.trim() || !form.status.trim()) {
      toast.error("Please fill all required fields")
      return
    }

    const payload: UpdateGoalTrackingPayload = {
      id: selectedGoal.id,
      employee_id: form.employee_id.trim() || undefined,
      goal_type_id: form.goal_type_id ? Number(form.goal_type_id) : undefined,
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      target_date: form.target_date || undefined,
      achieved: form.achieved,
    }

    try {
      await updateGoalMutation.mutateAsync(payload)
      toast.success("Goal updated successfully")
      setShowEditDialog(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update goal"
      toast.error(message)
    }
  }

  const handleDeleteGoal = async () => {
    if (!selectedGoal) return
    try {
      await deleteGoalMutation.mutateAsync(selectedGoal.id)
      toast.success("Goal deleted successfully")
      setShowDeleteDialog(false)
      setSelectedGoal(null)
      setSelectedGoalId(undefined)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete goal"
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
    if (key === "cancelled") {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 py-1 px-2" variant="outline">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>
      )
    }
    return (
      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 py-1 px-2" variant="outline">
        <Clock3 className="h-3 w-3 mr-1" />
        {status || "In Progress"}
      </Badge>
    )
  }

  const columns = [
    {
      key: "title",
      label: "Goal",
      sortable: true,
      render: (value: string, row: GoalTracking) => (
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-md bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
            <Target className="h-4 w-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate max-w-[220px]">{value}</div>
            <div className="text-xs text-gray-500">Emp: {row.employee_id || "N/A"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "goal_type_id",
      label: "Goal Type ID",
      sortable: true,
      render: (value: number, row: GoalTracking) => (
        <div className="text-sm text-gray-700">
          {value}
          {row.goal_type ? <span className="text-xs text-gray-500 ml-1">({row.goal_type})</span> : null}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: "target_date",
      label: "Target Date",
      sortable: true,
      render: (value: string) => <div className="text-sm text-gray-700">{formatDate(value)}</div>,
    },
    {
      key: "achieved",
      label: "Achieved",
      sortable: true,
      render: (value: boolean) => (
        <Badge variant="outline" className={value ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-700 border-gray-200"}>
          {value ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, row: GoalTracking) => (
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
            disabled={deleteGoalMutation.isPending}
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
        <p className="text-red-600 text-sm">{error.message || "Failed to load goals"}</p>
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
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Goal Tracking
            </h1>
            <p className="text-gray-600 mt-1">
              Track employee performance goals
              <span className="ml-2 text-sm text-gray-500">({goals.length} records)</span>
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
            Add Goal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">In Progress Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{inProgressCount}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completed Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{completedCount}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Achieved Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{achievedCount}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{goals.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <DataTable
            title="Goal Tracking"
            columns={columns}
            data={goals}
            searchFields={searchFields}
            onAdd={openAddDialog}
          />
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Add Goal</DialogTitle>
            <DialogDescription>Create a new goal tracking record.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="goal-employee-id">Employee ID</Label>
              <Input
                id="goal-employee-id"
                value={form.employee_id}
                onChange={(e) => setForm((prev) => ({ ...prev, employee_id: e.target.value }))}
                placeholder="Enter employee id (e.g. IPPIS 008)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-type-id">Goal Type ID</Label>
              <Input
                id="goal-type-id"
                type="number"
                value={form.goal_type_id}
                onChange={(e) => setForm((prev) => ({ ...prev, goal_type_id: e.target.value }))}
                placeholder="Enter goal type id"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-title">Title</Label>
              <Input
                id="goal-title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter goal title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-description">Description</Label>
              <Textarea
                id="goal-description"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Enter goal description"
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
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-target-date">Target Date</Label>
              <Input
                id="goal-target-date"
                type="date"
                value={form.target_date}
                onChange={(e) => setForm((prev) => ({ ...prev, target_date: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGoal} disabled={createGoalMutation.isPending}>
              {createGoalMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
            <DialogDescription>Update goal tracking details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-goal-title">Title</Label>
              <Input
                id="edit-goal-title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-goal-description">Description</Label>
              <Textarea
                id="edit-goal-description"
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
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-goal-target-date">Target Date</Label>
              <Input
                id="edit-goal-target-date"
                type="date"
                value={form.target_date}
                onChange={(e) => setForm((prev) => ({ ...prev, target_date: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Checkbox
                id="edit-goal-achieved"
                checked={form.achieved}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, achieved: checked === true }))}
              />
              <Label htmlFor="edit-goal-achieved" className="text-sm">Achieved</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={updateGoalMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleUpdateGoal} disabled={updateGoalMutation.isPending}>
              {updateGoalMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Goal Details</DialogTitle>
            <DialogDescription>View full goal tracking record.</DialogDescription>
          </DialogHeader>
          {isFetchingGoal ? (
            <div className="flex items-center justify-center min-h-[120px]">
              <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
            </div>
          ) : selectedGoalDetails ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Title</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedGoalDetails.title || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Employee ID</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedGoalDetails.employee_id || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Goal Type ID</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedGoalDetails.goal_type_id || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Goal Type</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedGoalDetails.goal_type || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedGoalDetails.status || "in-progress")}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Achieved</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedGoalDetails.achieved ? "Yes" : "No"}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Target Date</Label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(selectedGoalDetails.target_date)}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Created At</Label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(selectedGoalDetails.created_at)}</p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Description</Label>
                <div className="mt-1 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 whitespace-pre-wrap">
                  {selectedGoalDetails.description || "N/A"}
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
          setSelectedGoal(null)
          setSelectedGoalId(undefined)
        }}
        onConfirm={handleDeleteGoal}
        title="Delete Goal"
        description={`Are you sure you want to delete ${selectedGoal?.title || "this goal"}?`}
        itemName={selectedGoal?.title || "this goal"}
        isLoading={deleteGoalMutation.isPending}
      />
    </div>
  )
}
