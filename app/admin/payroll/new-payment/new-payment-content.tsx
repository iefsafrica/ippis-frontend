"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { CoreHRClientWrapper } from "@/app/admin/core-hr/components/core-hr-client-wrapper"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { EnhancedForm, type FormField } from "@/app/admin/components/enhanced-form"
import {
  useCreatePayment,
  useGetPayments,
  useUpdatePayment,
  useDeletePayment,
} from "@/services/hooks/payroll"
import { useEmployeesList } from "@/services/hooks/employees/useEmployees"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertCircle,
  Banknote,
  CheckCircle,
  Clock,
  Download,
  Edit,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react"
import { format } from "date-fns"
import { buttonHoverEnhancements } from "@/app/admin/employees/button-hover"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { PaymentData, PaymentResponse } from "@/types/payroll"

type PaymentTab = "individual" | "bulk"

const paymentTabs: { key: PaymentTab; label: string }[] = [
  { key: "individual", label: "Individual Payment" },
  { key: "bulk", label: "Bulk Payment" },
]

const PAYMENT_TYPES = [
  { id: "1", name: "Salary" },
  { id: "2", name: "Bonus" },
  { id: "3", name: "Commission" },
  { id: "4", name: "Allowance" },
  { id: "5", name: "Reimbursement" },
]

const PAYMENT_METHODS = [
  { id: "1", name: "Bank Transfer" },
  { id: "2", name: "Check" },
  { id: "3", name: "Cash" },
  { id: "4", name: "Mobile Money" },
]

const PAYMENT_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
] as const

const formatStatusLabel = (status?: string) =>
  status ? `${status.charAt(0).toUpperCase()}${status.slice(1)}` : "—"


