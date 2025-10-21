"use client"

import { useState } from "react"
import { FinanceDataTable } from "../components/finance-data-table"
import { FinanceFormDialog } from "../components/finance-form-dialog"
import { FinanceDetailsDialog } from "../components/finance-details-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

// Mock data for payees
const mockPayees = [
  {
    id: "1",
    name: "ABC Suppliers Ltd",
    contactPerson: "John Smith",
    email: "john@abcsuppliers.com",
    phone: "+234 801 234 5678",
    address: "123 Main Street, Lagos",
    accountNumber: "1234567890",
    bankName: "First Bank",
    taxId: "TAX12345",
    category: "supplier",
    status: "active",
    createdAt: "2023-01-15T10:30:00",
    lastPaymentDate: "2023-05-10T14:30:00",
    lastPaymentAmount: 25000.0,
    notes: "Office supplies vendor",
  },
  {
    id: "2",
    name: "XYZ Consulting",
    contactPerson: "Sarah Johnson",
    email: "sarah@xyzconsulting.com",
    phone: "+234 802 345 6789",
    address: "456 Business Avenue, Abuja",
    accountNumber: "9876543210",
    bankName: "Zenith Bank",
    taxId: "TAX67890",
    category: "service",
    status: "active",
    createdAt: "2023-02-01T09:15:00",
    lastPaymentDate: "2023-05-05T11:45:00",
    lastPaymentAmount: 75000.0,
    notes: "IT consulting services",
  },
  {
    id: "3",
    name: "Global Logistics Inc",
    contactPerson: "Michael Brown",
    email: "michael@globallogistics.com",
    phone: "+234 803 456 7890",
    address: "789 Transport Road, Port Harcourt",
    accountNumber: "5678901234",
    bankName: "Guaranty Trust Bank",
    taxId: "TAX24680",
    category: "logistics",
    status: "active",
    createdAt: "2023-01-20T14:45:00",
    lastPaymentDate: "2023-04-28T16:20:00",
    lastPaymentAmount: 120000.0,
    notes: "Shipping and logistics partner",
  },
  {
    id: "4",
    name: "Tech Solutions Ltd",
    contactPerson: "David Wilson",
    email: "david@techsolutions.com",
    phone: "+234 804 567 8901",
    address: "101 Innovation Street, Lagos",
    accountNumber: "2468013579",
    bankName: "Access Bank",
    taxId: "TAX13579",
    category: "technology",
    status: "active",
    createdAt: "2023-03-05T11:30:00",
    lastPaymentDate: "2023-05-02T09:15:00",
    lastPaymentAmount: 95000.0,
    notes: "Hardware and software provider",
  },
  {
    id: "5",
    name: "Office Furniture Co",
    contactPerson: "Jennifer Lee",
    email: "jennifer@officefurniture.com",
    phone: "+234 805 678 9012",
    address: "202 Industrial Zone, Kano",
    accountNumber: "1357924680",
    bankName: "United Bank for Africa",
    taxId: "TAX97531",
    category: "supplier",
    status: "inactive",
    createdAt: "2023-02-15T13:20:00",
    lastPaymentDate: "2023-03-20T10:30:00",
    lastPaymentAmount: 150000.0,
    notes: "Office furniture supplier - currently inactive",
  },
  {
    id: "6",
    name: "Marketing Experts",
    contactPerson: "Robert Taylor",
    email: "robert@marketingexperts.com",
    phone: "+234 806 789 0123",
    address: "303 Media Plaza, Lagos",
    accountNumber: "8642097531",
    bankName: "Standard Chartered",
    taxId: "TAX86420",
    category: "marketing",
    status: "active",
    createdAt: "2023-04-01T10:00:00",
    lastPaymentDate: "2023-04-25T15:45:00",
    lastPaymentAmount: 85000.0,
    notes: "Digital marketing agency",
  },
  {
    id: "7",
    name: "Cleaning Services Ltd",
    contactPerson: "Amanda White",
    email: "amanda@cleaningservices.com",
    phone: "+234 807 890 1234",
    address: "404 Service Road, Ibadan",
    accountNumber: "9753108642",
    bankName: "Fidelity Bank",
    taxId: "TAX75319",
    category: "service",
    status: "active",
    createdAt: "2023-03-15T09:30:00",
    lastPaymentDate: "2023-05-01T11:00:00",
    lastPaymentAmount: 45000.0,
    notes: "Office cleaning services",
  },
  {
    id: "8",
    name: "Legal Associates",
    contactPerson: "James Miller",
    email: "james@legalassociates.com",
    phone: "+234 808 901 2345",
    address: "505 Justice Avenue, Abuja",
    accountNumber: "3691470258",
    bankName: "Stanbic IBTC",
    taxId: "TAX36914",
    category: "legal",
    status: "active",
    createdAt: "2023-01-10T15:15:00",
    lastPaymentDate: "2023-04-15T14:30:00",
    lastPaymentAmount: 200000.0,
    notes: "Legal advisory services",
  },
  {
    id: "9",
    name: "Training Academy",
    contactPerson: "Patricia Moore",
    email: "patricia@trainingacademy.com",
    phone: "+234 809 012 3456",
    address: "606 Education Street, Lagos",
    accountNumber: "7531902468",
    bankName: "Ecobank",
    taxId: "TAX75319",
    category: "education",
    status: "active",
    createdAt: "2023-02-20T13:45:00",
    lastPaymentDate: "2023-04-10T09:45:00",
    lastPaymentAmount: 65000.0,
    notes: "Staff training and development",
  },
  {
    id: "10",
    name: "Maintenance Services",
    contactPerson: "Thomas Clark",
    email: "thomas@maintenance.com",
    phone: "+234 810 123 4567",
    address: "707 Repair Road, Port Harcourt",
    accountNumber: "1472583690",
    bankName: "Union Bank",
    taxId: "TAX14725",
    category: "service",
    status: "inactive",
    createdAt: "2022-12-01T10:30:00",
    lastPaymentDate: "2023-02-15T13:15:00",
    lastPaymentAmount: 35000.0,
    notes: "Building maintenance - contract ended",
  },
]

