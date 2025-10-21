"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import {
  CalendarIcon,
  Download,
  FileText,
  Printer,
  Search,
  Trash2,
  Plus,
  Edit,
  Eye,
  X,
  Save,
  FileSpreadsheet,
} from "lucide-react"

// Mock data for clients
const mockClients = [
  { id: 1, name: "Acme Corporation", email: "billing@acme.com", phone: "+1234567890" },
  { id: 2, name: "Globex Industries", email: "accounts@globex.com", phone: "+2345678901" },
  { id: 3, name: "Stark Enterprises", email: "finance@stark.com", phone: "+3456789012" },
  { id: 4, name: "Wayne Industries", email: "payments@wayne.com", phone: "+4567890123" },
  { id: 5, name: "Umbrella Corporation", email: "billing@umbrella.com", phone: "+5678901234" },
]

// Mock data for projects
const mockProjects = [
  { id: 1, name: "Website Redesign", clientId: 1 },
  { id: 2, name: "Mobile App Development", clientId: 1 },
  { id: 3, name: "ERP Implementation", clientId: 2 },
  { id: 4, name: "Cloud Migration", clientId: 3 },
  { id: 5, name: "Security Audit", clientId: 4 },
  { id: 6, name: "Data Analytics Platform", clientId: 5 },
]

// Mock data for tax types
const mockTaxTypes = [
  { id: 1, name: "VAT", rate: 7.5 },
  { id: 2, name: "Sales Tax", rate: 5.0 },
  { id: 3, name: "Service Tax", rate: 3.0 },
  { id: 4, name: "No Tax", rate: 0 },
]

// Mock data for invoices
const mockInvoices = [
  {
    id: 1,
    invoiceNumber: "INV-2023-001",
    clientId: 1,
    projectId: 1,
    issueDate: new Date(2023, 0, 15),
    dueDate: new Date(2023, 1, 15),
    status: "paid",
    items: [
      { id: 1, description: "UI/UX Design", quantity: 1, rate: 2500, amount: 2500 },
      { id: 2, description: "Frontend Development", quantity: 1, rate: 3500, amount: 3500 },
    ],
    taxTypeId: 1,
    subtotal: 6000,
    taxAmount: 450,
    total: 6450,
    notes: "Payment received on time. Thank you!",
    paymentMethod: "bank transfer",
  },
  {
    id: 2,
    invoiceNumber: "INV-2023-002",
    clientId: 2,
    projectId: 3,
    issueDate: new Date(2023, 1, 10),
    dueDate: new Date(2023, 2, 10),
    status: "pending",
    items: [
      { id: 1, description: "System Analysis", quantity: 1, rate: 3000, amount: 3000 },
      { id: 2, description: "Database Setup", quantity: 1, rate: 2000, amount: 2000 },
      { id: 3, description: "Initial Configuration", quantity: 1, rate: 1500, amount: 1500 },
    ],
    taxTypeId: 2,
    subtotal: 6500,
    taxAmount: 325,
    total: 6825,
    notes: "Please pay by the due date.",
    paymentMethod: "credit card",
  },
  {
    id: 3,
    invoiceNumber: "INV-2023-003",
    clientId: 3,
    projectId: 4,
    issueDate: new Date(2023, 2, 5),
    dueDate: new Date(2023, 3, 5),
    status: "overdue",
    items: [
      { id: 1, description: "Cloud Architecture Planning", quantity: 1, rate: 4000, amount: 4000 },
      { id: 2, description: "Data Migration", quantity: 1, rate: 3500, amount: 3500 },
    ],
    taxTypeId: 1,
    subtotal: 7500,
    taxAmount: 562.5,
    total: 8062.5,
    notes: "This invoice is overdue. Please make payment immediately.",
    paymentMethod: "bank transfer",
  },
  {
    id: 4,
    invoiceNumber: "INV-2023-004",
    clientId: 4,
    projectId: 5,
    issueDate: new Date(2023, 3, 20),
    dueDate: new Date(2023, 4, 20),
    status: "draft",
    items: [{ id: 1, description: "Security Assessment", quantity: 1, rate: 5000, amount: 5000 }],
    taxTypeId: 3,
    subtotal: 5000,
    taxAmount: 150,
    total: 5150,
    notes: "Draft invoice - not yet sent to client.",
    paymentMethod: "not specified",
  },
  {
    id: 5,
    invoiceNumber: "INV-2023-005",
    clientId: 5,
    projectId: 6,
    issueDate: new Date(2023, 4, 1),
    dueDate: new Date(2023, 5, 1),
    status: "paid",
    items: [
      { id: 1, description: "Data Warehouse Setup", quantity: 1, rate: 6000, amount: 6000 },
      { id: 2, description: "BI Dashboard Development", quantity: 1, rate: 4500, amount: 4500 },
      { id: 3, description: "Training Session", quantity: 2, rate: 1000, amount: 2000 },
    ],
    taxTypeId: 1,
    subtotal: 12500,
    taxAmount: 937.5,
    total: 13437.5,
    notes: "Payment received. Thank you for your business!",
    paymentMethod: "wire transfer",
  },
]

