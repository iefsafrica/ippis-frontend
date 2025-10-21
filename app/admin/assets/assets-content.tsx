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
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, DollarSign, Package, Truck, Users } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data for asset categories
const mockCategories = [
  { id: "cat-001", name: "Computer Equipment" },
  { id: "cat-002", name: "Office Furniture" },
  { id: "cat-003", name: "Vehicles" },
  { id: "cat-004", name: "Communication Devices" },
  { id: "cat-005", name: "Software Licenses" },
  { id: "cat-006", name: "Network Equipment" },
  { id: "cat-007", name: "Office Supplies" },
]

// Mock data for assets
const mockAssets = [
  {
    id: "AST-001",
    name: "Dell XPS 15 Laptop",
    categoryId: "cat-001",
    purchaseDate: "2023-01-10T00:00:00Z",
    purchaseValue: 1899.99,
    currentValue: 1520.0,
    depreciation: 20,
    location: "Headquarters - Floor 3",
    assignedTo: "John Smith",
    status: "in-use",
    serialNumber: "DXPS15-78945612",
    warrantyExpiry: "2026-01-10T00:00:00Z",
    notes: "Executive laptop with premium support",
    createdAt: "2023-01-12T10:30:00Z",
    updatedAt: "2023-06-15T14:20:00Z",
  },
  {
    id: "AST-002",
    name: "Herman Miller Aeron Chair",
    categoryId: "cat-002",
    purchaseDate: "2022-11-05T00:00:00Z",
    purchaseValue: 1095.0,
    currentValue: 985.5,
    depreciation: 10,
    location: "Headquarters - Floor 2",
    assignedTo: "Sarah Johnson",
    status: "in-use",
    serialNumber: "HM-AER-456789",
    warrantyExpiry: "2032-11-05T00:00:00Z",
    notes: "Ergonomic office chair - Size B",
    createdAt: "2022-11-07T09:15:00Z",
    updatedAt: "2023-04-20T11:45:00Z",
  },
  {
    id: "AST-003",
    name: "Toyota Camry",
    categoryId: "cat-003",
    purchaseDate: "2022-06-15T00:00:00Z",
    purchaseValue: 28500.0,
    currentValue: 24225.0,
    depreciation: 15,
    location: "Company Garage",
    assignedTo: "Michael Brown",
    status: "in-use",
    serialNumber: "VIN-4T1BF1FK5CU123456",
    warrantyExpiry: "2027-06-15T00:00:00Z",
    notes: "Company car for executive use",
    createdAt: "2022-06-16T13:40:00Z",
    updatedAt: "2023-02-10T10:30:00Z",
  },
  {
    id: "AST-004",
    name: "iPhone 14 Pro",
    categoryId: "cat-004",
    purchaseDate: "2023-03-20T00:00:00Z",
    purchaseValue: 1099.0,
    currentValue: 989.1,
    depreciation: 10,
    location: "Headquarters - Floor 1",
    assignedTo: "Emily Davis",
    status: "in-use",
    serialNumber: "IMEI-356938102345678",
    warrantyExpiry: "2025-03-20T00:00:00Z",
    notes: "Company phone with business plan",
    createdAt: "2023-03-21T15:10:00Z",
    updatedAt: "2023-05-05T09:25:00Z",
  },
  {
    id: "AST-005",
    name: "Adobe Creative Cloud License",
    categoryId: "cat-005",
    purchaseDate: "2023-02-01T00:00:00Z",
    purchaseValue: 599.88,
    currentValue: 599.88,
    depreciation: 0,
    location: "Digital Asset",
    assignedTo: "Design Department",
    status: "active",
    serialNumber: "ADOBE-CC-789456123",
    warrantyExpiry: "2024-02-01T00:00:00Z",
    notes: "Annual subscription for design team",
    createdAt: "2023-02-01T11:20:00Z",
    updatedAt: "2023-02-01T11:20:00Z",
  },
  {
    id: "AST-006",
    name: "Cisco Meraki MR46 Access Point",
    categoryId: "cat-006",
    purchaseDate: "2022-09-10T00:00:00Z",
    purchaseValue: 1299.0,
    currentValue: 1104.15,
    depreciation: 15,
    location: "Headquarters - Floor 2",
    assignedTo: "IT Department",
    status: "in-use",
    serialNumber: "MERAKI-Q2HP-LMNP",
    warrantyExpiry: "2027-09-10T00:00:00Z",
    notes: "High-performance WiFi 6 access point",
    createdAt: "2022-09-12T14:30:00Z",
    updatedAt: "2023-01-15T16:45:00Z",
  },
  {
    id: "AST-007",
    name: "HP LaserJet Pro Printer",
    categoryId: "cat-001",
    purchaseDate: "2022-10-05T00:00:00Z",
    purchaseValue: 449.99,
    currentValue: 359.99,
    depreciation: 20,
    location: "Headquarters - Floor 1",
    assignedTo: "Admin Department",
    status: "in-use",
    serialNumber: "HPLJ-789456123",
    warrantyExpiry: "2025-10-05T00:00:00Z",
    notes: "Color laser printer for admin team",
    createdAt: "2022-10-06T10:15:00Z",
    updatedAt: "2023-03-20T13:40:00Z",
  },
  {
    id: "AST-008",
    name: "Conference Room Table",
    categoryId: "cat-002",
    purchaseDate: "2022-08-15T00:00:00Z",
    purchaseValue: 2499.0,
    currentValue: 2249.1,
    depreciation: 10,
    location: "Headquarters - Conference Room A",
    assignedTo: "Facilities",
    status: "in-use",
    serialNumber: "N/A",
    warrantyExpiry: "2027-08-15T00:00:00Z",
    notes: "Large oak conference table with cable management",
    createdAt: "2022-08-16T09:30:00Z",
    updatedAt: "2022-08-16T09:30:00Z",
  },
  {
    id: "AST-009",
    name: "Microsoft Surface Hub 2S",
    categoryId: "cat-001",
    purchaseDate: "2023-04-10T00:00:00Z",
    purchaseValue: 8999.99,
    currentValue: 8099.99,
    depreciation: 10,
    location: "Headquarters - Conference Room B",
    assignedTo: "Facilities",
    status: "in-use",
    serialNumber: "MS-HUB-456123789",
    warrantyExpiry: "2026-04-10T00:00:00Z",
    notes: "Interactive whiteboard for conference room",
    createdAt: "2023-04-12T13:20:00Z",
    updatedAt: "2023-04-12T13:20:00Z",
  },
  {
    id: "AST-010",
    name: "Lenovo ThinkPad X1 Carbon",
    categoryId: "cat-001",
    purchaseDate: "2023-02-20T00:00:00Z",
    purchaseValue: 1599.99,
    currentValue: 1359.99,
    depreciation: 15,
    location: "Storage",
    assignedTo: null,
    status: "available",
    serialNumber: "LTP-X1C-123456789",
    warrantyExpiry: "2026-02-20T00:00:00Z",
    notes: "Spare laptop for new hires",
    createdAt: "2023-02-22T10:45:00Z",
    updatedAt: "2023-07-01T15:30:00Z",
  },
]

