"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnhancedDataTable } from "@/app/admin/components/enhanced-data-table"
import { EnhancedForm, type FormField } from "@/app/admin/components/enhanced-form"
import { Download, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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

export function NewPaymentContent() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState("individual")
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/employees")
      const data = await res.json()
      if (data.success) {
        setEmployees(data.data.employees)
      } else {
        console.error("Failed to fetch employees:", data.error)
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
    } finally {
      setLoading(false)
    }
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
      name: "paymentDate",
      label: "Payment Date",
      type: "date",
      required: true,
      defaultValue: new Date(),
    },
    {
      name: "paymentMethod",
      label: "Payment Method",
      type: "select",
      required: true,
      options: PAYMENT_METHODS.map((m) => ({ value: m.id, label: m.name })),
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

  const employeeColumns = [
    { key: "name", label: "Employee Name", sortable: true },
    { key: "position", label: "Position", sortable: true },
    { key: "department", label: "Department", sortable: true },
    {
      key: "status",
      label: "Status",
      render: () => <Badge className="bg-green-100 text-green-800">Active</Badge>,
    },
  ]

  const handleSelectEmployee = (id: string) => {
    const employee = employees.find((e) => e.id === id)
    setSelectedEmployee(employee || null)
    setShowEmployeeSelector(false)
    setShowPaymentForm(true)
  }

 const handleSubmitIndividualPayment = async (formData: Record<string, any>) => {
  if (!selectedEmployee) {
    alert("No employee selected.")
    return
  }

  const payload = {
    amount: parseFloat(formData.basicSalary || "0"),
    clientReference: `PAY-${Date.now()}`,
    transactionReference: `TX-${Date.now()}`,
    initiatorAccountNumber: "1234567890",
    initiatorInstitutionCode: "001",
    initiatorAccountName: "IPPIS Payroll",
    initiatorBVN: "12345678901",
    beneficiaryAccountNumber: selectedEmployee.accountNumber,
    beneficiaryIssuerCode: selectedEmployee.bankCode,
  }

  try {
    const res = await fetch("/api/payments/etranzact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const result = await res.json()

    if (res.ok && result.success) {
      alert("Payment processed successfully!")
      setShowPaymentForm(false)
      setSelectedEmployee(null)
    } else {
      console.error("Payment failed:", result)
      alert(`Failed to process payment: ${result.error || "Unknown error"}`)
    }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    alert("An unexpected error occurred while processing the payment.")
  }
}


  const handleSubmitBulkPayment = (data: Record<string, any>) => {
    console.log("Bulk payment submitted:", data)
    alert("Bulk payment processed successfully!")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">New Payment</h2>
          <p className="text-muted-foreground">Create new salary or bonus payments for employees</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            Export Template
          </Button>
          <Button variant="outline" className="gap-1">
            <FileText className="h-4 w-4" />
            Import Data
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual">Individual Payment</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Individual Employee Payment</CardTitle>
              <CardDescription>Select an employee to process their payment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedEmployee && !showPaymentForm ? (
                <Button onClick={() => setShowEmployeeSelector(true)}>Select Employee</Button>
              ) : (
                showPaymentForm && (
                  <EnhancedForm
                    fields={getIndividualPaymentFields()}
                    onSubmit={handleSubmitIndividualPayment}
                    onCancel={() => {
                      setSelectedEmployee(null)
                      setShowPaymentForm(false)
                    }}
                    submitLabel="Process Payment"
                  />
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Payment Processing</CardTitle>
              <CardDescription>Process salary payments for multiple employees.</CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedForm
                fields={bulkPaymentFields}
                onSubmit={handleSubmitBulkPayment}
                submitLabel="Process Bulk Payment"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Employee Selector Modal */}
      <Dialog open={showEmployeeSelector} onOpenChange={setShowEmployeeSelector}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Select Employee</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <EnhancedDataTable
              title="Employees"
              columns={employeeColumns}
              data={employees}
              isLoading={loading}
              onAdd={() => {}}
              onEdit={() => {}}
              onDelete={() => {}}
              onView={(id) => handleSelectEmployee(id)}
              filterOptions={[
                {
                  id: "department",
                  label: "Department",
                  type: "select",
                  options: [
                    { value: "engineering", label: "Engineering" },
                    { value: "hr", label: "Human Resources" },
                    { value: "finance", label: "Finance" },
                    { value: "marketing", label: "Marketing" },
                    { value: "product", label: "Product" },
                  ],
                },
              ]}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
