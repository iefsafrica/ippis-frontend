"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronDown,
  Download,
  FileText,
  Filter,
  MoreHorizontal,
  Plus,
  Printer,
  Search,
  SlidersHorizontal,
  Trash2,
  Wrench,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Mock data for assets
const assets = [
  {
    id: 1,
    name: "Dell Latitude 5420",
    category: "Computers",
    purchaseDate: "2023-01-15",
    purchaseValue: 1200,
    currentValue: 950,
    status: "In Use",
    assignedTo: "John Doe",
    location: "Headquarters",
    serialNumber: "DL5420-2023-001",
    warrantyEnd: "2026-01-15",
    condition: "Good",
  },
  {
    id: 2,
    name: "HP LaserJet Pro M404dn",
    category: "Printers",
    purchaseDate: "2022-11-05",
    purchaseValue: 350,
    currentValue: 280,
    status: "In Use",
    assignedTo: "Finance Department",
    location: "Headquarters",
    serialNumber: "HPM404-2022-023",
    warrantyEnd: "2024-11-05",
    condition: "Good",
  },
  {
    id: 3,
    name: "Office Desk - Executive",
    category: "Furniture",
    purchaseDate: "2021-06-20",
    purchaseValue: 550,
    currentValue: 400,
    status: "In Use",
    assignedTo: "Sarah Johnson",
    location: "Branch Office",
    serialNumber: "FURN-DESK-2021-015",
    warrantyEnd: "2026-06-20",
    condition: "Excellent",
  },
  {
    id: 4,
    name: "Toyota Hilux",
    category: "Vehicles",
    purchaseDate: "2020-03-10",
    purchaseValue: 35000,
    currentValue: 25000,
    status: "In Use",
    assignedTo: "Operations Department",
    location: "Headquarters",
    serialNumber: "VIN-TH2020-005",
    warrantyEnd: "2023-03-10",
    condition: "Good",
    maintenanceDue: "2023-09-15",
  },
  {
    id: 5,
    name: "Cisco Switch 24-Port",
    category: "Networking",
    purchaseDate: "2022-08-12",
    purchaseValue: 1800,
    currentValue: 1600,
    status: "In Use",
    assignedTo: "IT Department",
    location: "Data Center",
    serialNumber: "CS24P-2022-007",
    warrantyEnd: "2027-08-12",
    condition: "Excellent",
  },
  {
    id: 6,
    name: 'MacBook Pro 16"',
    category: "Computers",
    purchaseDate: "2023-02-28",
    purchaseValue: 2500,
    currentValue: 2300,
    status: "In Use",
    assignedTo: "Design Team",
    location: "Headquarters",
    serialNumber: "MBP16-2023-012",
    warrantyEnd: "2026-02-28",
    condition: "Excellent",
  },
  {
    id: 7,
    name: "Conference Room Table",
    category: "Furniture",
    purchaseDate: "2021-04-15",
    purchaseValue: 1200,
    currentValue: 900,
    status: "In Use",
    assignedTo: "Meeting Room A",
    location: "Headquarters",
    serialNumber: "FURN-TABLE-2021-003",
    warrantyEnd: "2031-04-15",
    condition: "Good",
  },
  {
    id: 8,
    name: 'Samsung Smart TV 65"',
    category: "Electronics",
    purchaseDate: "2022-12-10",
    purchaseValue: 800,
    currentValue: 650,
    status: "In Use",
    assignedTo: "Conference Room",
    location: "Headquarters",
    serialNumber: "SSTV65-2022-019",
    warrantyEnd: "2025-12-10",
    condition: "Excellent",
  },
  {
    id: 9,
    name: "Lenovo ThinkPad X1",
    category: "Computers",
    purchaseDate: "2022-05-20",
    purchaseValue: 1800,
    currentValue: 1400,
    status: "Under Repair",
    assignedTo: "Michael Brown",
    location: "IT Department",
    serialNumber: "LTP-X1-2022-031",
    warrantyEnd: "2025-05-20",
    condition: "Needs Repair",
  },
  {
    id: 10,
    name: "Office Chair - Ergonomic",
    category: "Furniture",
    purchaseDate: "2022-01-30",
    purchaseValue: 350,
    currentValue: 280,
    status: "In Use",
    assignedTo: "Various Staff",
    location: "Headquarters",
    serialNumber: "FURN-CHAIR-2022-045",
    warrantyEnd: "2027-01-30",
    condition: "Good",
  },
]

// Asset categories for filtering
const categories = ["All Categories", "Computers", "Printers", "Furniture", "Vehicles", "Networking", "Electronics"]

