"use client"

import type React from "react"

import { useState } from "react"
import { EnhancedDataTable } from "@/app/admin/components/enhanced-data-table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

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

// Mock data for maintenance logs
const mockMaintenanceLogs = [
  {
    id: "ML-001",
    assetId: "AST-001",
    maintenanceTypeId: "mt-005",
    description: "Routine inspection and cleaning of laptop",
    performedBy: "John Technician",
    performedDate: "2023-03-15T10:30:00Z",
    cost: 0,
    status: "completed",
    notes: "Cleaned dust from fans and keyboard",
    createdAt: "2023-03-15T10:30:00Z",
    updatedAt: "2023-03-15T10:30:00Z",
  },
  {
    id: "ML-002",
    assetId: "AST-003",
    maintenanceTypeId: "mt-001",
    description: "Regular service and oil change",
    performedBy: "Auto Service Center",
    performedDate: "2023-02-20T14:00:00Z",
    cost: 89.99,
    status: "completed",
    notes: "Changed oil, replaced air filter, topped up fluids",
    createdAt: "2023-02-20T14:00:00Z",
    updatedAt: "2023-02-20T14:00:00Z",
  },
  {
    id: "ML-003",
    assetId: "AST-006",
    maintenanceTypeId: "mt-007",
    description: "Firmware update",
    performedBy: "IT Department",
    performedDate: "2023-04-05T09:15:00Z",
    cost: 0,
    status: "completed",
    notes: "Updated firmware to version 2.5.3",
    createdAt: "2023-04-05T09:15:00Z",
    updatedAt: "2023-04-05T09:15:00Z",
  },
  {
    id: "ML-004",
    assetId: "AST-007",
    maintenanceTypeId: "mt-002",
    description: "Repair paper jam mechanism",
    performedBy: "HP Service Center",
    performedDate: "2023-01-10T11:30:00Z",
    cost: 149.99,
    status: "completed",
    notes: "Replaced paper pickup roller and sensor",
    createdAt: "2023-01-10T11:30:00Z",
    updatedAt: "2023-01-10T11:30:00Z",
  },
  {
    id: "ML-005",
    assetId: "AST-004",
    maintenanceTypeId: "mt-009",
    description: "Screen replacement under warranty",
    performedBy: "Apple Store",
    performedDate: "2023-05-12T15:45:00Z",
    cost: 0,
    status: "completed",
    notes: "Replaced cracked screen under AppleCare+",
    createdAt: "2023-05-12T15:45:00Z",
    updatedAt: "2023-05-12T15:45:00Z",
  },
  {
    id: "ML-006",
    assetId: "AST-010",
    maintenanceTypeId: "mt-005",
    description: "Routine inspection before deployment",
    performedBy: "IT Department",
    performedDate: "2023-06-01T10:00:00Z",
    cost: 0,
    status: "completed",
    notes: "Checked hardware and installed company software",
    createdAt: "2023-06-01T10:00:00Z",
    updatedAt: "2023-06-01T10:00:00Z",
  },
  {
    id: "ML-007",
    assetId: "AST-002",
    maintenanceTypeId: "mt-002",
    description: "Repair hydraulic cylinder",
    performedBy: "Office Furniture Repair",
    performedDate: "2023-03-25T13:20:00Z",
    cost: 75.5,
    status: "completed",
    notes: "Replaced faulty hydraulic cylinder",
    createdAt: "2023-03-25T13:20:00Z",
    updatedAt: "2023-03-25T13:20:00Z",
  },
  {
    id: "ML-008",
    assetId: "AST-009",
    maintenanceTypeId: "mt-007",
    description: "Software update and calibration",
    performedBy: "Microsoft Support",
    performedDate: "2023-04-18T09:30:00Z",
    cost: 0,
    status: "completed",
    notes: "Updated software and calibrated touch screen",
    createdAt: "2023-04-18T09:30:00Z",
    updatedAt: "2023-04-18T09:30:00Z",
  },
  {
    id: "ML-009",
    assetId: "AST-003",
    maintenanceTypeId: "mt-010",
    description: "Emergency brake repair",
    performedBy: "Auto Service Center",
    performedDate: "2023-05-30T08:15:00Z",
    cost: 350.0,
    status: "completed",
    notes: "Replaced brake pads and rotors",
    createdAt: "2023-05-30T08:15:00Z",
    updatedAt: "2023-05-30T08:15:00Z",
  },
  {
    id: "ML-010",
    assetId: "AST-001",
    maintenanceTypeId: "mt-008",
    description: "Battery replacement",
    performedBy: "IT Department",
    performedDate: "2023-06-15T14:45:00Z",
    cost: 129.99,
    status: "completed",
    notes: "Replaced original battery with new one",
    createdAt: "2023-06-15T14:45:00Z",
    updatedAt: "2023-06-15T14:45:00Z",
  },
]

