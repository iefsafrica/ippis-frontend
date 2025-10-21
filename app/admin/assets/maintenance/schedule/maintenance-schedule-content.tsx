"use client"

import type React from "react"

import { useState } from "react"
import { EnhancedDataTable } from "@/app/admin/components/enhanced-data-table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, isBefore, isAfter } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for assets
const mockAssets = [
  { id: "AST-001", name: "Dell XPS 15 Laptop" },
  { id: "AST-002", name: "Herman Miller Aeron Chair" },
  { id: "AST-003", name: "Toyota Camry" },
  { id: "AST-004", name: "iPhone 14 Pro" },
  { id: "AST-005", name: "Adobe Creative Cloud License" },
  { id: "AST-006", name: "Cisco Meraki MR46 Access Point" },
  { id: "AST-007", name: "HP LaserJet Pro Printer" },
  { id: "AST-008", name: "Conference Room Table" },
  { id: "AST-009", name: "Microsoft Surface Hub 2S" },
  { id: "AST-010", name: "Lenovo ThinkPad X1 Carbon" },
]

// Mock data for maintenance types
const mockMaintenanceTypes = [
  { id: "mt-001", name: "Preventive Maintenance" },
  { id: "mt-002", name: "Corrective Maintenance" },
  { id: "mt-003", name: "Condition-Based Maintenance" },
  { id: "mt-004", name: "Predictive Maintenance" },
  { id: "mt-005", name: "Routine Inspection" },
  { id: "mt-006", name: "Calibration" },
  { id: "mt-007", name: "Software Update" },
  { id: "mt-008", name: "Battery Replacement" },
  { id: "mt-009", name: "Warranty Service" },
  { id: "mt-010", name: "Emergency Repair" },
]