export function NewPaymentContent() {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const tabParam = searchParams.get("tab")
  const selectedTab: PaymentTab = tabParam === "bulk" ? "bulk" : "individual"
  const handleTabChange = (tab: PaymentTab) => {
    const params = new URLSearchParams(searchParams.toString())
    if (tab === "individual") {
      params.delete("tab")
    } else {
      params.set("tab", tab)
    }

  const query = params.toString()
  router.push(query ? `${pathname}?${query}` : pathname)
}

  const createPayment = useCreatePayment()
  const { data: paymentsResponse, isLoading: isLoadingPayments, refetch: refetchPayments } = useGetPayments()

  const {
    data: employeesResponse,
    isFetching: isFetchingEmployees,
    refetch: refetchEmployees,
  } = useEmployeesList(1)

  const employees = useMemo(
    () => employeesResponse?.employees ?? [],
    [employeesResponse],
  )

  const paymentSearchFields = useMemo(
    () => [
      { name: "payment_id", label: "Payment ID", type: "text" as const },
      { name: "employee_id", label: "Employee ID", type: "text" as const },
      {
        name: "status",
        label: "Status",
        type: "select" as const,
        options: PAYMENT_STATUS_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
        })),
      },
      {
        name: "payment_type",
        label: "Payment Type",
        type: "select" as const,
        options: PAYMENT_TYPES.map((type) => ({ value: type.name, label: type.name })),
      },
    ],
    [],
  )

  const updatePayment = useUpdatePayment()
  const deletePayment = useDeletePayment()

  const [currentPayment, setCurrentPayment] = useState<PaymentResponse | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const [editAmount, setEditAmount] = useState("")
  const [editStatus, setEditStatus] = useState<PaymentResponse["status"]>("pending")
  const [editPaymentDate, setEditPaymentDate] = useState("")
  const [editPaymentType, setEditPaymentType] = useState("")

  useEffect(() => {
    if (!currentPayment || !isEditDialogOpen) {
      return
    }

    setEditAmount(currentPayment.amount)
    setEditStatus(currentPayment.status)
    const normalizedDate = currentPayment.payment_date
      ? currentPayment.payment_date.split("T")[0]
      : ""
    setEditPaymentDate(normalizedDate)
    setEditPaymentType(currentPayment.payment_type)
  }, [currentPayment, isEditDialogOpen])

  const closeViewDialog = () => {
    setIsViewDialogOpen(false)
    setCurrentPayment(null)
  }

  const closeEditDialog = () => {
    setIsEditDialogOpen(false)
    setCurrentPayment(null)
  }

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!currentPayment) {
      return
    }

    await updatePayment.mutateAsync({
      payment_id: currentPayment.payment_id,
      employee_id: currentPayment.employee_id,
      amount: parseFloat(editAmount) || 0,
      payment_date: editPaymentDate
        ? new Date(editPaymentDate).toISOString()
        : currentPayment.payment_date,
      payment_type: editPaymentType || currentPayment.payment_type,
      status: editStatus || currentPayment.status,
      id: currentPayment.id,
    })

    setIsEditDialogOpen(false)
    setCurrentPayment(null)
  }

  const handleConfirmDelete = async () => {
    if (!currentPayment) {
      return
    }

    await deletePayment.mutateAsync(currentPayment.id)
    setIsDeleteDialogOpen(false)
    setCurrentPayment(null)
  }

  const getIndividualPaymentFields = (): FormField[] => [
    {
      name: "employee",
      label: "Employee",
      type: "text",
      required: true,
      disabled: true,
      defaultValue: selectedEmployee ? `${selectedEmployee.name} (${selectedEmployee.position})` : "",
    },
    {
      name: "paymentType",
      label: "Payment Type",
      type: "select",
      required: true,
      options: PAYMENT_TYPES.map((t) => ({ value: t.id, label: t.name })),
    },
    {
      name: "paymentMethod",
      label: "Payment Method",
      type: "select",
      required: true,
      options: PAYMENT_METHODS.map((m) => ({ value: m.id, label: m.name })),
    },
    {
      name: "paymentDate",
      label: "Payment Date",
      type: "date",
      required: true,
      defaultValue: new Date(),
    },
    {
      name: "basicSalary",
      label: "Basic Salary",
      type: "number",
      required: true,
      defaultValue: "0.00",
    },
    { name: "houseRentAllowance", label: "House Rent Allowance", type: "number", defaultValue: "0.00" },
    { name: "medicalAllowance", label: "Medical Allowance", type: "number", defaultValue: "0.00" },
    { name: "travelAllowance", label: "Travel Allowance", type: "number", defaultValue: "0.00" },
    { name: "dearnessAllowance", label: "Dearness Allowance", type: "number", defaultValue: "0.00" },
    { name: "providentFund", label: "Provident Fund", type: "number", defaultValue: "0.00" },
    { name: "incomeTax", label: "Income Tax", type: "number", defaultValue: "0.00" },
    { name: "healthInsurance", label: "Health Insurance", type: "number", defaultValue: "0.00" },
    { name: "loanDeduction", label: "Loan Deduction", type: "number", defaultValue: "0.00" },
    { name: "comments", label: "Comments", type: "textarea", placeholder: "Add any notes" },
  ]

  const bulkPaymentFields: FormField[] = [
    { name: "paymentMonth", label: "Payment Month", type: "date", required: true, defaultValue: new Date() },
    {
      name: "paymentType",
      label: "Payment Type",
      type: "select",
      required: true,
      options: PAYMENT_TYPES.map((t) => ({ value: t.id, label: t.name })),
    },
    {
      name: "paymentMethod",
      label: "Payment Method",
      type: "select",
      required: true,
      options: PAYMENT_METHODS.map((m) => ({ value: m.id, label: m.name })),
    },
    {
      name: "department",
      label: "Department (Optional)",
      type: "select",
      options: [
        { value: "all", label: "All Departments" },
        { value: "engineering", label: "Engineering" },
        { value: "hr", label: "Human Resources" },
        { value: "finance", label: "Finance" },
        { value: "marketing", label: "Marketing" },
        { value: "product", label: "Product" },
      ],
      defaultValue: "all",
    },
    { name: "comments", label: "Comments", type: "textarea", placeholder: "Add any notes" },
  ]

  const handleSelectEmployee = useCallback(
    (id: string) => {
      const employee = employees.find((e) => e.id === id)
      setSelectedEmployee(employee || null)
      setShowEmployeeSelector(false)
    },
    [employees],
  )

  const employeeModalSearchFields = useMemo(
    () => [
      { name: "name", label: "Name", type: "text" as const },
      { name: "position", label: "Position", type: "text" as const },
      {
        name: "department",
        label: "Department",
        type: "select" as const,
        options: [
          { value: "engineering", label: "Engineering" },
          { value: "hr", label: "Human Resources" },
          { value: "finance", label: "Finance" },
          { value: "marketing", label: "Marketing" },
          { value: "product", label: "Product" },
        ],
      },
    ],
    [],
  )

  const employeeModalColumns = useMemo(
    () => [
      { key: "name", label: "Employee Name", sortable: true },
      { key: "position", label: "Position", sortable: true },
      { key: "department", label: "Department", sortable: true },
      {
        key: "actions",
        label: "Actions",
        render: (_value: string, row: any) => (
          <Button onClick={() => handleSelectEmployee(row.id)} size="sm" variant="outline" className="text-xs">
            Select
          </Button>
        ),
      },
    ],
    [handleSelectEmployee],
  )
  

  const handleSubmitIndividualPayment = async (formData: Record<string, any>) => {
    if (!selectedEmployee) {
      toast.error("Please select an employee before processing payment.")
      return
    }

    const paymentTypeMap: Record<string, string> = {
      "1": "salary",
      "2": "bonus",
      "3": "commission",
      "4": "allowance",
      "5": "reimbursement",
    }

    const allowances = [
      formData.basicSalary,
      formData.houseRentAllowance,
      formData.medicalAllowance,
      formData.travelAllowance,
      formData.dearnessAllowance,
      formData.providentFund,
      formData.healthInsurance,
    ]

    const deductions = [formData.incomeTax, formData.loanDeduction]

    const amount =
      allowances.reduce((sum, value) => sum + (parseFloat(value || "0") || 0), 0) -
      deductions.reduce((sum, value) => sum + (parseFloat(value || "0") || 0), 0)

    const paymentData = {
      employee_id: selectedEmployee.employee_id || selectedEmployee.id,
      amount: amount || 0,
      payment_date: new Date(formData.paymentDate).toISOString().split("T")[0],
      payment_type: paymentTypeMap[formData.paymentType] || "salary",
      status: "pending",
    }

    try {
      await createPayment.mutateAsync(paymentData)
      toast.success("Payment record queued for processing.")
      setSelectedEmployee(null)
    } catch (error: any) {
      console.error("Payment creation error:", error)
      toast.error(error?.message || "Failed to create payment")
    }
  }

  const handleSubmitBulkPayment = (data: Record<string, any>) => {
    console.log("Bulk payment submitted:", data)
    toast.success("Bulk payment stub (backend integration pending).")
  }

  const handleViewPayment = (payment: PaymentResponse) => {
    setCurrentPayment(payment)
    setIsViewDialogOpen(true)
  }

  const handleEditPayment = (payment: PaymentResponse) => {
    setCurrentPayment(payment)
    setIsEditDialogOpen(true)
  }

  const handleDeletePayment = (payment: PaymentResponse) => {
    setCurrentPayment(payment)
    setIsDeleteDialogOpen(true)
  }

  const payments = paymentsResponse?.data?.payrolls || []
  const totalAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.amount || "0"), 0)
  const pendingCount = payments.filter((p) => p.status === "pending").length
  const paidCount = payments.filter((p) => p.status === "paid").length
  const failedCount = payments.filter((p) => p.status === "failed").length
  const isProcessing = isLoadingPayments || createPayment.isPending

  const paymentColumns = useMemo(
    () => [
      { key: "payment_id", label: "Payment ID", sortable: true },
      { key: "employee_id", label: "Employee ID", sortable: true },
      {
        key: "payment_type",
        label: "Type",
        sortable: true,
        render: (value: string) => (
          <Badge className="bg-blue-50 text-blue-700 rounded-full px-2 py-1 text-xs font-semibold">
            {value?.charAt(0).toUpperCase() + value?.slice(1)}
          </Badge>
        ),
      },
      {
        key: "amount",
        label: "Amount",
        sortable: true,
        render: (value: string) => {
          const amount = parseFloat(value) || 0
          return `â‚¦${amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}`
        },
      },
      {
        key: "payment_date",
        label: "Date",
        sortable: true,
        render: (value: string) => {
          try {
            return format(new Date(value), "MMM dd, yyyy")
          } catch {
            return value
          }
        },
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        render: (value: string) => {
          const config: Record<string, { bg: string; text: string }> = {
            pending: { bg: "bg-yellow-50", text: "text-yellow-700" },
            paid: { bg: "bg-green-50", text: "text-green-700" },
            failed: { bg: "bg-red-50", text: "text-red-700" },
          }
          const style = config[value] || { bg: "bg-gray-50", text: "text-gray-700" }
          return (
          <Badge className={`${style.bg} ${style.text} rounded-full px-2 py-1 text-xs font-medium`}>
            {formatStatusLabel(value)}
          </Badge>
          )
        },
      },
      {
        key: "actions",
        label: "Actions",
        render: (_value: any, row: PaymentResponse) => (
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleViewPayment(row)}
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleEditPayment(row)}
              title="Edit"
              disabled={row.status !== "pending"}
              className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDeletePayment(row)}
              title="Delete"
              disabled={row.status !== "pending"}
              className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  return (
    <CoreHRClientWrapper title="New Payment" endpoint="/api/admin/payroll">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="inline-flex flex-wrap gap-2 rounded-xl border border-emerald-100 bg-emerald-50/40 p-2 shadow-sm">
          {paymentTabs.map((tab) => {
            const isActive = selectedTab === tab.key
            return (
              <Button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key)}
                className={
                  isActive
                    ? `${buttonHoverEnhancements} rounded-lg border border-[#008751] bg-[#008751] text-white shadow-sm transition-colors hover:bg-[#006f43] hover:!bg-[#006f43] hover:text-white hover:!text-white`
                    : `${buttonHoverEnhancements} rounded-lg border border-emerald-200 bg-white text-emerald-800 transition-colors hover:border-emerald-400 hover:bg-emerald-100 hover:text-emerald-900`
                }
              >
                {tab.label}
              </Button>
            )
          })}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 flex items-center justify-center shadow-sm">
              <Banknote className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                New Payment
              </h1>
              <p className="text-gray-600 mt-1">
                Process individual or bulk payments
                {payments.length > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({payments.length} records)
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={refetchPayments}
                    disabled={isProcessing}
                    className="h-10 px-3.5 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="ml-2 hidden sm:inline">Refresh</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh payment data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {selectedTab === "individual" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Payment Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Banknote className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      â‚¦{(totalAmount / 1000000).toFixed(1)}M
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{totalAmount.toLocaleString()} total</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Pending Approval</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-lg bg-yellow-100 border border-yellow-200 flex items-center justify-center mr-3">
                    <Clock className="h-4 w-4 text-yellow-700" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{pendingCount}</div>
                    <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Processed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-lg bg-green-100 border border-green-200 flex items-center justify-center mr-3">
                    <CheckCircle className="h-4 w-4 text-green-700" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{paidCount}</div>
                    <p className="text-xs text-gray-500 mt-1">Completed payments</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Failed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center mr-3">
                    <AlertCircle className="h-4 w-4 text-red-700" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{failedCount}</div>
                    <p className="text-xs text-gray-500 mt-1">Failed transactions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === "individual" && (
          <>
            <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden mb-6">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Payment Operations</CardTitle>
                    <CardDescription className="text-gray-600">
                      Switch between individual payment workflows
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button onClick={() => setShowEmployeeSelector(true)} className="gap-2">
                      <Download className="h-4 w-4" />
                      Select Employee
                    </Button>
                  </div>
                  {!selectedEmployee ? (
                    <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
                      Select an employee to begin processing payment
                    </div>
                  ) : (
                    <EnhancedForm
                      fields={getIndividualPaymentFields()}
                      onSubmit={handleSubmitIndividualPayment}
                      onCancel={() => setSelectedEmployee(null)}
                      submitLabel="Process Payment"
                      isSubmitting={createPayment.isPending}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Payment Records</CardTitle>
                    <CardDescription className="text-gray-600">
                      Monitor the latest payment submissions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  title="Payments"
                  columns={paymentColumns}
                  data={payments}
                  searchFields={paymentSearchFields}
                />
              </CardContent>
            </Card>
          </>
        )}

        {selectedTab === "bulk" && (
          <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden mb-6">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Bulk Payment</CardTitle>
                  <CardDescription className="text-gray-600">
                    Process bulk payments in a single request
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <EnhancedForm
                fields={bulkPaymentFields}
                onSubmit={handleSubmitBulkPayment}
                submitLabel="Process Bulk Payment"
              />
            </CardContent>
          </Card>
        )}

        <Dialog
          open={isViewDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              closeViewDialog()
            }
          }}
        >
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>View Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {currentPayment && (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-600">Payment Details</div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[
                      { label: "Payment ID", value: currentPayment.payment_id },
                      { label: "Employee ID", value: currentPayment.employee_id },
                      {
                        label: "Employee Name",
                        value: currentPayment.employee_name ?? "—",
                      },
                      { label: "Department", value: currentPayment.department ?? "—" },
                      {
                        label: "Amount",
                        value: `₦${(parseFloat(currentPayment.amount) || 0).toLocaleString()}`,
                      },
                      {
                        label: "Status",
                        value: formatStatusLabel(currentPayment.status),
                      },
                      {
                        label: "Payment Date",
                        value: currentPayment.payment_date,
                      },
                      {
                        label: "Payment Type",
                        value: currentPayment.payment_type,
                      },
                      {
                        label: "Created At",
                        value: currentPayment.created_at ?? currentPayment.createdAt ?? "—",
                      },
                      {
                        label: "Updated At",
                        value: currentPayment.updated_at ?? currentPayment.updatedAt ?? "—",
                      },
                    ].map((field) => (
                      <div
                        key={field.label}
                        className="rounded-md border bg-white p-3 shadow-sm flex flex-col"
                      >
                        <span className="text-xs text-gray-500">{field.label}</span>
                        <span className="text-sm font-semibold text-gray-900">{field.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={closeViewDialog}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              closeEditDialog()
            }
          }}
        >
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Edit Payment</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleEditSubmit}>
              <div>
                <Label htmlFor="edit-employee">Employee ID</Label>
                <Input
                  id="edit-employee"
                  value={currentPayment?.employee_id ?? ""}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="edit-amount">Amount</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  value={editAmount}
                  onChange={(event) => setEditAmount(event.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-date">Payment Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editPaymentDate}
                  onChange={(event) => setEditPaymentDate(event.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editStatus || "pending"} onValueChange={(value) => setEditStatus(value as PaymentResponse["status"])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment Type</Label>
                <Select value={editPaymentType || currentPayment?.payment_type || ""} onValueChange={setEditPaymentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeEditDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updatePayment.isPending}>
                  {updatePayment.isPending ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false)
            setCurrentPayment(null)
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Payment"
          description={`Delete payment ${currentPayment?.payment_id ?? "this payment"}?`}
          itemName={`Payment ${currentPayment?.payment_id ?? ""}`}
          isLoading={deletePayment.isPending}
        />

        <Dialog open={showEmployeeSelector} onOpenChange={setShowEmployeeSelector}>
          <DialogContent className="max-w-4xl w-full">
            <DialogHeader>
              <DialogTitle>Select Employee</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <DataTable
                title="Employees"
                columns={employeeModalColumns}
                data={employees}
                searchFields={employeeModalSearchFields}
                itemsPerPage={Math.max(employees.length, 10)}
                defaultSortColumn="name"
                extraSearchControls={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchEmployees()}
                    disabled={isFetchingEmployees}
                    className="gap-1"
                  >
                    {isFetchingEmployees ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Refresh Employees
                  </Button>
                }
                tableClassName="min-w-full"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CoreHRClientWrapper>
  )
}