export function MaintenanceLogContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<any>(null)
  const [formData, setFormData] = useState({
    assetId: "",
    maintenanceTypeId: "",
    description: "",
    performedBy: "",
    performedDate: null as Date | null,
    cost: "",
    status: "completed",
    notes: "",
  })

  const columns = [
    {
      key: "id",
      label: "Log ID",
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
      key: "description",
      label: "Description",
      sortable: true,
    },
    {
      key: "performedBy",
      label: "Performed By",
      sortable: true,
    },
    {
      key: "performedDate",
      label: "Date Performed",
      sortable: true,
      render: (value: string) => format(new Date(value), "MMM dd, yyyy"),
    },
    {
      key: "cost",
      label: "Cost",
      sortable: true,
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        return (
          <Badge className={value === "completed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
            {value === "completed" ? "Completed" : "In Progress"}
          </Badge>
        )
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
      id: "status",
      label: "Status",
      options: [
        { value: "completed", label: "Completed" },
        { value: "in-progress", label: "In Progress" },
      ],
      type: "select",
    },
    {
      id: "performedDate",
      label: "Date Performed",
      type: "date",
    },
  ]

  const handleAdd = () => {
    setFormData({
      assetId: "",
      maintenanceTypeId: "",
      description: "",
      performedBy: "",
      performedDate: null,
      cost: "",
      status: "completed",
      notes: "",
    })
    setIsAddDialogOpen(true)
  }

  const handleEdit = (id: string) => {
    const log = mockMaintenanceLogs.find((l) => l.id === id)
    if (log) {
      setSelectedLog(log)
      setFormData({
        assetId: log.assetId,
        maintenanceTypeId: log.maintenanceTypeId,
        description: log.description,
        performedBy: log.performedBy,
        performedDate: new Date(log.performedDate),
        cost: log.cost.toString(),
        status: log.status,
        notes: log.notes,
      })
      setIsEditDialogOpen(true)
    }
  }

  const handleView = (id: string) => {
    const log = mockMaintenanceLogs.find((l) => l.id === id)
    if (log) {
      setSelectedLog(log)
      setIsViewDialogOpen(true)
    }
  }

  const handleDelete = (id: string) => {
    // In a real application, this would call an API to delete the maintenance log
    console.log(`Delete maintenance log with ID: ${id}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real application, this would call an API to add or update the maintenance log
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
      <h1 className="text-2xl font-bold">Maintenance Log</h1>

      <EnhancedDataTable
        title="Maintenance Records"
        columns={columns}
        data={mockMaintenanceLogs}
        filterOptions={filterOptions}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* Add Maintenance Log Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Maintenance Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter description"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="performedBy">Performed By</Label>
              <Input
                id="performedBy"
                name="performedBy"
                value={formData.performedBy}
                onChange={handleInputChange}
                placeholder="Enter name or company"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="performedDate">Date Performed</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.performedDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.performedDate ? format(formData.performedDate, "PPP") : <span>Select date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.performedDate || undefined}
                    onSelect={(date) => handleDateChange("performedDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Cost ($)</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={handleInputChange}
                placeholder="Enter cost"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Save Record
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Maintenance Log Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Maintenance Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
              <Input
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter description"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-performedBy">Performed By</Label>
              <Input
                id="edit-performedBy"
                name="performedBy"
                value={formData.performedBy}
                onChange={handleInputChange}
                placeholder="Enter name or company"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-performedDate">Date Performed</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.performedDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.performedDate ? format(formData.performedDate, "PPP") : <span>Select date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.performedDate || undefined}
                    onSelect={(date) => handleDateChange("performedDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cost">Cost ($)</Label>
              <Input
                id="edit-cost"
                name="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={handleInputChange}
                placeholder="Enter cost"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Update Record
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Maintenance Log Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Maintenance Record Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-gray-500">Log ID:</div>
                <div className="col-span-2">{selectedLog.id}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-gray-500">Asset:</div>
                <div className="col-span-2">
                  {mockAssets.find((a) => a.id === selectedLog.assetId)?.name || selectedLog.assetId}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-gray-500">Maintenance Type:</div>
                <div className="col-span-2">
                  {mockMaintenanceTypes.find((t) => t.id === selectedLog.maintenanceTypeId)?.name ||
                    selectedLog.maintenanceTypeId}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-gray-500">Description:</div>
                <div className="col-span-2">{selectedLog.description}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-gray-500">Performed By:</div>
                <div className="col-span-2">{selectedLog.performedBy}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-gray-500">Date Performed:</div>
                <div className="col-span-2">{format(new Date(selectedLog.performedDate), "PPP")}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-gray-500">Cost:</div>
                <div className="col-span-2">${selectedLog.cost.toFixed(2)}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-gray-500">Status:</div>
                <div className="col-span-2">
                  <Badge
                    className={
                      selectedLog.status === "completed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                    }
                  >
                    {selectedLog.status === "completed" ? "Completed" : "In Progress"}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-gray-500">Notes:</div>
                <div className="col-span-2">{selectedLog.notes}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-gray-500">Created Date:</div>
                <div className="col-span-2">{format(new Date(selectedLog.createdAt), "PPP")}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-gray-500">Last Updated:</div>
                <div className="col-span-2">{format(new Date(selectedLog.updatedAt), "PPP")}</div>
              </div>
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
                if (selectedLog) {
                  handleEdit(selectedLog.id)
                }
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Edit Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
