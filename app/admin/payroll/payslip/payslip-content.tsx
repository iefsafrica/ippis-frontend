"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnhancedDataTable } from "@/app/admin/components/enhanced-data-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { CalendarIcon, Download, FileText, Printer } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for employees
const employees = [
  { id: "EMP-001", name: "John Doe", position: "Software Engineer", department: "Engineering" },
  { id: "EMP-002", name: "Jane Smith", position: "HR Manager", department: "Human Resources" },
  { id: "EMP-003", name: "Michael Johnson", position: "Financial Analyst", department: "Finance" },
  { id: "EMP-004", name: "Emily Davis", position: "Marketing Specialist", department: "Marketing" },
  { id: "EMP-005", name: "Robert Wilson", position: "Product Manager", department: "Product" },
]

// Mock data for payslips
const payslips = [
  {
    id: "PS-001",
    employeeId: "EMP-001",
    employeeName: "John Doe",
    department: "Engineering",
    position: "Software Engineer",
    month: "May 2023",
    generatedDate: "2023-05-31T10:00:00Z",
    status: "Generated",
  },
  {
    id: "PS-002",
    employeeId: "EMP-002",
    employeeName: "Jane Smith",
    department: "Human Resources",
    position: "HR Manager",
    month: "May 2023",
    generatedDate: "2023-05-31T10:05:00Z",
    status: "Generated",
  },
  {
    id: "PS-003",
    employeeId: "EMP-003",
    employeeName: "Michael Johnson",
    department: "Finance",
    position: "Financial Analyst",
    month: "May 2023",
    generatedDate: "2023-05-31T10:10:00Z",
    status: "Generated",
  },
  {
    id: "PS-004",
    employeeId: "EMP-004",
    employeeName: "Emily Davis",
    department: "Marketing",
    position: "Marketing Specialist",
    month: "May 2023",
    generatedDate: "2023-05-31T10:15:00Z",
    status: "Generated",
  },
  {
    id: "PS-005",
    employeeId: "EMP-005",
    employeeName: "Robert Wilson",
    department: "Product",
    position: "Product Manager",
    month: "May 2023",
    generatedDate: "2023-05-31T10:20:00Z",
    status: "Generated",
  },
  {
    id: "PS-006",
    employeeId: "EMP-001",
    employeeName: "John Doe",
    department: "Engineering",
    position: "Software Engineer",
    month: "June 2023",
    generatedDate: "2023-06-30T09:00:00Z",
    status: "Generated",
  },
  {
    id: "PS-007",
    employeeId: "EMP-002",
    employeeName: "Jane Smith",
    department: "Human Resources",
    position: "HR Manager",
    month: "June 2023",
    generatedDate: "2023-06-30T09:05:00Z",
    status: "Generated",
  },
]

// Mock payslip details
const payslipDetails = {
  id: "PS-001",
  employeeId: "EMP-001",
  employeeName: "John Doe",
  department: "Engineering",
  position: "Software Engineer",
  month: "May 2023",
  generatedDate: "2023-05-31T10:00:00Z",
  payPeriod: "May 1, 2023 - May 31, 2023",
  basicSalary: 5000.0,
  earnings: [
    { type: "Basic Salary", amount: 5000.0 },
    { type: "House Rent Allowance", amount: 500.0 },
    { type: "Medical Allowance", amount: 300.0 },
    { type: "Travel Allowance", amount: 200.0 },
    { type: "Dearness Allowance", amount: 100.0 },
  ],
  deductions: [
    { type: "Provident Fund", amount: 250.0 },
    { type: "Income Tax", amount: 500.0 },
    { type: "Health Insurance", amount: 100.0 },
    { type: "Loan Deduction", amount: 200.0 },
  ],
  totalEarnings: 6100.0,
  totalDeductions: 1050.0,
  netPay: 5050.0,
  bankName: "National Bank",
  accountNumber: "XXXX-XXXX-XXXX-1234",
  paymentMethod: "Bank Transfer",
  status: "Paid",
}