// Asset summary data
const assetSummary = {
  totalAssets: mockAssets.length,
  totalValue: mockAssets.reduce((sum, asset) => sum + asset.currentValue, 0),
  inUseAssets: mockAssets.filter((asset) => asset.status === "in-use").length,
  availableAssets: mockAssets.filter((asset) => asset.status === "available").length,
}

export function AssetsContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    purchaseDate: null as Date | null,
    purchaseValue: "",
    depreciation: "",
    location: "",
    assignedTo: "",
    status: "available",
    serialNumber: "",
    warrantyExpiry: null as Date | null,
    notes: "",
  })

  const columns = [
    {
      key: "id",
      label: "Asset ID",
      sortable: true,
    },
    {
      key: "name",
      label: "Asset Name",
      sortable: true,
    },
    {
      key: "categoryId",
      label: "Category",
      sortable: true,
      render: (value: string) => {
        const category = mockCategories.find((cat) => cat.id === value)
        return category ? category.name : value
      },
    },
    {
      key: "purchaseDate",
      label: "Purchase Date",
      sortable: true,
      render: (value: string) => format(new Date(value), "MMM dd, yyyy"),
    },
    {
      key: "purchaseValue",
      label: "Purchase Value",
      sortable: true,
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: "currentValue",
      label: "Current Value",
      sortable: true,
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: "location",
      label: "Location",
      sortable: true,
    },
    {
      key: "assignedTo",
      label: "Assigned To",
      sortable: true,
      render: (value: string | null) => value || "Unassigned",
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        let badgeClass = ""
        let label = ""

        switch (value) {
          case "in-use":
            badgeClass = "bg-blue-100 text-blue-800"
            label = "In Use"
            break
          case "available":
            badgeClass = "bg-green-100 text-green-800"
            label = "Available"
            break
          case "maintenance":
            badgeClass = "bg-yellow-100 text-yellow-800"
            label = "Maintenance"
            break
          case "retired":
            badgeClass = "bg-gray-100 text-gray-800"
            label = "Retired"
            break
          default:
            badgeClass = "bg-gray-100 text-gray-800"
            label = value
        }

        return <Badge className={badgeClass}>{label}</Badge>
      },
    },
  ]

  const filterOptions = [
    {
      id: "categoryId",
      label: "Category",
      options: mockCategories.map((cat) => ({ value: cat.id, label: cat.name })),
      type: "select",
    },
    {
      id: "status",
      label: "Status",
      options: [
        { value: "in-use", label: "In Use" },
        { value: "available", label: "Available" },
        { value: "maintenance", label: "Maintenance" },
        { value: "retired", label: "Retired" },
      ],
      type: "select",
    },
    {
      id: "location",
      label: "Location",
      options: Array.from(new Set(mockAssets.map((asset) => asset.location))).map((location) => ({
        value: location,
        label: location,
      })),
      type: "select",
    },
  ]

  const handleAdd = () => {
    setFormData({
      name: "",
      categoryId: "",
      purchaseDate: null,
      purchaseValue: "",
      depreciation: "",
      location: "",
      assignedTo: "",
      status: "available",
      serialNumber: "",
      warrantyExpiry: null,
      notes: "",
    })
    setIsAddDialogOpen(true)
  }

  const handleEdit = (id: string) => {
    const asset = mockAssets.find((ast) => ast.id === id)
    if (asset) {
      setSelectedAsset(asset)
      setFormData({
        name: asset.name,
        categoryId: asset.categoryId,
        purchaseDate: new Date(asset.purchaseDate),
        purchaseValue: asset.purchaseValue.toString(),
        depreciation: asset.depreciation.toString(),
        location: asset.location,
        assignedTo: asset.assignedTo || "",
        status: asset.status,
        serialNumber: asset.serialNumber,
        warrantyExpiry: new Date(asset.warrantyExpiry),
        notes: asset.notes,
      })
      setIsEditDialogOpen(true)
    }
  }

  const handleView = (id: string) => {
    const asset = mockAssets.find((ast) => ast.id === id)
    if (asset) {
      setSelectedAsset(asset)
      setIsViewDialogOpen(true)
    }
  }

  const handleDelete = (id: string) => {
    // In a real application, this would call an API to delete the asset
    console.log(`Delete asset with ID: ${id}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real application, this would call an API to add or update the asset
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
      <h1 className="text-2xl font-bold">Assets Management</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Assets</p>
              <h3 className="text-2xl font-bold">{assetSummary.totalAssets}</h3>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <h3 className="text-2xl font-bold">${assetSummary.totalValue.toFixed(2)}</h3>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">In Use</p>
              <h3 className="text-2xl font-bold">{assetSummary.inUseAssets}</h3>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Available</p>
              <h3 className="text-2xl font-bold">{assetSummary.availableAssets}</h3>
            </div>
            <Truck className="h-8 w-8 text-amber-500" />
          </CardContent>
        </Card>
      </div>

      <EnhancedDataTable
        title="Assets"
        columns={columns}
        data={mockAssets}
        filterOptions={filterOptions}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* Add Asset Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="py-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="additional">Additional Info</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Asset Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter asset name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => handleSelectChange("categoryId", value)}
                  >
                    <SelectTrigger id="categoryId">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input
                    id="serialNumber"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    placeholder="Enter serial number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="in-use">In Use</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              <TabsContent value="financial" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.purchaseDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.purchaseDate ? format(formData.purchaseDate, "PPP") : <span>Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.purchaseDate || undefined}
                        onSelect={(date) => handleDateChange("purchaseDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchaseValue">Purchase Value ($)</Label>
                  <Input
                    id="purchaseValue"
                    name="purchaseValue"
                    type="number"
                    step="0.01"
                    value={formData.purchaseValue}
                    onChange={handleInputChange}
                    placeholder="Enter purchase value"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="depreciation">Depreciation Rate (%)</Label>
                  <Input
                    id="depreciation"
                    name="depreciation"
                    type="number"
                    step="0.1"
                    value={formData.depreciation}
                    onChange={handleInputChange}
                    placeholder="Enter depreciation rate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warrantyExpiry">Warranty Expiry Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.warrantyExpiry && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.warrantyExpiry ? format(formData.warrantyExpiry, "PPP") : <span>Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.warrantyExpiry || undefined}
                        onSelect={(date) => handleDateChange("warrantyExpiry", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </TabsContent>
              <TabsContent value="additional" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter asset location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input
                    id="assignedTo"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    placeholder="Enter assignee name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Enter additional notes"
                    rows={4}
                  />
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Save Asset
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Asset Dialog - Similar to Add but with pre-filled values */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="py-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="additional">Additional Info</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Asset Name</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter asset name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-categoryId">Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => handleSelectChange("categoryId", value)}
                  >
                    <SelectTrigger id="edit-categoryId">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-serialNumber">Serial Number</Label>
                  <Input
                    id="edit-serialNumber"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    placeholder="Enter serial number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="in-use">In Use</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              <TabsContent value="financial" className="space-y-4 mt-4">
                {/* Same fields as Add dialog but with edit- prefixed IDs */}
                <div className="space-y-2">
                  <Label htmlFor="edit-purchaseDate">Purchase Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.purchaseDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.purchaseDate ? format(formData.purchaseDate, "PPP") : <span>Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.purchaseDate || undefined}
                        onSelect={(date) => handleDateChange("purchaseDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-purchaseValue">Purchase Value ($)</Label>
                  <Input
                    id="edit-purchaseValue"
                    name="purchaseValue"
                    type="number"
                    step="0.01"
                    value={formData.purchaseValue}
                    onChange={handleInputChange}
                    placeholder="Enter purchase value"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-depreciation">Depreciation Rate (%)</Label>
                  <Input
                    id="edit-depreciation"
                    name="depreciation"
                    type="number"
                    step="0.1"
                    value={formData.depreciation}
                    onChange={handleInputChange}
                    placeholder="Enter depreciation rate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-warrantyExpiry">Warranty Expiry Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.warrantyExpiry && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.warrantyExpiry ? format(formData.warrantyExpiry, "PPP") : <span>Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.warrantyExpiry || undefined}
                        onSelect={(date) => handleDateChange("warrantyExpiry", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </TabsContent>
              <TabsContent value="additional" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter asset location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-assignedTo">Assigned To</Label>
                  <Input
                    id="edit-assignedTo"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    placeholder="Enter assignee name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Enter additional notes"
                    rows={4}
                  />
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Update Asset
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Asset Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Asset Details</DialogTitle>
          </DialogHeader>
          {selectedAsset && (
            <div className="py-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="financial">Financial</TabsTrigger>
                  <TabsTrigger value="additional">Additional Info</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Asset ID:</div>
                    <div className="col-span-2">{selectedAsset.id}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Asset Name:</div>
                    <div className="col-span-2">{selectedAsset.name}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Category:</div>
                    <div className="col-span-2">
                      {mockCategories.find((cat) => cat.id === selectedAsset.categoryId)?.name ||
                        selectedAsset.categoryId}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Serial Number:</div>
                    <div className="col-span-2">{selectedAsset.serialNumber}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Status:</div>
                    <div className="col-span-2">
                      <Badge
                        className={
                          selectedAsset.status === "in-use"
                            ? "bg-blue-100 text-blue-800"
                            : selectedAsset.status === "available"
                              ? "bg-green-100 text-green-800"
                              : selectedAsset.status === "maintenance"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                        }
                      >
                        {selectedAsset.status === "in-use"
                          ? "In Use"
                          : selectedAsset.status === "available"
                            ? "Available"
                            : selectedAsset.status === "maintenance"
                              ? "Maintenance"
                              : "Retired"}
                      </Badge>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="financial" className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Purchase Date:</div>
                    <div className="col-span-2">{format(new Date(selectedAsset.purchaseDate), "PPP")}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Purchase Value:</div>
                    <div className="col-span-2">${selectedAsset.purchaseValue.toFixed(2)}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Current Value:</div>
                    <div className="col-span-2">${selectedAsset.currentValue.toFixed(2)}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Depreciation Rate:</div>
                    <div className="col-span-2">{selectedAsset.depreciation}%</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Warranty Expiry:</div>
                    <div className="col-span-2">{format(new Date(selectedAsset.warrantyExpiry), "PPP")}</div>
                  </div>
                </TabsContent>
                <TabsContent value="additional" className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Location:</div>
                    <div className="col-span-2">{selectedAsset.location}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Assigned To:</div>
                    <div className="col-span-2">{selectedAsset.assignedTo || "Unassigned"}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Notes:</div>
                    <div className="col-span-2">{selectedAsset.notes}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Created Date:</div>
                    <div className="col-span-2">{format(new Date(selectedAsset.createdAt), "PPP")}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-gray-500">Last Updated:</div>
                    <div className="col-span-2">{format(new Date(selectedAsset.updatedAt), "PPP")}</div>
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
                if (selectedAsset) {
                  handleEdit(selectedAsset.id)
                }
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Edit Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