// Category options for filtering
const categoryOptions = [
  { value: "supplier", label: "Supplier" },
  { value: "service", label: "Service" },
  { value: "logistics", label: "Logistics" },
  { value: "technology", label: "Technology" },
  { value: "marketing", label: "Marketing" },
  { value: "legal", label: "Legal" },
  { value: "education", label: "Education" },
]

// Status options for filtering
const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]

export function PayeeContent() {
  const [selectedPayee, setSelectedPayee] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  const handleAddPayee = () => {
    setIsEditMode(false)
    setIsFormOpen(true)
  }

  const handleEditPayee = (id: string) => {
    const payee = mockPayees.find((p) => p.id === id)
    if (payee) {
      setSelectedPayee(payee)
      setIsEditMode(true)
      setIsFormOpen(true)
    }
  }

  const handleViewPayee = (id: string) => {
    const payee = mockPayees.find((p) => p.id === id)
    if (payee) {
      setSelectedPayee(payee)
      setIsDetailsOpen(true)
    }
  }

  const handleDeletePayee = (id: string) => {
    console.log("Delete payee:", id)
    // Implement delete logic here
  }

  const handleSubmitPayee = async (data: Record<string, any>) => {
    console.log("Submit payee:", data)
    // Implement submit logic here
    return Promise.resolve()
  }

  const columns = [
    {
      key: "name",
      label: "Payee Name",
      sortable: true,
    },
    {
      key: "contactPerson",
      label: "Contact Person",
      sortable: true,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "phone",
      label: "Phone",
      sortable: true,
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      render: (value: string) => {
        const category = categoryOptions.find((c) => c.value === value)
        return category ? category.label : value
      },
    },
    {
      key: "lastPaymentAmount",
      label: "Last Payment",
      sortable: true,
      render: (value: number) => {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "NGN",
        }).format(value)
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              value === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
            }`}
          >
            {value === "active" ? "Active" : "Inactive"}
          </span>
        )
      },
    },
  ]

  const filterOptions = [
    {
      id: "category",
      label: "Category",
      type: "select" as const,
      options: categoryOptions,
    },
    {
      id: "status",
      label: "Status",
      type: "select" as const,
      options: statusOptions,
    },
    {
      id: "lastPaymentAmount",
      label: "Last Payment Amount",
      type: "number-range" as const,
      options: [],
    },
  ]

  const formFields = [
    {
      name: "name",
      label: "Payee Name",
      type: "text" as const,
      required: true,
      placeholder: "Enter payee name",
      width: "full" as const,
    },
    {
      name: "contactPerson",
      label: "Contact Person",
      type: "text" as const,
      required: true,
      placeholder: "Enter contact person name",
      width: "half" as const,
    },
    {
      name: "email",
      label: "Email",
      type: "email" as const,
      required: true,
      placeholder: "Enter email address",
      width: "half" as const,
    },
    {
      name: "phone",
      label: "Phone",
      type: "text" as const,
      required: true,
      placeholder: "Enter phone number",
      width: "half" as const,
    },
    {
      name: "address",
      label: "Address",
      type: "textarea" as const,
      required: true,
      placeholder: "Enter address",
      width: "half" as const,
    },
    {
      name: "accountNumber",
      label: "Account Number",
      type: "text" as const,
      required: true,
      placeholder: "Enter account number",
      width: "half" as const,
    },
    {
      name: "bankName",
      label: "Bank Name",
      type: "text" as const,
      required: true,
      placeholder: "Enter bank name",
      width: "half" as const,
    },
    {
      name: "taxId",
      label: "Tax ID",
      type: "text" as const,
      placeholder: "Enter tax ID",
      width: "half" as const,
    },
    {
      name: "category",
      label: "Category",
      type: "select" as const,
      required: true,
      options: categoryOptions,
      width: "half" as const,
    },
    {
      name: "status",
      label: "Status",
      type: "select" as const,
      required: true,
      options: statusOptions,
      width: "half" as const,
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea" as const,
      placeholder: "Enter additional notes",
      width: "full" as const,
    },
  ]

  const detailsFields = [
    {
      label: "Payee Name",
      key: "name",
    },
    {
      label: "Contact Person",
      key: "contactPerson",
    },
    {
      label: "Email",
      key: "email",
      type: "email",
    },
    {
      label: "Phone",
      key: "phone",
    },
    {
      label: "Address",
      key: "address",
    },
    {
      label: "Account Number",
      key: "accountNumber",
    },
    {
      label: "Bank Name",
      key: "bankName",
    },
    {
      label: "Tax ID",
      key: "taxId",
    },
    {
      label: "Category",
      key: "category",
      render: (value: string) => {
        const category = categoryOptions.find((c) => c.value === value)
        return category ? category.label : value
      },
    },
    {
      label: "Status",
      key: "status",
      type: "status",
      statusMap: {
        active: { label: "Active", variant: "default" },
        inactive: { label: "Inactive", variant: "secondary" },
      },
    },
    {
      label: "Created At",
      key: "createdAt",
      type: "date",
      format: "PPpp",
    },
    {
      label: "Last Payment Date",
      key: "lastPaymentDate",
      type: "date",
      format: "PPpp",
    },
    {
      label: "Last Payment Amount",
      key: "lastPaymentAmount",
      type: "currency",
    },
    {
      label: "Notes",
      key: "notes",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Payee Management</h1>
        <Button onClick={handleAddPayee} className="gap-1 bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4" />
          Add New Payee
        </Button>
      </div>

      <FinanceDataTable
        title="Payees"
        columns={columns}
        data={mockPayees}
        filterOptions={filterOptions}
        onAdd={handleAddPayee}
        onEdit={handleEditPayee}
        onDelete={handleDeletePayee}
        onView={handleViewPayee}
        currencySymbol="₦"
      />

      <FinanceFormDialog
        title={isEditMode ? "Edit Payee" : "Add New Payee"}
        fields={formFields}
        onSubmit={handleSubmitPayee}
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialValues={isEditMode ? selectedPayee : {}}
        currencySymbol="₦"
      />

      <FinanceDetailsDialog
        title="Payee Details"
        data={selectedPayee || {}}
        fields={detailsFields}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        actions={{
          edit: true,
          delete: true,
          print: true,
        }}
        onEdit={() => {
          setIsDetailsOpen(false)
          setIsEditMode(true)
          setIsFormOpen(true)
        }}
        onDelete={() => {
          setIsDetailsOpen(false)
          if (selectedPayee) {
            handleDeletePayee(selectedPayee.id)
          }
        }}
        onPrint={() => {
          window.print()
        }}
        currencySymbol="₦"
      />
    </div>
  )
}