// Helper function to get client by ID
const getClientById = (id) =>
  mockClients.find((client) => client.id === id) || { name: "Unknown", email: "", phone: "" }

// Helper function to get project by ID
const getProjectById = (id) => mockProjects.find((project) => project.id === id) || { name: "Unknown" }

// Helper function to get tax type by ID
const getTaxTypeById = (id) => mockTaxTypes.find((tax) => tax.id === id) || { name: "Unknown", rate: 0 }

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount)
}

export default function InvoiceContent() {
  // State for invoice list and operations
  const [invoices, setInvoices] = useState(mockInvoices)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  // State for dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  // State for new invoice
  const [newInvoice, setNewInvoice] = useState({
    invoiceNumber: "",
    clientId: "",
    projectId: "",
    issueDate: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    status: "draft",
    items: [{ id: 1, description: "", quantity: 1, rate: 0, amount: 0 }],
    taxTypeId: 4,
    subtotal: 0,
    taxAmount: 0,
    total: 0,
    notes: "",
    paymentMethod: "not specified",
  })

  // Refs for export functionality
  const tableRef = useRef(null)

  // Filter invoices based on search term and filters
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientById(invoice.clientId).name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getProjectById(invoice.projectId).name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter

    let matchesDate = true
    const currentDate = new Date()
    if (dateFilter === "thisMonth") {
      matchesDate =
        invoice.issueDate.getMonth() === currentDate.getMonth() &&
        invoice.issueDate.getFullYear() === currentDate.getFullYear()
    } else if (dateFilter === "lastMonth") {
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
      matchesDate =
        invoice.issueDate.getMonth() === lastMonth.getMonth() &&
        invoice.issueDate.getFullYear() === lastMonth.getFullYear()
    } else if (dateFilter === "thisYear") {
      matchesDate = invoice.issueDate.getFullYear() === currentDate.getFullYear()
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  // Handle adding a new invoice
  const handleAddInvoice = () => {
    // Calculate subtotal, tax, and total
    const subtotal = newInvoice.items.reduce((sum, item) => sum + item.amount, 0)
    const taxType = getTaxTypeById(Number.parseInt(newInvoice.taxTypeId))
    const taxAmount = subtotal * (taxType.rate / 100)
    const total = subtotal + taxAmount

    const invoiceToAdd = {
      ...newInvoice,
      id: invoices.length + 1,
      clientId: Number.parseInt(newInvoice.clientId),
      projectId: Number.parseInt(newInvoice.projectId),
      taxTypeId: Number.parseInt(newInvoice.taxTypeId),
      subtotal,
      taxAmount,
      total,
    }

    setInvoices([...invoices, invoiceToAdd])
    setIsAddDialogOpen(false)
    resetNewInvoice()
  }

  // Handle updating an invoice
  const handleUpdateInvoice = () => {
    // Calculate subtotal, tax, and total
    const subtotal = selectedInvoice.items.reduce((sum, item) => sum + item.amount, 0)
    const taxType = getTaxTypeById(Number.parseInt(selectedInvoice.taxTypeId))
    const taxAmount = subtotal * (taxType.rate / 100)
    const total = subtotal + taxAmount

    const updatedInvoice = {
      ...selectedInvoice,
      clientId: Number.parseInt(selectedInvoice.clientId),
      projectId: Number.parseInt(selectedInvoice.projectId),
      taxTypeId: Number.parseInt(selectedInvoice.taxTypeId),
      subtotal,
      taxAmount,
      total,
    }

    setInvoices(invoices.map((invoice) => (invoice.id === updatedInvoice.id ? updatedInvoice : invoice)))

    setIsEditDialogOpen(false)
  }

  // Handle deleting an invoice
  const handleDeleteInvoice = () => {
    setInvoices(invoices.filter((invoice) => invoice.id !== selectedInvoice.id))
    setIsDeleteDialogOpen(false)
  }

  // Reset new invoice form
  const resetNewInvoice = () => {
    setNewInvoice({
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, "0")}`,
      clientId: "",
      projectId: "",
      issueDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      status: "draft",
      items: [{ id: 1, description: "", quantity: 1, rate: 0, amount: 0 }],
      taxTypeId: 4,
      subtotal: 0,
      taxAmount: 0,
      total: 0,
      notes: "",
      paymentMethod: "not specified",
    })
  }

  // Handle adding a new item to invoice
  const handleAddItem = (invoice, setInvoice) => {
    const items = [
      ...invoice.items,
      {
        id: invoice.items.length + 1,
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ]

    setInvoice({
      ...invoice,
      items,
    })
  }

  // Handle removing an item from invoice
  const handleRemoveItem = (invoice, setInvoice, itemId) => {
    if (invoice.items.length === 1) return

    const items = invoice.items.filter((item) => item.id !== itemId)

    setInvoice({
      ...invoice,
      items,
    })
  }

  // Handle updating an item in invoice
  const handleUpdateItem = (invoice, setInvoice, itemId, field, value) => {
    const items = invoice.items.map((item) => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value }

        // Recalculate amount if quantity or rate changes
        if (field === "quantity" || field === "rate") {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate
        }

        return updatedItem
      }
      return item
    })

    setInvoice({
      ...invoice,
      items,
    })
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Invoice #", "Client", "Project", "Issue Date", "Due Date", "Status", "Total"]

    const csvData = filteredInvoices.map((invoice) => [
      invoice.invoiceNumber,
      getClientById(invoice.clientId).name,
      getProjectById(invoice.projectId).name,
      format(invoice.issueDate, "yyyy-MM-dd"),
      format(invoice.dueDate, "yyyy-MM-dd"),
      invoice.status,
      invoice.total,
    ])

    const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "invoices.csv")
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
    printWindow.document.write("<html><head><title>Invoices</title>")
    printWindow.document.write(
      "<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; }</style>",
    )
    printWindow.document.write("</head><body>")
    printWindow.document.write("<h1>Invoices</h1>")
    printWindow.document.write(tableRef.current.outerHTML)
    printWindow.document.write("</body></html>")
    printWindow.document.close()
    printWindow.print()
  }

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case "overdue":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Draft</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoice Management</h1>
        <Button
          onClick={() => {
            resetNewInvoice()
            setIsAddDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Invoice
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
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

        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10 w-full md:w-[300px]"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table ref={tableRef}>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoiceNumber}</TableCell>
                      <TableCell>{getClientById(invoice.clientId).name}</TableCell>
                      <TableCell>{getProjectById(invoice.projectId).name}</TableCell>
                      <TableCell>{format(invoice.issueDate, "MMM dd, yyyy")}</TableCell>
                      <TableCell>{format(invoice.dueDate, "MMM dd, yyyy")}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>{formatCurrency(invoice.total)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedInvoice(invoice)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedInvoice({ ...invoice })
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedInvoice(invoice)
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

      {/* Add Invoice Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={newInvoice.invoiceNumber}
                onChange={(e) => setNewInvoice({ ...newInvoice, invoiceNumber: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={newInvoice.status}
                onValueChange={(value) => setNewInvoice({ ...newInvoice, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="client">Client</Label>
              <Select
                value={newInvoice.clientId.toString()}
                onValueChange={(value) => {
                  setNewInvoice({
                    ...newInvoice,
                    clientId: value,
                    // Reset project when client changes
                    projectId: "",
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {mockClients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="project">Project</Label>
              <Select
                value={newInvoice.projectId.toString()}
                onValueChange={(value) => setNewInvoice({ ...newInvoice, projectId: value })}
                disabled={!newInvoice.clientId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={newInvoice.clientId ? "Select project" : "Select client first"} />
                </SelectTrigger>
                <SelectContent>
                  {mockProjects
                    .filter(
                      (project) => newInvoice.clientId && project.clientId === Number.parseInt(newInvoice.clientId),
                    )
                    .map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Issue Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newInvoice.issueDate ? format(newInvoice.issueDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newInvoice.issueDate}
                    onSelect={(date) => setNewInvoice({ ...newInvoice, issueDate: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newInvoice.dueDate ? format(newInvoice.dueDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newInvoice.dueDate}
                    onSelect={(date) => setNewInvoice({ ...newInvoice, dueDate: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Invoice Items</h3>
              <Button variant="outline" size="sm" onClick={() => handleAddItem(newInvoice, setNewInvoice)}>
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newInvoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input
                          value={item.description}
                          onChange={(e) =>
                            handleUpdateItem(newInvoice, setNewInvoice, item.id, "description", e.target.value)
                          }
                          placeholder="Item description"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateItem(
                              newInvoice,
                              setNewInvoice,
                              item.id,
                              "quantity",
                              Number.parseInt(e.target.value) || 0,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={item.rate}
                          onChange={(e) =>
                            handleUpdateItem(
                              newInvoice,
                              setNewInvoice,
                              item.id,
                              "rate",
                              Number.parseFloat(e.target.value) || 0,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>{formatCurrency(item.amount)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(newInvoice, setNewInvoice, item.id)}
                          disabled={newInvoice.items.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="taxType">Tax Type</Label>
              <Select
                value={newInvoice.taxTypeId.toString()}
                onValueChange={(value) => setNewInvoice({ ...newInvoice, taxTypeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tax type" />
                </SelectTrigger>
                <SelectContent>
                  {mockTaxTypes.map((tax) => (
                    <SelectItem key={tax.id} value={tax.id.toString()}>
                      {tax.name} ({tax.rate}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={newInvoice.paymentMethod}
                onValueChange={(value) => setNewInvoice({ ...newInvoice, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit card">Credit Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="wire transfer">Wire Transfer</SelectItem>
                  <SelectItem value="not specified">Not Specified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newInvoice.notes}
                onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                placeholder="Additional notes for the client..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 border-t pt-4">
            <div className="text-right mr-auto">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Subtotal:</span>
                <span>{formatCurrency(newInvoice.items.reduce((sum, item) => sum + item.amount, 0))}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">
                  Tax ({getTaxTypeById(Number.parseInt(newInvoice.taxTypeId) || 4).rate}%):
                </span>
                <span>
                  {formatCurrency(
                    newInvoice.items.reduce((sum, item) => sum + item.amount, 0) *
                      (getTaxTypeById(Number.parseInt(newInvoice.taxTypeId) || 4).rate / 100),
                  )}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>
                  {formatCurrency(
                    newInvoice.items.reduce((sum, item) => sum + item.amount, 0) +
                      newInvoice.items.reduce((sum, item) => sum + item.amount, 0) *
                        (getTaxTypeById(Number.parseInt(newInvoice.taxTypeId) || 4).rate / 100),
                  )}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddInvoice}>Create Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      {selectedInvoice && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-bold text-lg mb-2">{selectedInvoice.invoiceNumber}</h3>
                <div className="space-y-1">
                  <p>
                    <span className="font-medium">Status:</span> {getStatusBadge(selectedInvoice.status)}
                  </p>
                  <p>
                    <span className="font-medium">Issue Date:</span>{" "}
                    {format(selectedInvoice.issueDate, "MMMM dd, yyyy")}
                  </p>
                  <p>
                    <span className="font-medium">Due Date:</span> {format(selectedInvoice.dueDate, "MMMM dd, yyyy")}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">Client Information</h3>
                <div className="space-y-1">
                  <p>
                    <span className="font-medium">Client:</span> {getClientById(selectedInvoice.clientId).name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {getClientById(selectedInvoice.clientId).email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span> {getClientById(selectedInvoice.clientId).phone}
                  </p>
                  <p>
                    <span className="font-medium">Project:</span> {getProjectById(selectedInvoice.projectId).name}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2">Invoice Items</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%]">Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.rate)}</TableCell>
                        <TableCell>{formatCurrency(item.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-bold text-lg mb-2">Payment Information</h3>
                <div className="space-y-1">
                  <p>
                    <span className="font-medium">Payment Method:</span> {selectedInvoice.paymentMethod}
                  </p>
                  <p>
                    <span className="font-medium">Tax Type:</span> {getTaxTypeById(selectedInvoice.taxTypeId).name} (
                    {getTaxTypeById(selectedInvoice.taxTypeId).rate}%)
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="space-y-1">
                  <p>
                    <span className="font-medium">Subtotal:</span> {formatCurrency(selectedInvoice.subtotal)}
                  </p>
                  <p>
                    <span className="font-medium">Tax:</span> {formatCurrency(selectedInvoice.taxAmount)}
                  </p>
                  <p className="text-lg font-bold">
                    <span>Total:</span> {formatCurrency(selectedInvoice.total)}
                  </p>
                </div>
              </div>
            </div>

            {selectedInvoice.notes && (
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2">Notes</h3>
                <p className="bg-gray-50 p-3 rounded">{selectedInvoice.notes}</p>
              </div>
            )}

            <DialogFooter>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    // In a real app, this would generate and download a PDF
                    alert("Download invoice functionality would be implemented here")
                  }}
                >
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    // In a real app, this would open a print dialog
                    alert("Print invoice functionality would be implemented here")
                  }}
                >
                  <Printer className="mr-2 h-4 w-4" /> Print
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Invoice Dialog */}
      {selectedInvoice && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Invoice</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="editInvoiceNumber">Invoice Number</Label>
                <Input
                  id="editInvoiceNumber"
                  value={selectedInvoice.invoiceNumber}
                  onChange={(e) => setSelectedInvoice({ ...selectedInvoice, invoiceNumber: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select
                  value={selectedInvoice.status}
                  onValueChange={(value) => setSelectedInvoice({ ...selectedInvoice, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="editClient">Client</Label>
                <Select
                  value={selectedInvoice.clientId.toString()}
                  onValueChange={(value) => {
                    setSelectedInvoice({
                      ...selectedInvoice,
                      clientId: value,
                      // Reset project when client changes
                      projectId: "",
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="editProject">Project</Label>
                <Select
                  value={selectedInvoice.projectId.toString()}
                  onValueChange={(value) => setSelectedInvoice({ ...selectedInvoice, projectId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProjects
                      .filter((project) => project.clientId === Number.parseInt(selectedInvoice.clientId))
                      .map((project) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Issue Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedInvoice.issueDate ? format(selectedInvoice.issueDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedInvoice.issueDate}
                      onSelect={(date) => setSelectedInvoice({ ...selectedInvoice, issueDate: date })}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedInvoice.dueDate ? format(selectedInvoice.dueDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedInvoice.dueDate}
                      onSelect={(date) => setSelectedInvoice({ ...selectedInvoice, dueDate: date })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Invoice Items</h3>
                <Button variant="outline" size="sm" onClick={() => handleAddItem(selectedInvoice, setSelectedInvoice)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Input
                            value={item.description}
                            onChange={(e) =>
                              handleUpdateItem(
                                selectedInvoice,
                                setSelectedInvoice,
                                item.id,
                                "description",
                                e.target.value,
                              )
                            }
                            placeholder="Item description"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateItem(
                                selectedInvoice,
                                setSelectedInvoice,
                                item.id,
                                "quantity",
                                Number.parseInt(e.target.value) || 0,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={item.rate}
                            onChange={(e) =>
                              handleUpdateItem(
                                selectedInvoice,
                                setSelectedInvoice,
                                item.id,
                                "rate",
                                Number.parseFloat(e.target.value) || 0,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>{formatCurrency(item.amount)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(selectedInvoice, setSelectedInvoice, item.id)}
                            disabled={selectedInvoice.items.length === 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="editTaxType">Tax Type</Label>
                <Select
                  value={selectedInvoice.taxTypeId.toString()}
                  onValueChange={(value) => setSelectedInvoice({ ...selectedInvoice, taxTypeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tax type" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTaxTypes.map((tax) => (
                      <SelectItem key={tax.id} value={tax.id.toString()}>
                        {tax.name} ({tax.rate}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="editPaymentMethod">Payment Method</Label>
                <Select
                  value={selectedInvoice.paymentMethod}
                  onValueChange={(value) => setSelectedInvoice({ ...selectedInvoice, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank transfer">Bank Transfer</SelectItem>
                    <SelectItem value="credit card">Credit Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="wire transfer">Wire Transfer</SelectItem>
                    <SelectItem value="not specified">Not Specified</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="editNotes">Notes</Label>
                <Textarea
                  id="editNotes"
                  value={selectedInvoice.notes}
                  onChange={(e) => setSelectedInvoice({ ...selectedInvoice, notes: e.target.value })}
                  placeholder="Additional notes for the client..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 border-t pt-4">
              <div className="text-right mr-auto">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Subtotal:</span>
                  <span>{formatCurrency(selectedInvoice.items.reduce((sum, item) => sum + item.amount, 0))}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">
                    Tax ({getTaxTypeById(Number.parseInt(selectedInvoice.taxTypeId)).rate}%):
                  </span>
                  <span>
                    {formatCurrency(
                      selectedInvoice.items.reduce((sum, item) => sum + item.amount, 0) *
                        (getTaxTypeById(Number.parseInt(selectedInvoice.taxTypeId)).rate / 100),
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>
                    {formatCurrency(
                      selectedInvoice.items.reduce((sum, item) => sum + item.amount, 0) +
                        selectedInvoice.items.reduce((sum, item) => sum + item.amount, 0) *
                          (getTaxTypeById(Number.parseInt(selectedInvoice.taxTypeId)).rate / 100),
                    )}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateInvoice}>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Invoice Dialog */}
      {selectedInvoice && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>

            <p>
              Are you sure you want to delete invoice <strong>{selectedInvoice.invoiceNumber}</strong>?
            </p>
            <p className="text-gray-500">This action cannot be undone.</p>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteInvoice}>
                Delete Invoice
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
