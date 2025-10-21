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

// Mock data for maintenance types
const mockMaintenanceTypes = [
  {
    id: "mt-001",
    name: "Preventive Maintenance",
    description: "Regular maintenance to prevent equipment failure",
    interval: "90",
    intervalUnit: "days",
    status: "active",
    createdAt: "2023-01-15T10:30:00Z",
    updatedAt: "2023-01-15T10:30:00Z",
  },
  {
    id: "mt-002",
    name: "Corrective Maintenance",
    description: "Maintenance performed to correct a fault or breakdown",
    interval: null,
    intervalUnit: null,
    status: "active",
    createdAt: "2023-01-15T10:35:00Z",
    updatedAt: "2023-01-15T10:35:00Z",
  },
  {
    id: "mt-003",
    name: "Condition-Based Maintenance",
    description: "Maintenance performed based on equipment condition",
    interval: null,
    intervalUnit: null,
    status: "active",
    createdAt: "2023-01-15T10:40:00Z",
    updatedAt: "2023-01-15T10:40:00Z",
  },
  {
    id: "mt-004",
    name: "Predictive Maintenance",
    description: "Maintenance based on prediction of equipment failure",
    interval: null,
    intervalUnit: null,
    status: "active",
    createdAt: "2023-01-15T10:45:00Z",
    updatedAt: "2023-01-15T10:45:00Z",
  },
  {
    id: "mt-005",
    name: "Routine Inspection",
    description: "Regular inspection of equipment",
    interval: "30",
    intervalUnit: "days",
    status: "active",
    createdAt: "2023-01-15T10:50:00Z",
    updatedAt: "2023-01-15T10:50:00Z",
  },
  {
    id: "mt-006",
    name: "Calibration",
    description: "Calibration of measuring equipment",
    interval: "180",
    intervalUnit: "days",
    status: "active",
    createdAt: "2023-01-15T10:55:00Z",
    updatedAt: "2023-01-15T10:55:00Z",
  },
  {
    id: "mt-007",
    name: "Software Update",
    description: "Update of software or firmware",
    interval: "90",
    intervalUnit: "days",
    status: "active",
    createdAt: "2023-01-15T11:00:00Z",
    updatedAt: "2023-01-15T11:00:00Z",
  },
  {
    id: "mt-008",
    name: "Battery Replacement",
    description: "Replacement of batteries",
    interval: "365",
    intervalUnit: "days",
    status: "active",
    createdAt: "2023-01-15T11:05:00Z",
    updatedAt: "2023-01-15T11:05:00Z",
  },
  {
    id: "mt-009",
    name: "Warranty Service",
    description: "Service performed under warranty",
    interval: null,
    intervalUnit: null,
    status: "inactive",
    createdAt: "2023-01-15T11:10:00Z",
    updatedAt: "2023-01-15T11:10:00Z",
  },
  {
    id: "mt-010",
    name: "Emergency Repair",
    description: "Urgent repair of critical equipment",
    interval: null,
    intervalUnit: null,
    status: "active",
    createdAt: "2023-01-15T11:15:00Z",
    updatedAt: "2023-01-15T11:15:00Z",
  },
]

export function MaintenanceTypesContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    interval: "",
    intervalUnit: "days",
    status: "active",
  })

  const columns = [
    {
      key: "id",
      label: "Type ID",
      sortable: true,
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
    },
    {
      key: "description",
      label: "Description",
      sortable: true,
    },
    {
      key: "interval",
      label: "Recommended Interval",
      sortable: true,
      render: (value: string | null, row: any) => {
        if (!value) return "As needed"
        return `${value} ${row.intervalUnit}`
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        return (
          <Badge className={value === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
            {value === "active" ? "Active" : "Inactive"}
          </Badge>
        )
      },
    },
  ]

  const filterOptions = [
    {
      id: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
      type: "select",
    },
    {
      id: "intervalUnit",
      label: "Interval Unit",
      options: [
        { value: "days", label: "Days" },
        { value: "weeks", label: "Weeks" },
        { value: "months", label: "Months" },
        { value: "years", label: "Years" },
      ],
      type: "select",
    },
  ]

  const handleAdd = () => {
    setFormData({
      name: "",
      description: "",
      interval: "",
      intervalUnit: "days",
      status: "active",
    })
    setIsAddDialogOpen(true)
  }

  const handleEdit = (id: string) => {
    const type = mockMaintenanceTypes.find((t) => t.id === id)
    if (type) {
      setSelectedType(type)
      setFormData({
        name: type.name,
        description: type.description,
        interval: type.interval || "",
        intervalUnit: type.intervalUnit || "days",
        status: type.status,
      })
      setIsEditDialogOpen(true)
    }
  }

  const handleView = (id: string) => {
    const type = mockMaintenanceTypes.find((t) => t.id === id)
    if (type) {
      setSelectedType(type)
      setIsViewDialogOpen(true)
    }
  }

  const handleDelete = (id: string) => {
    // In a real application, this would call an API to delete the maintenance type
    console.log(`Delete maintenance type with ID: ${id}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real application, this would call an API to add or update the maintenance type
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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Maintenance Types</h1>

      <EnhancedDataTable
        title="Maintenance Types"
        columns={columns}
        data={mockMaintenanceTypes}
        filterOptions={filterOptions}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* Add Maintenance Type Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Maintenance Type</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter maintenance type name"
                required
              />
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interval">Recommended Interval</Label>
                <Input
                  id="interval"
                  name="interval"
                  type="number"
                  value={formData.interval}
                  onChange={handleInputChange}
                  placeholder="Enter interval"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="intervalUnit">Interval Unit</Label>
                <Select
                  value={formData.intervalUnit}
                  onValueChange={(value) => handleSelectChange("intervalUnit", value)}
                >
                  <SelectTrigger id="intervalUnit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Save Type
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Maintenance Type Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Maintenance Type</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter maintenance type name"
                required
              />
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-interval">Recommended Interval</Label>
                <Input
                  id="edit-interval"
                  name="interval"
                  type="number"
                  value={formData.interval}
                  onChange={handleInputChange}
                  placeholder="Enter interval"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-intervalUnit">Interval Unit</Label>
                <Select
                  value={formData.intervalUnit}
                  onValueChange={(value) => handleSelectChange("intervalUnit", value)}
                >
                  <SelectTrigger id="edit-intervalUnit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Update Type
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Maintenance Type Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Maintenance Type Details</DialogTitle>
          </DialogHeader>
          {selectedType && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-gray-500">Type ID:</div>
                <div className="col-span-2">{selectedType.id}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-gray-500">Name:</div>
                <div className="col-span-2">{selectedType.name}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-gray-500">Description:</div>
                <div className="col-span-2">{selectedType.description}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-gray-500">Recommended Interval:</div>
                <div className="col-span-2">
                  {selectedType.interval ? `${selectedType.interval} ${selectedType.intervalUnit}` : "As needed"}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-gray-500">Status:</div>
                <div className="col-span-2">
                  <Badge
                    className={
                      selectedType.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }
                  >
                    {selectedType.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-gray-500">Created Date:</div>
                <div className="col-span-2">{format(new Date(selectedType.createdAt), "PPP")}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-gray-500">Last Updated:</div>
                <div className="col-span-2">{format(new Date(selectedType.updatedAt), "PPP")}</div>
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
                if (selectedType) {
                  handleEdit(selectedType.id)
                }
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Edit Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
