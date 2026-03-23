"use client"

import { useMemo, useState } from "react"
import { differenceInDays, format, isAfter } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Calendar,
  Loader2,
  Briefcase,
  Globe,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Printer,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
  useCreateHoliday,
  useDeleteHoliday,
  useHolidays,
  useUpdateHoliday,
} from "@/services/hooks/timesheets/holidays"
import type {
  CreateHolidayPayload,
  HolidayRecord,
  UpdateHolidayPayload,
} from "@/types/timesheets/holidays"

const holidayStatusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]

const holidaySearchFields = [
  { name: "holiday_name", label: "Holiday Name", type: "text" },
  { name: "description", label: "Description", type: "text" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: holidayStatusOptions,
  },
]

export function ManageHolidayContent() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedHoliday, setSelectedHoliday] = useState<HolidayRecord | null>(null)

  const [addForm, setAddForm] = useState<CreateHolidayPayload>({
    holiday_name: "",
    start_date: "",
    end_date: "",
    description: "",
    status: "active",
  })
  const [editForm, setEditForm] = useState<UpdateHolidayPayload>({
    id: 0,
    status: "active",
  })

  const holidaysQuery = useHolidays()
  const createMutation = useCreateHoliday()
  const updateMutation = useUpdateHoliday()
  const deleteMutation = useDeleteHoliday()

  const holidays = holidaysQuery.data ?? []
  const isFetching = holidaysQuery.isFetching

  const totalHolidays = holidays.length
  const activeHolidays = holidays.filter((holiday) => holiday.status === "active").length
  const inactiveHolidays = totalHolidays - activeHolidays
  const upcomingHolidays = holidays.filter((holiday) => isAfter(new Date(holiday.start_date), new Date())).length

  const statsCards = useMemo(
    () => [
      {
        title: "Total Holidays",
        value: totalHolidays,
        description: "Tracked holiday records",
        icon: Calendar,
        iconBg: "bg-blue-50 border-blue-200 text-blue-600",
      },
      {
        title: "Active",
        value: activeHolidays,
        description: "Currently active entries",
        icon: Briefcase,
        iconBg: "bg-green-50 border-green-200 text-green-600",
      },
      {
        title: "Inactive",
        value: inactiveHolidays,
        description: "Disabled entries",
        icon: Globe,
        iconBg: "bg-amber-50 border-amber-200 text-amber-600",
      },
      {
        title: "Upcoming",
        value: upcomingHolidays,
        description: "Start in the future",
        icon: Calendar,
        iconBg: "bg-purple-50 border-purple-200 text-purple-600",
      },
    ],
    [activeHolidays, upcomingHolidays, inactiveHolidays, totalHolidays],
  )

  const formatDate = (value?: string) => {
    if (!value) return "--"
    try {
      return format(new Date(value), "PPP")
    } catch {
      return value
    }
  }

  const handleManualRefresh = () => {
    holidaysQuery.refetch()
    toast.success("Holiday data refreshed")
  }

  const resetAddForm = () => {
    setAddForm({
      holiday_name: "",
      start_date: "",
      end_date: "",
      description: "",
      status: "active",
    })
  }

  const handleAddHoliday = () => {
    resetAddForm()
    setAddDialogOpen(true)
  }

  const handleViewHoliday = (holiday: HolidayRecord) => {
    setSelectedHoliday(holiday)
    setViewDialogOpen(true)
  }

  const handleEditHoliday = (holiday: HolidayRecord) => {
    setSelectedHoliday(holiday)
    setEditForm({
      id: holiday.id,
      holiday_name: holiday.holiday_name,
      start_date: holiday.start_date,
      end_date: holiday.end_date,
      description: holiday.description ?? "",
      status: holiday.status,
    })
    setEditDialogOpen(true)
  }

  const handleDeleteHoliday = (holiday: HolidayRecord) => {
    setSelectedHoliday(holiday)
    setDeleteDialogOpen(true)
  }

  const closeEditModal = () => {
    setEditDialogOpen(false)
    setSelectedHoliday(null)
  }

  const closeViewModal = () => {
    setViewDialogOpen(false)
    setSelectedHoliday(null)
  }

  const closeDeleteModal = () => {
    setDeleteDialogOpen(false)
    setSelectedHoliday(null)
  }

  const handleCreateHoliday = () => {
    if (createMutation.isPending) return
    createMutation.mutate(addForm, {
      onSuccess: () => {
        toast.success("Holiday created")
        setAddDialogOpen(false)
        resetAddForm()
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Unable to create holiday")
      },
    })
  }

  const handleUpdateHoliday = () => {
    if (!editForm.id) {
      toast.error("Missing holiday id")
      return
    }
    if (updateMutation.isPending) return
    updateMutation.mutate(editForm, {
      onSuccess: () => {
        toast.success("Holiday updated")
        setEditDialogOpen(false)
        setSelectedHoliday(null)
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Unable to update holiday")
      },
    })
  }

  const handleDeleteConfirm = () => {
    if (!selectedHoliday) return
    if (deleteMutation.isPending) return
    deleteMutation.mutate(
      { id: selectedHoliday.id },
      {
        onSuccess: () => {
          toast.success("Holiday deleted")
          setDeleteDialogOpen(false)
          setSelectedHoliday(null)
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Unable to delete holiday")
        },
      },
    )
  }

  const columns = useMemo(
    () => [
      {
        key: "holiday_name",
        label: "Holiday",
        sortable: true,
        render: (value: string, row: HolidayRecord) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center cursor-default gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 truncate max-w-[180px]">{value}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[180px]">
                      {formatDate(row.start_date)} - {formatDate(row.end_date)}
                    </p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{row.description || "No details available"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
      },
      {
        key: "description",
        label: "Description",
        sortable: true,
        render: (value: string) => (
          <div className="truncate max-w-[180px] text-sm text-gray-600">{value || "—"}</div>
        ),
      },
      {
        key: "start_date",
        label: "From",
        sortable: true,
        render: (value: string) => formatDate(value),
      },
      {
        key: "end_date",
        label: "To",
        sortable: true,
        render: (value: string) => formatDate(value),
      },
      {
        key: "days",
        label: "Length",
        sortable: true,
        render: (_: string, row: HolidayRecord) =>
          differenceInDays(new Date(row.end_date), new Date(row.start_date)) + 1,
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        render: (value: string) => (
          <Badge
            className={`${
              value === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
            } capitalize px-2 py-1 text-xs font-semibold`}
          >
            {value || "inactive"}
          </Badge>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        render: (_: unknown, row: HolidayRecord) => (
          <div className="flex justify-start space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleViewHoliday(row)}
              title="View"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleEditHoliday(row)}
              title="Edit"
              className="text-blue-600 hover:text-blue-800"
              disabled={row.status !== "active"}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDeleteHoliday(row)}
              title="Delete"
              className="text-red-600 hover:text-red-800"
              disabled={row.status !== "active"}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [handleDeleteHoliday, handleEditHoliday, handleViewHoliday],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Holidays</h1>
          <p className="text-gray-600 mt-1">Configure approved company holidays and special observances.</p>
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
                <p>Refresh holiday data</p>
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
            <DropdownMenuItem disabled>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export to CSV
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <FileText className="mr-2 h-4 w-4" />
              Export to PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </DropdownMenuItem>
          </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={handleAddHoliday}
            className="h-10 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Holiday
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
              <CardTitle className="text-sm font-medium text-gray-500">{card.title}</CardTitle>
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
              <CardTitle className="text-lg font-semibold text-gray-900">Holiday Requests</CardTitle>
              <CardDescription className="text-gray-600">
                Review and manage the approved holidays in the system.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            title="Holiday Requests"
            columns={columns}
            data={holidays}
            searchFields={holidaySearchFields}
            defaultSortColumn="id"
            defaultSortDirection="desc"
            itemsPerPage={10}
            emptyMessage={
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 border border-blue-200 mb-4">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No holidays found</h3>
                <p className="text-gray-600 mb-4">Create your first holiday to populate the calendar.</p>
                <Button
                  onClick={handleAddHoliday}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Holiday
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Holiday</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Holiday Name</Label>
                <Input
                  id="name"
                  placeholder="Enter holiday name"
                  value={addForm.holiday_name}
                  onChange={(event) => setAddForm((prev) => ({ ...prev, holiday_name: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={addForm.status}
                  onValueChange={(value) =>
                    setAddForm((prev) => ({ ...prev, status: value as "active" | "inactive" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {holidayStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={addForm.start_date}
                  onChange={(event) => setAddForm((prev) => ({ ...prev, start_date: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={addForm.end_date}
                  onChange={(event) => setAddForm((prev) => ({ ...prev, end_date: event.target.value }))}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter holiday description"
                  value={addForm.description}
                  onChange={(event) => setAddForm((prev) => ({ ...prev, description: event.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} disabled={createMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleCreateHoliday} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saving..." : "Save Holiday"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={(open) => (open ? setEditDialogOpen(true) : closeEditModal())}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Holiday</DialogTitle>
          </DialogHeader>
          {selectedHoliday && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Holiday Name</Label>
                  <Input
                    id="edit-name"
                    value={editForm.holiday_name ?? selectedHoliday.holiday_name}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, holiday_name: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editForm.status ?? selectedHoliday.status}
                    onValueChange={(value) =>
                      setEditForm((prev) => ({ ...prev, status: value as "active" | "inactive" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {holidayStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-startDate">Start Date</Label>
                  <Input
                    id="edit-startDate"
                    type="date"
                    value={editForm.start_date ?? selectedHoliday.start_date}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, start_date: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-endDate">End Date</Label>
                  <Input
                    id="edit-endDate"
                    type="date"
                    value={editForm.end_date ?? selectedHoliday.end_date}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, end_date: event.target.value }))}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editForm.description ?? selectedHoliday.description ?? ""}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={updateMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleUpdateHoliday} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Update Holiday"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={(open) => (open ? setViewDialogOpen(true) : closeViewModal())}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Holiday Details</DialogTitle>
          </DialogHeader>
          {selectedHoliday && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Holiday</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedHoliday.holiday_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Status</h3>
                  <Badge
                    className={`${
                      selectedHoliday.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    } mt-1 px-2 py-1 text-xs font-semibold`}
                  >
                    {selectedHoliday.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Start Date</h3>
                  <p>{formatDate(selectedHoliday.start_date)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">End Date</h3>
                  <p>{formatDate(selectedHoliday.end_date)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Length</h3>
                  <p>
                    {differenceInDays(new Date(selectedHoliday.end_date), new Date(selectedHoliday.start_date)) + 1}{" "}
                    days
                  </p>
                </div>
                <div className="col-span-2">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Description</h3>
                  <p>{selectedHoliday.description || "No description provided"}</p>
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
        title="Delete Holiday"
        description={`Are you sure you want to delete ${selectedHoliday?.holiday_name ?? "this"} holiday?`}
        itemName={selectedHoliday?.holiday_name ?? "selected holiday"}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
