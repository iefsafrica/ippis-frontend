"use client"

import { useMemo, useState } from "react"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Briefcase,
  Clock,
  Eye,
  FileSpreadsheet,
  FileIcon as FilePdf,
  Layers,
  Loader2,
  Pencil,
  Printer,
  Plus,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react"
import {
  useCreateShift,
  useDeleteShift,
  useShifts,
  useUpdateShift,
} from "@/services/hooks/timesheets/shifts"
import type { CreateShiftPayload, ShiftRecord, UpdateShiftPayload } from "@/types/timesheets/shifts"

const departmentOptions = [
  "All Departments",
  "Engineering",
  "IT",
  "HR",
  "Finance",
  "Marketing",
  "Operations",
  "Customer Support",
]

const shiftStatusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]

export function OfficeShiftContent() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ShiftRecord | null>(null)

  const initialAddShiftForm: CreateShiftPayload = {
    shift_name: "",
    start_time: "",
    end_time: "",
    late_mark_time: "",
    department: departmentOptions[0],
    status: "active",
  }
  const [addShiftForm, setAddShiftForm] = useState<CreateShiftPayload>(initialAddShiftForm)
  const [editShiftForm, setEditShiftForm] = useState<UpdateShiftPayload>({
    id: 0,
    department: departmentOptions[0],
    status: "active",
  })

  const shiftsQuery = useShifts()
  const createShiftMutation = useCreateShift()
  const updateShiftMutation = useUpdateShift()
  const deleteShiftMutation = useDeleteShift()

  const shiftList = shiftsQuery.data ?? []
  const isFetching = shiftsQuery.isFetching

  const totalShifts = shiftList.length
  const activeShifts = shiftList.filter((shift) => shift.status === "active").length
  const inactiveShifts = shiftList.filter((shift) => shift.status !== "active").length
  const departmentCount = new Set(shiftList.map((shift) => shift.department)).size

  const closeEditModal = () => {
    setEditDialogOpen(false)
    setSelectedItem(null)
  }

  const closeViewModal = () => {
    setViewDialogOpen(false)
    setSelectedItem(null)
  }

  const closeDeleteModal = () => {
    setDeleteDialogOpen(false)
    setSelectedItem(null)
  }

  const formatTime = (value?: string) => {
    if (!value) return "--"
    const [hours, minutes] = value.split(":")
    const parsed = Number.parseInt(hours, 10)
    if (Number.isNaN(parsed)) return value
    const period = parsed >= 12 ? "PM" : "AM"
    const hours12 = parsed % 12 || 12
    return `${hours12}:${minutes} ${period}`
  }

  const resetAddForm = () => {
    setAddShiftForm(initialAddShiftForm)
  }

  const handleAdd = () => {
    resetAddForm()
    setAddDialogOpen(true)
  }

  const handleEdit = (shift: ShiftRecord) => {
    setSelectedItem(shift)
    setEditShiftForm({
      id: shift.id,
      shift_name: shift.shift_name,
      start_time: shift.start_time,
      end_time: shift.end_time,
      late_mark_time: shift.late_mark_time ?? "",
      department: shift.department,
      status: shift.status,
    })
    setEditDialogOpen(true)
  }

  const handleView = (shift: ShiftRecord) => {
    setSelectedItem(shift)
    setViewDialogOpen(true)
  }

  const handleDelete = (shift: ShiftRecord) => {
    setSelectedItem(shift)
    setDeleteDialogOpen(true)
  }

  const handleManualRefresh = () => {
    shiftsQuery.refetch()
    toast.success("Shift data refreshed")
  }

  const handleAddSubmit = () => {
    if (createShiftMutation.isPending) return
    createShiftMutation.mutate(addShiftForm, {
      onSuccess: () => {
        toast.success("Shift created")
        setAddDialogOpen(false)
        resetAddForm()
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Unable to create shift")
      },
    })
  }

  const handleEditSubmit = () => {
    if (!editShiftForm.id) {
      toast.error("Missing shift id")
      return
    }
    if (updateShiftMutation.isPending) return
    updateShiftMutation.mutate(editShiftForm, {
      onSuccess: () => {
        toast.success("Shift updated")
        closeEditModal()
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Unable to update shift")
      },
    })
  }

  const handleDeleteConfirm = () => {
    if (!selectedItem) return
    if (deleteShiftMutation.isPending) return
    deleteShiftMutation.mutate(
      { id: selectedItem.id },
      {
        onSuccess: () => {
          toast.success("Shift deleted")
          closeDeleteModal()
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Unable to delete shift")
        },
      },
    )
  }

  const shiftSearchFields = useMemo(
    () => [
      { name: "shift_name", label: "Shift Name", type: "text" },
      { name: "department", label: "Department", type: "text" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: shiftStatusOptions,
      },
    ],
    [],
  )

  const columns = useMemo(
    () => [
      {
        key: "shift_name",
        label: "Shift",
        sortable: true,
        render: (value: string, row: ShiftRecord) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center cursor-default gap-3">
                  <div className="relative">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <span
                      className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border border-white ${
                        row.status === "active" ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate max-w-[180px]">{value}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[180px]">{row.department}</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Shift name: {value}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
      },
      {
        key: "department",
        label: "Department",
        sortable: true,
        render: (value: string) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center cursor-default gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="truncate max-w-[140px]">{value}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Department: {value}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
      },
      {
        key: "start_time",
        label: "Start Time",
        sortable: true,
        render: (value: string) => formatTime(value),
      },
      {
        key: "end_time",
        label: "End Time",
        sortable: true,
        render: (value: string) => formatTime(value),
      },
      {
        key: "late_mark_time",
        label: "Grace Period",
        sortable: true,
        render: (value: string) => formatTime(value ?? ""),
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        render: (value: string) => {
          const normalized = (value ?? "inactive").toLowerCase()
          const style =
            normalized === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          return (
            <Badge className={`${style} capitalize px-2 py-1 text-xs font-semibold`}>
              {normalized}
            </Badge>
          )
        },
      },
      {
        key: "actions",
        label: "Actions",
        render: (_: unknown, shift: ShiftRecord) => (
          <div className="flex justify-start space-x-2">
            <Button variant="outline" size="icon" onClick={() => handleView(shift)} title="View shift">
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleEdit(shift)}
              title="Edit shift"
              className="text-blue-600 hover:text-blue-800"
              disabled={shift.status !== "active"}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDelete(shift)}
              title="Delete shift"
              className="text-red-600 hover:text-red-800"
              disabled={shift.status !== "active"}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [handleDelete, handleEdit, handleView],
  )

  const statsCards = useMemo(
    () => [
      {
        title: "Total Shifts",
        value: totalShifts,
        description: "Shift schedules tracked",
        icon: Clock,
        iconBg: "bg-blue-50 border-blue-200 text-blue-600",
      },
      {
        title: "Active",
        value: activeShifts,
        description: "Active shifts",
        icon: Users,
        iconBg: "bg-green-50 border-green-200 text-green-600",
      },
      {
        title: "Inactive",
        value: inactiveShifts,
        description: "Inactive shifts",
        icon: Briefcase,
        iconBg: "bg-amber-50 border-amber-200 text-amber-600",
      },
      {
        title: "Departments",
        value: departmentCount,
        description: "Unique departments",
        icon: Layers,
        iconBg: "bg-purple-50 border-purple-200 text-purple-600",
      },
    ],
    [activeShifts, departmentCount, inactiveShifts, totalShifts],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Office Shifts</h1>
          <p className="text-gray-600 mt-1">
            Configure and manage employee work shifts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-3.5 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50"
                  onClick={handleManualRefresh}
                  disabled={isFetching}
                >
                  {isFetching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="ml-2 hidden sm:inline">Refresh</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh shift data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 px-3.5 border-gray-300 text-gray-700 rounded-lg">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export to CSV
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FilePdf className="mr-2 h-4 w-4" />
                Export to PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={handleAdd}
            className="h-10 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Shift
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <Card
            key={card.title}
            className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className={`h-10 w-10 rounded-lg border ${card.iconBg} flex items-center justify-center mr-3`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                  <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Shift Requests</CardTitle>
              <CardDescription className="text-gray-600">
                Manage the official office shift schedules
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            title="Office Shifts"
            columns={columns}
            data={shiftList}
            searchFields={shiftSearchFields}
            itemsPerPage={10}
            emptyMessage={
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 border border-blue-200 mb-4">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No shifts defined</h3>
                <p className="text-gray-600 mb-4">Create a shift to start tracking schedules.</p>
                <Button
                  onClick={handleAdd}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Shift
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Shift</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Shift Name</Label>
                <Input
                  id="name"
                  placeholder="Enter shift name"
                  value={addShiftForm.shift_name}
                  onChange={(event) =>
                    setAddShiftForm((prev) => ({ ...prev, shift_name: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={addShiftForm.department}
                  onValueChange={(value) =>
                    setAddShiftForm((prev) => ({ ...prev, department: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentOptions.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={addShiftForm.start_time}
                  onChange={(event) =>
                    setAddShiftForm((prev) => ({ ...prev, start_time: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={addShiftForm.end_time}
                  onChange={(event) =>
                    setAddShiftForm((prev) => ({ ...prev, end_time: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lateMarkTime">Late Mark Time</Label>
                <Input
                  id="lateMarkTime"
                  type="time"
                  value={addShiftForm.late_mark_time}
                  onChange={(event) =>
                    setAddShiftForm((prev) => ({ ...prev, late_mark_time: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={addShiftForm.status}
                  onValueChange={(value) =>
                    setAddShiftForm((prev) => ({
                      ...prev,
                      status: value as "active" | "inactive",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {shiftStatusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              disabled={createShiftMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleAddSubmit} disabled={createShiftMutation.isPending}>
              {createShiftMutation.isPending ? "Saving..." : "Save Shift"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={(open) => (open ? setEditDialogOpen(true) : closeEditModal())}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Shift</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Shift Name</Label>
                  <Input
                    id="edit-name"
                    value={editShiftForm.shift_name ?? selectedItem.shift_name}
                    onChange={(event) =>
                      setEditShiftForm((prev) => ({ ...prev, shift_name: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-department">Department</Label>
                  <Select
                    value={editShiftForm.department ?? selectedItem.department}
                    onValueChange={(value) =>
                      setEditShiftForm((prev) => ({ ...prev, department: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentOptions.map((department) => (
                        <SelectItem key={department} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-startTime">Start Time</Label>
                  <Input
                    id="edit-startTime"
                    type="time"
                    value={editShiftForm.start_time ?? selectedItem.start_time}
                    onChange={(event) =>
                      setEditShiftForm((prev) => ({ ...prev, start_time: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-endTime">End Time</Label>
                  <Input
                    id="edit-endTime"
                    type="time"
                    value={editShiftForm.end_time ?? selectedItem.end_time}
                    onChange={(event) =>
                      setEditShiftForm((prev) => ({ ...prev, end_time: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lateMarkTime">Late Mark Time</Label>
                  <Input
                    id="edit-lateMarkTime"
                    type="time"
                    value={editShiftForm.late_mark_time ?? selectedItem.late_mark_time ?? ""}
                    onChange={(event) =>
                      setEditShiftForm((prev) => ({ ...prev, late_mark_time: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editShiftForm.status ?? selectedItem.status}
                    onValueChange={(value) =>
                      setEditShiftForm((prev) => ({
                        ...prev,
                        status: value as "active" | "inactive",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {shiftStatusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeEditModal}
              disabled={updateShiftMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={updateShiftMutation.isPending}>
              {updateShiftMutation.isPending ? "Saving..." : "Update Shift"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={(open) => (open ? setViewDialogOpen(true) : closeViewModal())}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Shift Details</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Shift</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedItem.shift_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Department</h3>
                  <p>{selectedItem.department}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Start Time</h3>
                  <p>{formatTime(selectedItem.start_time)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">End Time</h3>
                  <p>{formatTime(selectedItem.end_time)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Late Mark</h3>
                  <p>{formatTime(selectedItem.late_mark_time ?? "")}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Status</h3>
                  <Badge
                    className={`${
                      selectedItem.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    } mt-1 px-2 py-1 text-xs font-semibold`}
                  >
                    {selectedItem.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Shift"
        description={`Are you sure you want to delete the ${selectedItem?.shift_name ?? "selected"} shift?`}
        itemName={selectedItem?.shift_name ?? "selected shift"}
        isLoading={deleteShiftMutation.isPending}
      />
    </div>
  )
}