// Asset statuses for filtering
const statuses = ["All Statuses", "In Use", "Available", "Under Repair", "Disposed", "Lost"]

export function AssetListContent() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedStatus, setSelectedStatus] = useState("All Statuses")
  const [showAddAssetDialog, setShowAddAssetDialog] = useState(false)
  const [newAsset, setNewAsset] = useState({
    name: "",
    category: "",
    purchaseDate: "",
    purchaseValue: "",
    status: "Available",
    assignedTo: "",
    location: "",
    serialNumber: "",
    warrantyEnd: "",
    condition: "Excellent",
  })

  // Filter assets based on search term, category, and status
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "All Categories" || asset.category === selectedCategory

    const matchesStatus = selectedStatus === "All Statuses" || asset.status === selectedStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleAddAsset = () => {
    // In a real application, this would send data to the server
    console.log("Adding new asset:", newAsset)
    setShowAddAssetDialog(false)
    // Reset form
    setNewAsset({
      name: "",
      category: "",
      purchaseDate: "",
      purchaseValue: "",
      status: "Available",
      assignedTo: "",
      location: "",
      serialNumber: "",
      warrantyEnd: "",
      condition: "Excellent",
    })
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "In Use":
        return "default"
      case "Available":
        return "success"
      case "Under Repair":
        return "warning"
      case "Disposed":
        return "destructive"
      case "Lost":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Assets List</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/assets/maintenance")}>
            <Wrench className="mr-2 h-4 w-4" />
            Maintenance
          </Button>
          <Dialog open={showAddAssetDialog} onOpenChange={setShowAddAssetDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Asset</DialogTitle>
                <DialogDescription>Enter the details of the new asset. Click save when you're done.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Asset Name</Label>
                    <Input
                      id="name"
                      value={newAsset.name}
                      onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                      placeholder="Enter asset name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select onValueChange={(value) => setNewAsset({ ...newAsset, category: value })}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.slice(1).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchaseDate">Purchase Date</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={newAsset.purchaseDate}
                      onChange={(e) => setNewAsset({ ...newAsset, purchaseDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchaseValue">Purchase Value</Label>
                    <Input
                      id="purchaseValue"
                      type="number"
                      value={newAsset.purchaseValue}
                      onChange={(e) => setNewAsset({ ...newAsset, purchaseValue: e.target.value })}
                      placeholder="Enter value"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serialNumber">Serial Number</Label>
                    <Input
                      id="serialNumber"
                      value={newAsset.serialNumber}
                      onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                      placeholder="Enter serial number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warrantyEnd">Warranty End Date</Label>
                    <Input
                      id="warrantyEnd"
                      type="date"
                      value={newAsset.warrantyEnd}
                      onChange={(e) => setNewAsset({ ...newAsset, warrantyEnd: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      defaultValue="Available"
                      onValueChange={(value) => setNewAsset({ ...newAsset, status: value })}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.slice(1).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select
                      defaultValue="Excellent"
                      onValueChange={(value) => setNewAsset({ ...newAsset, condition: value })}
                    >
                      <SelectTrigger id="condition">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Fair">Fair</SelectItem>
                        <SelectItem value="Poor">Poor</SelectItem>
                        <SelectItem value="Needs Repair">Needs Repair</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Assigned To</Label>
                    <Input
                      id="assignedTo"
                      value={newAsset.assignedTo}
                      onChange={(e) => setNewAsset({ ...newAsset, assignedTo: e.target.value })}
                      placeholder="Enter person or department"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newAsset.location}
                      onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                      placeholder="Enter location"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter any additional notes about this asset"
                    className="min-h-[80px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddAssetDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAsset}>Save Asset</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Asset Inventory</CardTitle>
          <CardDescription>
            Manage and track all organizational assets. Use the filters to narrow down results.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search assets..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <FileText className="mr-2 h-4 w-4" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="mr-2 h-4 w-4" />
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="mr-2 h-4 w-4" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Printer className="mr-2 h-4 w-4" />
                    Print List
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No assets found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.name}</TableCell>
                      <TableCell>{asset.category}</TableCell>
                      <TableCell>{asset.serialNumber}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(asset.status)}>{asset.status}</Badge>
                      </TableCell>
                      <TableCell>{asset.assignedTo}</TableCell>
                      <TableCell>{asset.location}</TableCell>
                      <TableCell>{new Date(asset.purchaseDate).toLocaleDateString()}</TableCell>
                      <TableCell>₦{asset.purchaseValue.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Asset</DropdownMenuItem>
                            <DropdownMenuItem>Schedule Maintenance</DropdownMenuItem>
                            <DropdownMenuItem>Transfer Asset</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Asset
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
