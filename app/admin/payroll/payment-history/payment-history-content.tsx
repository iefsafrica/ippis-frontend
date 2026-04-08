 "use client"

import { useState } from "react"
import { EnhancedDataTable } from "@/app/admin/components/enhanced-data-table"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { format } from "date-fns"
import { useGetPayments, useDeletePayment } from "@/services/hooks/payroll"
import { PayslipDialog } from "@/app/admin/payroll/payroll-payslip/payslip-dialog"
import { formatCurrency } from "@/app/admin/payroll/payroll-payslip/payslip-utils"

const paymentHistory = [
  {
    id: 1,
    payment_id: "PAY-001",
    employee_id: "EMP-001",
    employee_name: "John Doe",
    department: "Engineering",
    position: "Software Engineer",
    payment_date: "2023-05-28T08:00:00Z",
    payment_type: "Salary",
    payment_method: "Bank Transfer",
    amount: "5000.00",
    status: "Completed",
    month: "May 2023",
    memo: "Monthly salary transfer",
  },
  {
    id: 2,
    payment_id: "PAY-002",
    employee_id: "EMP-002",
    employee_name: "Jane Smith",
    department: "Human Resources",
    position: "HR Manager",
    payment_date: "2023-05-28T09:30:00Z",
    payment_type: "Salary",
    payment_method: "Bank Transfer",
    amount: "6500.00",
    status: "Completed",
    month: "May 2023",
    memo: "Monthly salary transfer",
  },
  {
    id: 3,
    payment_id: "PAY-003",
    employee_id: "EMP-003",
    employee_name: "Michael Johnson",
    department: "Finance",
    position: "Financial Analyst",
    payment_date: "2023-05-28T10:15:00Z",
    payment_type: "Salary",
    payment_method: "Bank Transfer",
    amount: "5500.00",
    status: "Completed",
    month: "May 2023",
    memo: "Monthly salary transfer",
  },
]

const formatCurrency = (value?: string | number) => {
  const amount = typeof value === "string" ? parseFloat(value) : value
  if (amount == null || Number.isNaN(amount)) {
    return "₦0.00"
  }
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount)
}

const normalizeStatus = (status?: string) => {
  const normalized = (status ?? "").toLowerCase()
  if (normalized === "completed" || normalized === "paid") return "green"
  if (normalized === "pending") return "yellow"
  if (normalized === "failed" || normalized === "declined") return "red"
  return "gray"
}

export function PaymentHistoryContent() {
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [showPayslipDialog, setShowPayslipDialog] = useState(false)

  const { data: paymentsResponse, isLoading } = useGetPayments()
  const deletePaymentMutation = useDeletePayment()

  const payments = paymentsResponse?.data?.payrolls || paymentHistory

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
      render: (value: string) => formatCurrency(value),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        const color = normalizeStatus(value)
        return <span className={`text-${color}-600`}>{value}</span>
      },
    },
  ]

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
      id: "payment_type",
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

  const resolvePayment = (identifier: string) =>
    payments.find((payment: any) => `${payment.payment_id}` === identifier || `${payment.id}` === identifier)

  const handleViewPayslip = (id: string) => {
    const payment = resolvePayment(id)
    if (!payment) return
    setSelectedPayment(payment)
    setShowPayslipDialog(true)
  }

  const handleDeletePayment = async (id: string) => {
    if (confirm("Are you sure you want to delete this payment?")) {
      try {
        const payment = resolvePayment(id)
        const parsedId = payment?.id ?? Number(id)
        if (!parsedId || Number.isNaN(Number(parsedId))) {
          throw new Error("Invalid payment identifier")
        }
        await deletePaymentMutation.mutateAsync(Number(parsedId))
      } catch (error) {
        console.error("Error deleting payment:", error)
      }
    }
  }

  const closePayslipDialog = () => {
    setShowPayslipDialog(false)
    setSelectedPayment(null)
  }

  const handlePrintPayslip = () => {
    if (typeof window !== "undefined") {
      window.print()
    }
  }

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
        onView={handleViewPayslip}
        filterOptions={filterOptions}
        hideControlBar
        renderRowActions={(row) => (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleViewPayslip(String(row.payment_id ?? row.id ?? ""))}
              title="View Payment"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        )}
      />

      <PayslipDialog payment={selectedPayment} open={showPayslipDialog} onClose={closePayslipDialog} />
    </div>
  )
}
