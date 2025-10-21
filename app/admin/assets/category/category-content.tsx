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

// Mock data for asset categories
const mockCategories = [
  {
    id: "cat-001",
    name: "Computer Equipment",
    description: "Desktop computers, laptops, servers, and related hardware",
    status: "active",
    createdAt: "2023-01-15T08:30:00Z",
    updatedAt: "2023-06-20T14:45:00Z",
  },
  {
    id: "cat-002",
    name: "Office Furniture",
    description: "Desks, chairs, cabinets, and other office furniture items",
    status: "active",
    createdAt: "2023-01-20T09:15:00Z",
    updatedAt: "2023-05-12T11:30:00Z",
  },
  {
    id: "cat-003",
    name: "Vehicles",
    description: "Company cars, trucks, and other transportation assets",
    status: "active",
    createdAt: "2023-02-05T10:45:00Z",
    updatedAt: "2023-07-18T16:20:00Z",
  },
  {
    id: "cat-004",
    name: "Communication Devices",
    description: "Mobile phones, tablets, and other communication equipment",
    status: "active",
    createdAt: "2023-02-10T13:20:00Z",
    updatedAt: "2023-04-30T09:10:00Z",
  },
  {
    id: "cat-005",
    name: "Software Licenses",
    description: "Software licenses and subscriptions",
    status: "inactive",
    createdAt: "2023-03-01T11:00:00Z",
    updatedAt: "2023-08-05T15:40:00Z",
  },
  {
    id: "cat-006",
    name: "Network Equipment",
    description: "Routers, switches, access points, and other network infrastructure",
    status: "active",
    createdAt: "2023-03-15T14:30:00Z",
    updatedAt: "2023-07-25T10:15:00Z",
  },
  {
    id: "cat-007",
    name: "Office Supplies",
    description: "General office supplies and consumables",
    status: "inactive",
    createdAt: "2023-04-02T09:45:00Z",
    updatedAt: "2023-06-10T13:50:00Z",
  },
]

export function CategoryContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
  })

  const columns = [
    {
      key: "id",
      label: "Category ID",
      sortable: true,
    },
    {
      key: "name",
      label: "Category Name",
      sortable: true,
    },
    {
      key: "description",
      label: "Description",
      sortable: false,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => (
        <Badge className={value === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {value === "active" ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created Date",
      sortable: true,
      render: (value: string) => format(new Date(value), "MMM dd, yyyy"),
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
  ]

  const handleAdd = () => {
    setFormData({
      name: "",
      description: "",
      status: "active",
    })
    setIsAddDialogOpen(true)
  }

  const handleEdit = (id: string) => {
    const category = mockCategories.find((cat) => cat.id === id)
    if (category) {
      setSelectedCategory(category)
      setFormData({
        name: category.name,
        description: category.description,
        status: category.status,
      })
      setIsEditDialogOpen(true)
    }
  }

  const handleView = (id: string) => {
    const category = mockCategories.find((cat) => cat.id === id)
    if (category) {
      setSelectedCategory(category)
      setIsViewDialogOpen(true)
    }
  }

  const handleDelete = (id: string) => {
    // In a real application, this would call an API to delete the category
    console.log(`Delete category with ID: ${id}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real application, this would call an API to add or update the category
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
      <h1 className="text-2xl font-bold">Asset Categories</h1>

      <EnhancedDataTable
        title="Asset Categories"
        columns={columns}
        data={mockCategories}
        filterOptions={filterOptions}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Asset Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter category name"
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
                placeholder="Enter category description"
                rows={4}
              />
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
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Save Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Asset Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Category Name</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter category name"
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
                placeholder="Enter category description"
                rows={4}
              />
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
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Update Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Category Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Category Details</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-gray-500">Category ID:</div>
                <div className="col-span-2">{selectedCategory.id}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-gray-500">Category Name:</div>
                <div className="col-span-2">{selectedCategory.name}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-gray-500">Description:</div>
                <div className="col-span-2">{selectedCategory.description}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-gray-500">Status:</div>
                <div className="col-span-2">
                  <Badge
                    className={
                      selectedCategory.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }
                  >
                    {selectedCategory.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-gray-500">Created Date:</div>
                <div className="col-span-2">{format(new Date(selectedCategory.createdAt), "PPP")}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-gray-500">Last Updated:</div>
                <div className="col-span-2">{format(new Date(selectedCategory.updatedAt), "PPP")}</div>
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
                if (selectedCategory) {
                  handleEdit(selectedCategory.id)
                }
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Edit Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
