"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Plus, Edit, Trash2, FileSpreadsheet, FileText, Printer, Filter } from "lucide-react"

// Mock data for tax types
const mockTaxTypes = [
  {
    id: 1,
    name: "Value Added Tax (VAT)",
    rate: 7.5,
    description: "Standard VAT rate applied to most goods and services in Nigeria",
    status: "active",
    applicableRegions: ["Nigeria"],
    isCompound: false,
    isRecoverable: true,
  },
  {
    id: 2,
    name: "Sales Tax",
    rate: 5.0,
    description: "General sales tax applied to retail purchases",
    status: "active",
    applicableRegions: ["Lagos", "Abuja", "Port Harcourt"],
    isCompound: false,
    isRecoverable: false,
  },
  {
    id: 3,
    name: "Service Tax",
    rate: 3.0,
    description: "Tax applied specifically to service-based transactions",
    status: "active",
    applicableRegions: ["All Regions"],
    isCompound: false,
    isRecoverable: true,
  },
  {
    id: 4,
    name: "No Tax",
    rate: 0,
    description: "No tax applied to the transaction",
    status: "active",
    applicableRegions: ["All Regions"],
    isCompound: false,
    isRecoverable: false,
  },
  {
    id: 5,
    name: "Import Duty",
    rate: 10.0,
    description: "Tax applied to imported goods",
    status: "active",
    applicableRegions: ["Nigeria"],
    isCompound: true,
    isRecoverable: true,
  },
  {
    id: 6,
    name: "Luxury Tax",
    rate: 15.0,
    description: "Additional tax applied to luxury goods and services",
    status: "inactive",
    applicableRegions: ["Lagos", "Abuja"],
    isCompound: true,
    isRecoverable: false,
  },
  {
    id: 7,
    name: "Withholding Tax",
    rate: 5.0,
    description: "Tax withheld at source for certain services",
    status: "active",
    applicableRegions: ["Nigeria"],
    isCompound: false,
    isRecoverable: true,
  },
]

// Mock data for regions
const mockRegions = ["Nigeria", "Lagos", "Abuja", "Port Harcourt", "Kano", "Kaduna", "Enugu", "All Regions"]