// Mock data for maintenance schedules
const mockMaintenanceSchedules = [
  {
    id: "MS-001",
    assetId: "AST-001",
    maintenanceTypeId: "mt-005",
    title: "Quarterly Laptop Inspection",
    description: "Routine inspection and cleaning of laptop",
    scheduledDate: "2023-07-15T10:00:00Z",
    assignedTo: "IT Department",
    priority: "medium",
    status: "scheduled",
    recurrence: "quarterly",
    notifyBefore: 3,
    notifyBeforeUnit: "days",
    estimatedCost: 0,
    notes: "Check for dust buildup and software updates",
    createdAt: "2023-06-01T10:30:00Z",
    updatedAt: "2023-06-01T10:30:00Z",
  },
  {
    id: "MS-002",
    assetId: "AST-003",
    maintenanceTypeId: "mt-001",
    title: "Vehicle Service",
    description: "Regular service and oil change",
    scheduledDate: "2023-07-20T14:00:00Z",
    assignedTo: "Auto Service Center",
    priority: "high",
    status: "scheduled",
    recurrence: "quarterly",
    notifyBefore: 7,
    notifyBeforeUnit: "days",
    estimatedCost: 100,
    notes: "Oil change, filter replacement, and fluid check",
    createdAt: "2023-06-05T14:00:00Z",
    updatedAt: "2023-06-05T14:00:00Z",
  },
  {
    id: "MS-003",
    assetId: "AST-006",
    maintenanceTypeId: "mt-007",
    title: "Access Point Firmware Update",
    description: "Update firmware to latest version",
    scheduledDate: "2023-07-05T09:00:00Z",
    assignedTo: "IT Department",
    priority: "medium",
    status: "overdue",
    recurrence: "quarterly",
    notifyBefore: 2,
    notifyBeforeUnit: "days",
    estimatedCost: 0,
    notes: "Check manufacturer website for latest firmware",
    createdAt: "2023-06-10T09:15:00Z",
    updatedAt: "2023-06-10T09:15:00Z",
  },
  {
    id: "MS-004",
    assetId: "AST-007",
    maintenanceTypeId: "mt-005",
    title: "Printer Maintenance",
    description: "Clean printer and check consumables",
    scheduledDate: "2023-07-10T11:00:00Z",
    assignedTo: "Office Manager",
    priority: "low",
    status: "scheduled",
    recurrence: "monthly",
    notifyBefore: 1,
    notifyBeforeUnit: "days",
    estimatedCost: 50,
    notes: "Check toner levels and order replacements if needed",
    createdAt: "2023-06-15T11:30:00Z",
    updatedAt: "2023-06-15T11:30:00Z",
  },
  {
    id: "MS-005",
    assetId: "AST-004",
    maintenanceTypeId: "mt-005",
    title: "Phone Inspection",
    description: "Check phone for updates and issues",
    scheduledDate: "2023-08-12T15:00:00Z",
    assignedTo: "IT Department",
    priority: "low",
    status: "scheduled",
    recurrence: "quarterly",
    notifyBefore: 2,
    notifyBeforeUnit: "days",
    estimatedCost: 0,
    notes: "Check for iOS updates and backup data",
    createdAt: "2023-06-20T15:45:00Z",
    updatedAt: "2023-06-20T15:45:00Z",
  },
  {
    id: "MS-006",
    assetId: "AST-009",
    maintenanceTypeId: "mt-007",
    title: "Surface Hub Update",
    description: "Software update and calibration",
    scheduledDate: "2023-07-18T09:00:00Z",
    assignedTo: "IT Department",
    priority: "medium",
    status: "scheduled",
    recurrence: "quarterly",
    notifyBefore: 3,
    notifyBeforeUnit: "days",
    estimatedCost: 0,
    notes: "Update software and calibrate touch screen",
    createdAt: "2023-06-25T09:30:00Z",
    updatedAt: "2023-06-25T09:30:00Z",
  },
  {
    id: "MS-007",
    assetId: "AST-003",
    maintenanceTypeId: "mt-001",
    title: "Vehicle Tire Rotation",
    description: "Rotate tires for even wear",
    scheduledDate: "2023-08-30T08:00:00Z",
    assignedTo: "Auto Service Center",
    priority: "medium",
    status: "scheduled",
    recurrence: "semi-annually",
    notifyBefore: 7,
    notifyBeforeUnit: "days",
    estimatedCost: 50,
    notes: "Rotate tires and check pressure",
    createdAt: "2023-06-30T08:15:00Z",
    updatedAt: "2023-06-30T08:15:00Z",
  },
  {
    id: "MS-008",
    assetId: "AST-002",
    maintenanceTypeId: "mt-005",
    title: "Chair Inspection",
    description: "Check chair mechanisms and clean",
    scheduledDate: "2023-09-15T13:00:00Z",
    assignedTo: "Facilities",
    priority: "low",
    status: "scheduled",
    recurrence: "annually",
    notifyBefore: 5,
    notifyBeforeUnit: "days",
    estimatedCost: 0,
    notes: "Inspect hydraulics and clean wheels",
    createdAt: "2023-07-01T13:20:00Z",
    updatedAt: "2023-07-01T13:20:00Z",
  },
  {
    id: "MS-009",
    assetId: "AST-001",
    maintenanceTypeId: "mt-008",
    title: "Laptop Battery Check",
    description: "Check battery health and replace if needed",
    scheduledDate: "2023-12-15T14:00:00Z",
    assignedTo: "IT Department",
    priority: "medium",
    status: "scheduled",
    recurrence: "annually",
    notifyBefore: 14,
    notifyBeforeUnit: "days",
    estimatedCost: 150,
    notes: "Check battery health and replace if necessary",
    createdAt: "2023-07-05T14:45:00Z",
    updatedAt: "2023-07-05T14:45:00Z",
  },
  {
    id: "MS-010",
    assetId: "AST-010",
    maintenanceTypeId: "mt-005",
    title: "Laptop Pre-deployment Check",
    description: "Prepare laptop for new employee",
    scheduledDate: "2023-07-25T10:00:00Z",
    assignedTo: "IT Department",
    priority: "high",
    status: "scheduled",
    recurrence: "one-time",
    notifyBefore: 2,
    notifyBeforeUnit: "days",
    estimatedCost: 0,
    notes: "Install company software and configure settings",
    createdAt: "2023-07-10T10:00:00Z",
    updatedAt: "2023-07-10T10:00:00Z",
  },
]