export function PayslipContent() {
  const [selectedTab, setSelectedTab] = useState("generate")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [showPayslipPreview, setShowPayslipPreview] = useState(false)
  const [showGenerateConfirmation, setShowGenerateConfirmation] = useState(false)

  // Columns for payslip table
  const payslipColumns = [
    { key: "id", label: "Payslip ID", sortable: true },
    { key: "employeeName", label: "Employee", sortable: true },
    { key: "department", label: "Department", sortable: true },
    { key: "month", label: "Month", sortable: true },
    {
      key: "generatedDate",
      label: "Generated Date",
      sortable: true,
      render: (value: string) => format(new Date(value), "PPP"),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        const color = value === "Generated" ? "green" : "yellow"
        return <Badge className={`bg-${color}-100 text-${color}-800`}>{value}</Badge>
      },
    },
  ]

  // Filter options for payslip table
  const filterOptions = [
    {
      id: "month",
      label: "Month",
      type: "select" as const,
      options: [
        { value: "May 2023", label: "May 2023" },
        { value: "June 2023", label: "June 2023" },
        { value: "July 2023", label: "July 2023" },
      ],
    },
    {
      id: "department",
      label: "Department",
      type: "select" as const,
      options: [
        { value: "Engineering", label: "Engineering" },
        { value: "Human Resources", label: "Human Resources" },
        { value: "Finance", label: "Finance" },
        { value: "Marketing", label: "Marketing" },
        { value: "Product", label: "Product" },
      ],
    },
  ]

  const handleGeneratePayslips = () => {
    setShowGenerateConfirmation(false)
    alert("Payslips generated successfully!")
  }

  const handleViewPayslip = (id: string) => {
    setShowPayslipPreview(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payslip Management</h2>
          <p className="text-muted-foreground">Generate and manage employee payslips</p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate Payslips</TabsTrigger>
          <TabsTrigger value="history">Payslip History</TabsTrigger>
        </TabsList>
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Payslips</CardTitle>
              <CardDescription>
                Generate payslips for all employees or a specific department for a selected month.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="month">Month</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="month"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "MMMM yyyy") : <span>Select month</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department (Optional)</Label>
                  <Select>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => setShowGenerateConfirmation(true)} className="mt-4">
                Generate Payslips
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <EnhancedDataTable
            title="Payslip Records"
            columns={payslipColumns}
            data={payslips}
            onAdd={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
            onView={handleViewPayslip}
            filterOptions={filterOptions}
          />
        </TabsContent>
      </Tabs>

      {/* Generate Confirmation Dialog */}
      <Dialog open={showGenerateConfirmation} onOpenChange={setShowGenerateConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payslip Generation</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to generate payslips for{" "}
              {selectedDate ? format(selectedDate, "MMMM yyyy") : "the selected month"}?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This will create payslips for all eligible employees based on their payment records.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowGenerateConfirmation(false)}>
              Cancel
            </Button>
            <Button onClick={handleGeneratePayslips}>Generate Payslips</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payslip Preview Dialog */}
      <Dialog open={showPayslipPreview} onOpenChange={setShowPayslipPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Payslip Preview</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="border rounded-lg p-6 bg-white">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold">IPPIS Payroll System</h3>
                  <p className="text-sm text-gray-500">Federal Government of Nigeria</p>
                </div>
                <div className="text-right">
                  <h4 className="text-lg font-semibold">Payslip</h4>
                  <p className="text-sm">ID: {payslipDetails.id}</p>
                  <p className="text-sm">Date: {format(new Date(payslipDetails.generatedDate), "PPP")}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h5 className="font-semibold mb-2">Employee Details</h5>
                  <p className="text-sm">ID: {payslipDetails.employeeId}</p>
                  <p className="text-sm">Name: {payslipDetails.employeeName}</p>
                  <p className="text-sm">Position: {payslipDetails.position}</p>
                  <p className="text-sm">Department: {payslipDetails.department}</p>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Payment Details</h5>
                  <p className="text-sm">Pay Period: {payslipDetails.payPeriod}</p>
                  <p className="text-sm">Payment Method: {payslipDetails.paymentMethod}</p>
                  <p className="text-sm">Bank: {payslipDetails.bankName}</p>
                  <p className="text-sm">Account: {payslipDetails.accountNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h5 className="font-semibold mb-2">Earnings</h5>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payslipDetails.earnings.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.type}</TableCell>
                          <TableCell className="text-right">${item.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell className="font-semibold">Total Earnings</TableCell>
                        <TableCell className="text-right font-semibold">
                          ${payslipDetails.totalEarnings.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Deductions</h5>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payslipDetails.deductions.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.type}</TableCell>
                          <TableCell className="text-right">${item.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell className="font-semibold">Total Deductions</TableCell>
                        <TableCell className="text-right font-semibold">
                          ${payslipDetails.totalDeductions.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <h5 className="text-lg font-bold">Net Pay</h5>
                  <p className="text-lg font-bold">${payslipDetails.netPay.toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="border-t pt-4">
                  <p className="text-sm">Employee Signature</p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm">Authorized Signature</p>
                </div>
              </div>

              <div className="mt-8 text-center text-xs text-gray-500">
                <p>This is a computer-generated document and does not require a physical signature.</p>
                <p>For any queries regarding this payslip, please contact the HR department.</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" className="gap-1">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" className="gap-1">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" className="gap-1">
              <FileText className="h-4 w-4" />
              Download CSV
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