export default function TaxTypeContent() {
  // State for tax type list and operations
  const [taxTypes, setTaxTypes] = useState(mockTaxTypes)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // State for dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTaxType, setSelectedTaxType] = useState(null)

  // State for new tax type
  const [newTaxType, setNewTaxType] = useState({
    name: "",
    rate: 0,
    description: "",
    status: "active",
    applicableRegions: ["Nigeria"],
    isCompound: false,
    isRecoverable: false,
  })

  // Filter tax types based on search term and status filter
  const filteredTaxTypes = taxTypes.filter((taxType) => {
    const matchesSearch =
      taxType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      taxType.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      taxType.applicableRegions.some((region) => region.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || taxType.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Handle adding a new tax type
  const handleAddTaxType = () => {
    const taxTypeToAdd = {
      ...newTaxType,
      id: taxTypes.length + 1,
      rate: Number.parseFloat(newTaxType.rate),
    }

    setTaxTypes([...taxTypes, taxTypeToAdd])
    setIsAddDialogOpen(false)
    resetNewTaxType()
  }

  // Handle updating a tax type
  const handleUpdateTaxType = () => {
    const updatedTaxType = {
      ...selectedTaxType,
      rate: Number.parseFloat(selectedTaxType.rate),
    }

    setTaxTypes(taxTypes.map((taxType) => (taxType.id === updatedTaxType.id ? updatedTaxType : taxType)))
    setIsEditDialogOpen(false)
  }

  // Handle deleting a tax type
  const handleDeleteTaxType = () => {
    setTaxTypes(taxTypes.filter((taxType) => taxType.id !== selectedTaxType.id))
    setIsDeleteDialogOpen(false)
  }

  // Reset new tax type form
  const resetNewTaxType = () => {
    setNewTaxType({
      name: "",
      rate: 0,
      description: "",
      status: "active",
      applicableRegions: ["Nigeria"],
      isCompound: false,
      isRecoverable: false,
    })
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["ID", "Name", "Rate (%)", "Description", "Status", "Applicable Regions", "Compound", "Recoverable"]

    const csvData = filteredTaxTypes.map((taxType) => [
      taxType.id,
      taxType.name,
      taxType.rate,
      taxType.description,
      taxType.status,
      taxType.applicableRegions.join(", "),
      taxType.isCompound ? "Yes" : "No",
      taxType.isRecoverable ? "Yes" : "No",
    ])

    const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "tax-types.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Export to PDF
  const exportToPDF = () => {
    alert("PDF export functionality would be implemented here")
    // In a real implementation, you would use a library like jsPDF to generate the PDF
  }

  // Print table
  const printTable = () => {
    const printWindow = window.open("", "_blank")
    printWindow.document.write("<html><head><title>Tax Types</title>")
    printWindow.document.write(
      "<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; }</style>",
    )
    printWindow.document.write("</head><body>")
    printWindow.document.write("<h1>Tax Types</h1>")
    printWindow.document.write(document.querySelector(".tax-types-table").outerHTML)
    printWindow.document.write("</body></html>")
    printWindow.document.close()
    printWindow.print()
  }

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tax Type Management</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Tax Type
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10 w-full md:w-[300px]"
            placeholder="Search tax types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={exportToCSV}>
              <FileSpreadsheet className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={exportToPDF}>
              <FileText className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={printTable}>
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="tax-types-table">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Rate (%)</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTaxTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No tax types found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTaxTypes.map((taxType) => (
                    <TableRow key={taxType.id}>
                      <TableCell>{taxType.id}</TableCell>
                      <TableCell className="font-medium">{taxType.name}</TableCell>
                      <TableCell>{taxType.rate}%</TableCell>
                      <TableCell className="max-w-xs truncate">{taxType.description}</TableCell>
                      <TableCell>{getStatusBadge(taxType.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedTaxType({ ...taxType })
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedTaxType(taxType)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Tax Type Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Tax Type</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tax Type Name</Label>
              <Input
                id="name"
                value={newTaxType.name}
                onChange={(e) => setNewTaxType({ ...newTaxType, name: e.target.value })}
                placeholder="e.g., Value Added Tax (VAT)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Tax Rate (%)</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={newTaxType.rate}
                onChange={(e) => setNewTaxType({ ...newTaxType, rate: e.target.value })}
                placeholder="e.g., 7.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTaxType.description}
                onChange={(e) => setNewTaxType({ ...newTaxType, description: e.target.value })}
                placeholder="Describe the tax type and its application"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newTaxType.status}
                onValueChange={(value) => setNewTaxType({ ...newTaxType, status: value })}
              >
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
              <Label htmlFor="applicableRegions">Applicable Regions</Label>
              <Select
                value={newTaxType.applicableRegions[0]}
                onValueChange={(value) => setNewTaxType({ ...newTaxType, applicableRegions: [value] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {mockRegions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Note: Multiple region selection would be implemented in a production environment
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isCompound"
                checked={newTaxType.isCompound}
                onCheckedChange={(checked) => setNewTaxType({ ...newTaxType, isCompound: checked })}
              />
              <Label htmlFor="isCompound" className="text-sm font-normal">
                Compound Tax (calculated on top of other taxes)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRecoverable"
                checked={newTaxType.isRecoverable}
                onCheckedChange={(checked) => setNewTaxType({ ...newTaxType, isRecoverable: checked })}
              />
              <Label htmlFor="isRecoverable" className="text-sm font-normal">
                Recoverable (can be claimed back)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTaxType}>Add Tax Type</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tax Type Dialog */}
      {selectedTaxType && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Tax Type</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Tax Type Name</Label>
                <Input
                  id="editName"
                  value={selectedTaxType.name}
                  onChange={(e) => setSelectedTaxType({ ...selectedTaxType, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editRate">Tax Rate (%)</Label>
                <Input
                  id="editRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={selectedTaxType.rate}
                  onChange={(e) => setSelectedTaxType({ ...selectedTaxType, rate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={selectedTaxType.description}
                  onChange={(e) => setSelectedTaxType({ ...selectedTaxType, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editStatus">Status</Label>
                <Select
                  value={selectedTaxType.status}
                  onValueChange={(value) => setSelectedTaxType({ ...selectedTaxType, status: value })}
                >
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
                <Label htmlFor="editApplicableRegions">Applicable Regions</Label>
                <Select
                  value={selectedTaxType.applicableRegions[0]}
                  onValueChange={(value) => setSelectedTaxType({ ...selectedTaxType, applicableRegions: [value] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockRegions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Note: Multiple region selection would be implemented in a production environment
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="editIsCompound"
                  checked={selectedTaxType.isCompound}
                  onCheckedChange={(checked) => setSelectedTaxType({ ...selectedTaxType, isCompound: checked })}
                />
                <Label htmlFor="editIsCompound" className="text-sm font-normal">
                  Compound Tax (calculated on top of other taxes)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="editIsRecoverable"
                  checked={selectedTaxType.isRecoverable}
                  onCheckedChange={(checked) => setSelectedTaxType({ ...selectedTaxType, isRecoverable: checked })}
                />
                <Label htmlFor="editIsRecoverable" className="text-sm font-normal">
                  Recoverable (can be claimed back)
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTaxType}>Update Tax Type</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Tax Type Dialog */}
      {selectedTaxType && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <p>
                Are you sure you want to delete the tax type <strong>{selectedTaxType.name}</strong>?
              </p>
              <p className="text-gray-500 mt-2">
                This action cannot be undone. This will permanently delete the tax type and remove it from all
                associated invoices.
              </p>

              {selectedTaxType.status === "active" && (
                <div className="flex items-center mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="mr-3 text-amber-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </div>
                  <div className="text-sm text-amber-700">
                    Warning: This tax type is currently active and may be in use by existing invoices.
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteTaxType}>
                Delete Tax Type
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