// Calculate maintenance schedule statistics
const today = new Date()
const scheduleSummary = {
  total: mockMaintenanceSchedules.length,
  upcoming: mockMaintenanceSchedules.filter(
    (schedule) => schedule.status === "scheduled" && isAfter(new Date(schedule.scheduledDate), today),
  ).length,
  overdue: mockMaintenanceSchedules.filter(
    (schedule) =>
      (schedule.status === "scheduled" || schedule.status === "overdue") &&
      isBefore(new Date(schedule.scheduledDate), today),
  ).length,
}

export function MaintenanceScheduleContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null)
  const [formData, setFormData] = useState({
    assetId: "",
    maintenanceTypeId: "",
    title: "",
    description: "",
    scheduledDate: null as Date | null,
    assignedTo: "",
    priority: "medium",
    status: "scheduled",
    recurrence: "one-time",
    notifyBefore: "",
    notifyBeforeUnit: "days",
    estimatedCost: "",
    notes: "",
  })

  const columns = [
    {
      key: "id",
      label: "Schedule ID",
      sortable: true,
    },
    {
      key: "title",
      label: "Title",
      sortable: true,
    },
    {
      key: "assetId",
      label: "Asset",
      sortable: true,
      render: (value: string) => {
        const asset = mockAssets.find((a) => a.id === value)
        return asset ? asset.name : value
      },
    },
    {
      key: "maintenanceTypeId",
      label: "Maintenance Type",
      sortable: true,
      render: (value: string) => {
        const type = mockMaintenanceTypes.find((t) => t.id === value)
        return type ? type.name : value
      },
    },
    {
      key: "scheduledDate",
      label: "Scheduled Date",
      sortable: true,
      render: (value: string) => format(new Date(value), "MMM dd, yyyy"),
    },
    {
      key: "assignedTo",
      label: "Assigned To",
      sortable: true,
    },
    {
      key: "priority",
      label: "Priority",
      sortable: true,
      render: (value: string) => {
        let badgeClass = ""

        switch (value) {
          case "high":
            badgeClass = "bg-red-100 text-red-800"
            break
          case "medium":
            badgeClass = "bg-yellow-100 text-yellow-800"
            break
          case "low":
            badgeClass = "bg-blue-100 text-blue-800"
            break
          default:
            badgeClass = "bg-gray-100 text-gray-800"
        }

        return <Badge className={badgeClass}>{value.charAt(0).toUpperCase() + value.slice(1)}</Badge>
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string, row: any) => {
        let badgeClass = ""
        let label = ""

        if (value === "completed") {
          badgeClass = "bg-green-100 text-green-800"
          label = "Completed"
        } else if (value === "in-progress") {
          badgeClass = "bg-blue-100 text-blue-800"
          label = "In Progress"
        } else if (value === "scheduled") {
          const scheduleDate = new Date(row.scheduledDate)
          if (isBefore(scheduleDate, today)) {
            badgeClass = "bg-red-100 text-red-800"
            label = "Overdue"
          } else {
            badgeClass = "bg-purple-100 text-purple-800"
            label = "Scheduled"
          }
        } else if (value === "overdue") {
          badgeClass = "bg-red-100 text-red-800"
          label = "Overdue"
        } else if (value === "cancelled") {
          badgeClass = "bg-gray-100 text-gray-800"
          label = "Cancelled"
        }

        return <Badge className={badgeClass}>{label}</Badge>
      },
    },
    {
      key: "recurrence",
      label: "Recurrence",
      sortable: true,
      render: (value: string) => {
        return value.charAt(0).toUpperCase() + value.slice(1).replace("-", " ")
      },
    },
  ]

  const filterOptions = [
    {
      id: "assetId",
      label: "Asset",
      options: mockAssets.map((asset) => ({ value: asset.id, label: asset.name })),
      type: "select",
    },
    {
      id: "maintenanceTypeId",
      label: "Maintenance Type",
      options: mockMaintenanceTypes.map((type) => ({ value: type.id, label: type.name })),
      type: "select",
    },
    {
      id: "priority",
      label: "Priority",
      options: [
        { value: "high", label: "High" },
        { value: "medium", label: "Medium" },
        { value: "low", label: "Low" },
      ],
      type: "select",
    },
    {
      id: "status",
      label: "Status",
      options: [
        { value: "scheduled", label: "Scheduled" },
        { value: "in-progress", label: "In Progress" },
        { value: "completed", label: "Completed" },
        { value: "overdue", label: "Overdue" },
        { value: "cancelled", label: "Cancelled" },
      ],
      type: "select",
    },
    {
      id: "recurrence",
      label: "Recurrence",
      options: [
        { value: "one-time", label: "One Time" },
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
        { value: "monthly", label: "Monthly" },
        { value: "quarterly", label: "Quarterly" },
        { value: "semi-annually", label: "Semi-Annually" },
        { value: "annually", label: "Annually" },
      ],
      type: "select",
    },
    {
      id: "scheduledDate",
      label: "Scheduled Date",
      type: "date",
    },
  ]

  const handleAdd = () => {
    setFormData({
      assetId: "",
      maintenanceTypeId: "",
      title: "",
      description: "",
      scheduledDate: null,
      assignedTo: "",
      priority: "medium",
      status: "scheduled",
      recurrence: "one-time",
      notifyBefore: "",
      notifyBeforeUnit: "days",
      estimatedCost: "",
      notes: "",
    })
    setIsAddDialogOpen(true)
  }

  const handleEdit = (id: string) => {
    const schedule = mockMaintenanceSchedules.find((s) => s.id === id)
    if (schedule) {
      setSelectedSchedule(schedule)
      setFormData({
        assetId: schedule.assetId,
        maintenanceTypeId: schedule.maintenanceTypeId,
        title: schedule.title,
        description: schedule.description,
        scheduledDate: new Date(schedule.scheduledDate),
        assignedTo: schedule.assignedTo,
        priority: schedule.priority,
        status: schedule.status,
        recurrence: schedule.recurrence,
        notifyBefore: schedule.notifyBefore.toString(),
        notifyBeforeUnit: schedule.notifyBeforeUnit,
        estimatedCost: schedule.estimatedCost.toString(),
        notes: schedule.notes,
      })
      setIsEditDialogOpen(true)
    }
  }

  const handleView = (id: string) => {
    const schedule = mockMaintenanceSchedules.find((s) => s.id === id)
    if (schedule) {
      setSelectedSchedule(schedule)
      setIsViewDialogOpen(true)
    }
  }

  const handleDelete = (id: string) => {
    // In a real application, this would call an API to delete the maintenance schedule
    console.log(`Delete maintenance schedule with ID: ${id}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real application, this would call an API to add or update the maintenance schedule
    console.log("Form submitted:", formData)
    setIsAddDialogOpen(false)
    setIsEditDialogOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name: string, date: Date | null) => {
    setFormData((prev) => ({ ...prev, [name]: date }))
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Maintenance Schedule</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Scheduled</p>
              <h3 className="text-2xl font-bold">{scheduleSummary.total}</h3>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Upcoming</p>
              <h3 className="text-2xl font-bold">{scheduleSummary.upcoming}</h3>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Overdue</p>
              <h3 className="text-2xl font-bold">{scheduleSummary.overdue}</h3>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </CardContent>
        </Card>
      </div>

      <EnhancedDataTable
        title="Maintenance Schedule"
        columns={columns}
        data={mockMaintenanceSchedules}
        filterOptions={filterOptions}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* Add Maintenance Schedule Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Schedule Maintenance</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="py-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="additional">Additional Info</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter maintenance title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assetId">Asset</Label>
                  <Select value={formData.assetId} onValueChange={(value) => handleSelectChange("assetId", value)}>
                    <SelectTrigger id="assetId">
                      <SelectValue placeholder="Select asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockAssets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenanceTypeId">Maintenance Type</Label>
                  <Select
                    value={formData.maintenanceTypeId}
                    onValueChange={(value) => handleSelectChange("maintenanceTypeId", value)}
                  >
                    <SelectTrigger id="maintenanceTypeId">
                      <SelectValue placeholder="Select maintenance type" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockMaintenanceTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>
              </TabsContent>
              <TabsContent value="schedule" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.scheduledDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.scheduledDate ? format(formData.scheduledDate, "PPP") : <span>Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.scheduledDate || undefined}
                        onSelect={(date) => handleDateChange("scheduledDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input
                    id="assignedTo"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    placeholder="Enter assignee"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recurrence">Recurrence</Label>
                  <Select
                    value={formData.recurrence}
                    onValueChange={(value) => handleSelectChange("recurrence", value)}
                  >
                    <SelectTrigger id="recurrence">
                      <SelectValue placeholder="Select recurrence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-time">One Time</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="semi-annually">Semi-Annually</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              <TabsContent value="additional" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="notifyBefore">Notify Before</Label>
                    <Input
                      id="notifyBefore"
                      name="notifyBefore"
                      type="number"
                      value={formData.notifyBefore}
                      onChange={handleInputChange}
                      placeholder="Enter number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notifyBeforeUnit">Unit</Label>
                    <Select
                      value={formData.notifyBeforeUnit}
                      onValueChange={(value) => handleSelectChange("notifyBeforeUnit", value)}
                    >
                      <SelectTrigger id="notifyBeforeUnit">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="weeks">Weeks</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedCost">Estimated Cost ($)</Label>
                  <Input
                    id="estimatedCost"
                    name="estimatedCost"
                    type="number"
                    step="0.01"
                    value={formData.estimatedCost}
                    onChange={handleInputChange}
                    placeholder="Enter estimated cost"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger id="status">
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
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Enter additional notes"
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Schedule Maintenance
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Maintenance Schedule Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Edit Maintenance Schedule</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="py-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="additional">Additional Info</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter maintenance title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-assetId">Asset</Label>
                  <Select value={formData.assetId} onValueChange={(value) => handleSelectChange("assetId", value)}>
                    <SelectTrigger id="edit-assetId">
                      <SelectValue placeholder="Select asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockAssets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-maintenanceTypeId">Maintenance Type</Label>
                  <Select
                    value={formData.maintenanceTypeId}
                    onValueChange={(value) => handleSelectChange("maintenanceTypeId", value)}
                  >
                    <SelectTrigger id="edit-maintenanceTypeId">
                      <SelectValue placeholder="Select maintenance type" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockMaintenanceTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>
              </TabsContent>
              <TabsContent value="schedule" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-scheduledDate">Scheduled Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.scheduledDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.scheduledDate ? format(formData.scheduledDate, "PPP") : <span>Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.scheduledDate || undefined}
                        onSelect={(date) => handleDateChange("scheduledDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-assignedTo">Assigned To</Label>
                  <Input
                    id="edit-assignedTo"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    placeholder="Enter assignee"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
                    <SelectTrigger id="edit-priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-recurrence">Recurrence</Label>
                  <Select
                    value={formData.recurrence}
                    onValueChange={(value) => handleSelectChange("recurrence", value)}
                  >
                    <SelectTrigger id="edit-recurrence">
                      <SelectValue placeholder="Select recurrence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-time">One Time</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="semi-annually">Semi-Annually</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              <TabsContent value="additional" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-notifyBefore">Notify Before</Label>
                    <Input
                      id="edit-notifyBefore"
                      name="notifyBefore"
                      type="number"
                      value={formData.notifyBefore}
                      onChange={handleInputChange}
                      placeholder="Enter number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-notifyBeforeUnit">Unit</Label>
                    <Select
                      value={formData.notifyBeforeUnit}
                      onValueChange={(value) => handleSelectChange("notifyBeforeUnit", value)}
                    >
                      <SelectTrigger id="edit-notifyBeforeUnit">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="weeks">Weeks</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-estimatedCost">Estimated Cost ($)</Label>
                  <Input
                    id="edit-estimatedCost"
                    name="estimatedCost"
                    type="number"
                    step="0.01"
                    value={formData.estimatedCost}
                    onChange={handleInputChange}
                    placeholder="Enter estimated cost"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger id="edit-status">
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
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Enter additional notes"
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Update Schedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Maintenance Schedule Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Maintenance Schedule Details</DialogTitle>
          </DialogHeader>
          {selectedSchedule && (
            <div className="py-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  <TabsTrigger value="additional">Additional Info</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Schedule ID:</div>
                    <div className="col-span-2">{selectedSchedule.id}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Title:</div>
                    <div className="col-span-2">{selectedSchedule.title}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Asset:</div>
                    <div className="col-span-2">
                      {mockAssets.find((a) => a.id === selectedSchedule.assetId)?.name || selectedSchedule.assetId}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Maintenance Type:</div>
                    <div className="col-span-2">
                      {mockMaintenanceTypes.find((t) => t.id === selectedSchedule.maintenanceTypeId)?.name ||
                        selectedSchedule.maintenanceTypeId}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Description:</div>
                    <div className="col-span-2">{selectedSchedule.description}</div>
                  </div>
                </TabsContent>
                <TabsContent value="schedule" className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Scheduled Date:</div>
                    <div className="col-span-2">{format(new Date(selectedSchedule.scheduledDate), "PPP")}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Assigned To:</div>
                    <div className="col-span-2">{selectedSchedule.assignedTo}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Priority:</div>
                    <div className="col-span-2">
                      <Badge
                        className={
                          selectedSchedule.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : selectedSchedule.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                        }
                      >
                        {selectedSchedule.priority.charAt(0).toUpperCase() + selectedSchedule.priority.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Status:</div>
                    <div className="col-span-2">
                      <Badge
                        className={
                          selectedSchedule.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : selectedSchedule.status === "in-progress"
                              ? "bg-blue-100 text-blue-800"
                              : selectedSchedule.status === "scheduled"
                                ? isBefore(new Date(selectedSchedule.scheduledDate), today)
                                  ? "bg-red-100 text-red-800"
                                  : "bg-purple-100 text-purple-800"
                                : selectedSchedule.status === "overdue"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                        }
                      >
                        {selectedSchedule.status === "completed"
                          ? "Completed"
                          : selectedSchedule.status === "in-progress"
                            ? "In Progress"
                            : selectedSchedule.status === "scheduled"
                              ? isBefore(new Date(selectedSchedule.scheduledDate), today)
                                ? "Overdue"
                                : "Scheduled"
                              : selectedSchedule.status === "overdue"
                                ? "Overdue"
                                : "Cancelled"}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Recurrence:</div>
                    <div className="col-span-2">
                      {selectedSchedule.recurrence.charAt(0).toUpperCase() +
                        selectedSchedule.recurrence.slice(1).replace("-", " ")}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="additional" className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Notify Before:</div>
                    <div className="col-span-2">
                      {selectedSchedule.notifyBefore} {selectedSchedule.notifyBeforeUnit}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Estimated Cost:</div>
                    <div className="col-span-2">${selectedSchedule.estimatedCost.toFixed(2)}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Notes:</div>
                    <div className="col-span-2">{selectedSchedule.notes}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Created Date:</div>
                    <div className="col-span-2">{format(new Date(selectedSchedule.createdAt), "PPP")}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Last Updated:</div>
                    <div className="col-span-2">{format(new Date(selectedSchedule.updatedAt), "PPP")}</div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsViewDialogOpen(false)
                if (selectedSchedule) {
                  handleEdit(selectedSchedule.id)
                }
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Edit Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
