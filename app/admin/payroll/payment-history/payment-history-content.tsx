"use client"

import { useState } from "react"
import { EnhancedDataTable } from "@/app/admin/components/enhanced-data-table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DetailsView } from "@/app/admin/components/details-view"
import { format } from "date-fns"
import { useGetPayments, useDeletePayment } from "@/services/hooks/payroll"

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
]

export function PaymentHistoryContent() {
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [showPaymentDetails, setShowPaymentDetails] = useState(false)
  
  // React Query hooks
  const { data: paymentsResponse, isLoading, error } = useGetPayments()
  const deletePaymentMutation = useDeletePayment()
  
  // Extract payments from response
  const payments = paymentsResponse?.data?.payrolls || paymentHistory

  // Columns for payment history table
  const paymentColumns = [
    { key: "payment_id", label: "Payment ID", sortable: true },
    { key: "employee_id", label: "Employee ID", sortable: true },
    {
      key: "payment_date",
      label: "Payment Date",
      sortable: true,
      render: (value: string) => format(new Date(value), "PPP"),
    },
    { key: "payment_type", label: "Type", sortable: true },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (value: string) => `$${parseFloat(value).toFixed(2)}`,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        const color = value === "paid" || value === "Completed" ? "green" : value === "pending" || value === "Pending" ? "yellow" : "red"
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
        { value: "salary", label: "Salary" },
        { value: "bonus", label: "Bonus" },
        { value: "commission", label: "Commission" },
        { value: "allowance", label: "Allowance" },
        { value: "reimbursement", label: "Reimbursement" },
      ],
    },
    {
      id: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "paid", label: "Paid" },
        { value: "pending", label: "Pending" },
        { value: "failed", label: "Failed" },
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
    const payment = payments.find((p: any) => p.payment_id === id || p.id === id)
    setSelectedPayment(payment)
    setShowPaymentDetails(true)
  }

  const handleDeletePayment = async (id: string) => {
    if (confirm("Are you sure you want to delete this payment?")) {
      try {
        await deletePaymentMutation.mutateAsync(parseInt(id))
      } catch (error) {
        console.error("Error deleting payment:", error)
      }
    }
  }

  // Payment details sections for the details view
  const paymentDetailsSections = [
    {
      title: "Payment Information",
      items: [
        { label: "Payment ID", value: selectedPayment?.payment_id },
        { label: "Payment Date", value: selectedPayment ? format(new Date(selectedPayment.payment_date), "PPP") : "" },
        { label: "Payment Type", value: selectedPayment?.payment_type },
        { label: "Amount", value: selectedPayment ? `$${parseFloat(selectedPayment.amount).toFixed(2)}` : "" },
        { label: "Status", value: selectedPayment?.status },
        { label: "Created", value: selectedPayment ? format(new Date(selectedPayment.created_at), "PPP p") : "" },
      ],
    },
    {
      title: "Employee Information",
      items: [
        { label: "Employee ID", value: selectedPayment?.employee_id },
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
        data={payments}
        isLoading={isLoading}
        onAdd={() => {}}
        onEdit={() => {}}
        onDelete={handleDeletePayment}
        onView={handleViewPayment}
        filterOptions={filterOptions}
        hideControlBar
        hideActions
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
                title={`Payment ${selectedPayment.payment_id}`}
                subtitle={`${selectedPayment.employee_id} - ${format(new Date(selectedPayment.payment_date), "PPP")}`}
                sections={paymentDetailsSections}
                actions={[
                  {
                    label: "Generate Payslip",
                    onClick: () => {
                      alert(`Generating payslip for payment ${selectedPayment.payment_id}`)
                    },
                    variant: "default",
                  },
                  {
                    label: "Print",
                    onClick: () => {
                      alert(`Printing payment details for ${selectedPayment.payment_id}`)
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
