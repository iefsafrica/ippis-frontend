"use client"

import { useState } from "react"
import { EnhancedDataTable } from "@/app/admin/components/enhanced-data-table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DetailsView } from "@/app/admin/components/details-view"
import { format } from "date-fns"

// Mock data for payment history
const paymentHistory = [
  {
    id: "PAY-001",
    employeeId: "EMP-001",
    employeeName: "John Doe",
    department: "Engineering",
    position: "Software Engineer",
    paymentDate: "2023-05-28T08:00:00Z",
    paymentType: "Salary",
    paymentMethod: "Bank Transfer",
    amount: 5000.0,
    status: "Completed",
    month: "May 2023",
  },
  {
    id: "PAY-002",
    employeeId: "EMP-002",
    employeeName: "Jane Smith",
    department: "Human Resources",
    position: "HR Manager",
    paymentDate: "2023-05-28T09:30:00Z",
    paymentType: "Salary",
    paymentMethod: "Bank Transfer",
    amount: 6500.0,
    status: "Completed",
    month: "May 2023",
  },
  {
    id: "PAY-003",
    employeeId: "EMP-003",
    employeeName: "Michael Johnson",
    department: "Finance",
    position: "Financial Analyst",
    paymentDate: "2023-05-28T10:15:00Z",
    paymentType: "Salary",
    paymentMethod: "Bank Transfer",
    amount: 5500.0,
    status: "Completed",
    month: "May 2023",
  },
  {
    id: "PAY-004",
    employeeId: "EMP-004",
    employeeName: "Emily Davis",
    department: "Marketing",
    position: "Marketing Specialist",
    paymentDate: "2023-05-28T11:00:00Z",
    paymentType: "Salary",
    paymentMethod: "Bank Transfer",
    amount: 4800.0,
    status: "Completed",
    month: "May 2023",
  },
  {
    id: "PAY-005",
    employeeId: "EMP-005",
    employeeName: "Robert Wilson",
    department: "Product",
    position: "Product Manager",
    paymentDate: "2023-05-28T13:30:00Z",
    paymentType: "Salary",
    paymentMethod: "Bank Transfer",
    amount: 7000.0,
    status: "Completed",
    month: "May 2023",
  },
  {
    id: "PAY-006",
    employeeId: "EMP-001",
    employeeName: "John Doe",
    department: "Engineering",
    position: "Software Engineer",
    paymentDate: "2023-06-28T08:00:00Z",
    paymentType: "Salary",
    paymentMethod: "Bank Transfer",
    amount: 5000.0,
    status: "Completed",
    month: "June 2023",
  },
  {
    id: "PAY-007",
    employeeId: "EMP-002",
    employeeName: "Jane Smith",
    department: "Human Resources",
    position: "HR Manager",
    paymentDate: "2023-06-28T09:30:00Z",
    paymentType: "Salary",
    paymentMethod: "Bank Transfer",
    amount: 6500.0,
    status: "Completed",
    month: "June 2023",
  },
  {
    id: "PAY-008",
    employeeId: "EMP-001",
    employeeName: "John Doe",
    department: "Engineering",
    position: "Software Engineer",
    paymentDate: "2023-06-15T10:00:00Z",
    paymentType: "Bonus",
    paymentMethod: "Bank Transfer",
    amount: 1000.0,
    status: "Completed",
    month: "June 2023",
  },
  {
    id: "PAY-009",
    employeeId: "EMP-003",
    employeeName: "Michael Johnson",
    department: "Finance",
    position: "Financial Analyst",
    paymentDate: "2023-07-05T14:30:00Z",
    paymentType: "Salary",
    paymentMethod: "Check",
    amount: 5500.0,
    status: "Pending",
    month: "July 2023",
  },
  {
    id: "PAY-010",
    employeeId: "EMP-004",
    employeeName: "Emily Davis",
    department: "Marketing",
    position: "Marketing Specialist",
    paymentDate: "2023-07-05T15:45:00Z",
    paymentType: "Salary",
    paymentMethod: "Check",
    amount: 4800.0,
    status: "Pending",
    month: "July 2023",
  },
]

export function PaymentHistoryContent() {
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [showPaymentDetails, setShowPaymentDetails] = useState(false)

  // Columns for payment history table
  const paymentColumns = [
    { key: "id", label: "Payment ID", sortable: true },
    { key: "employeeName", label: "Employee", sortable: true },
    { key: "department", label: "Department", sortable: true },
    {
      key: "paymentDate",
      label: "Payment Date",
      sortable: true,
      render: (value: string) => format(new Date(value), "PPP"),
    },
    { key: "paymentType", label: "Type", sortable: true },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        const color = value === "Completed" ? "green" : value === "Pending" ? "yellow" : "red"
        return <Badge className={`bg-${color}-100 text-${color}-800`}>{value}</Badge>
      },
    },
  ]

  // Filter options for payment history
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
      id: "paymentType",
      label: "Payment Type",
      type: "select" as const,
      options: [
        { value: "Salary", label: "Salary" },
        { value: "Bonus", label: "Bonus" },
        { value: "Commission", label: "Commission" },
        { value: "Allowance", label: "Allowance" },
        { value: "Reimbursement", label: "Reimbursement" },
      ],
    },
    {
      id: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "Completed", label: "Completed" },
        { value: "Pending", label: "Pending" },
        { value: "Failed", label: "Failed" },
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

  const handleViewPayment = (id: string) => {
    const payment = paymentHistory.find((p) => p.id === id)
    setSelectedPayment(payment)
    setShowPaymentDetails(true)
  }

  // Payment details sections for the details view
  const paymentDetailsSections = [
    {
      title: "Payment Information",
      items: [
        { label: "Payment ID", value: selectedPayment?.id },
        { label: "Payment Date", value: selectedPayment ? format(new Date(selectedPayment.paymentDate), "PPP") : "" },
        { label: "Payment Type", value: selectedPayment?.paymentType },
        { label: "Payment Method", value: selectedPayment?.paymentMethod },
        { label: "Amount", value: selectedPayment ? `$${selectedPayment.amount.toFixed(2)}` : "" },
        { label: "Status", value: selectedPayment?.status },
        { label: "Month", value: selectedPayment?.month },
      ],
    },
    {
      title: "Employee Information",
      items: [
        { label: "Employee ID", value: selectedPayment?.employeeId },
        { label: "Employee Name", value: selectedPayment?.employeeName },
        { label: "Department", value: selectedPayment?.department },
        { label: "Position", value: selectedPayment?.position },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Payment History</h2>
        <p className="text-muted-foreground">View and manage all employee payment records</p>
      </div>

      <EnhancedDataTable
        title="Payment Records"
        columns={paymentColumns}
        data={paymentHistory}
        onAdd={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        onView={handleViewPayment}
        filterOptions={filterOptions}
      />

      {/* Payment Details Dialog */}
      <Dialog open={showPaymentDetails} onOpenChange={setShowPaymentDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedPayment && (
              <DetailsView
                title={`Payment ${selectedPayment.id}`}
                subtitle={`${selectedPayment.employeeName} - ${selectedPayment.month}`}
                sections={paymentDetailsSections}
                actions={[
                  {
                    label: "Generate Payslip",
                    onClick: () => {
                      alert(`Generating payslip for payment ${selectedPayment.id}`)
                    },
                    variant: "default",
                  },
                  {
                    label: "Print",
                    onClick: () => {
                      alert(`Printing payment details for ${selectedPayment.id}`)
                    },
                    variant: "outline",
                  },
                ]}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
