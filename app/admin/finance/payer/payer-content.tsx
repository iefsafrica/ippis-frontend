"use client"

import { useState } from "react"
import { FinanceDataTable } from "../components/finance-data-table"
import { FinanceFormDialog } from "../components/finance-form-dialog"
import { FinanceDetailsDialog } from "../components/finance-details-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { format } from "date-fns"

// Mock data for payers
const mockPayers = [
  {
    id: "1",
    name: "Federal Ministry of Education",
    contactPerson: "Dr. Adamu Ibrahim",
    email: "adamu.ibrahim@education.gov.ng",
    phone: "+234 801 234 5678",
    address: "Federal Secretariat Complex, Abuja",
    accountNumber: "1234567890",
    bankName: "Central Bank of Nigeria",
    taxId: "GOV12345",
    category: "government",
    status: "active",
    createdAt: "2023-01-15T10:30:00",
    lastPaymentDate: "2023-05-10T14:30:00",
    lastPaymentAmount: 2500000.0,
    notes: "Federal education funding",
  },
  {
    id: "2",
    name: "Lagos State Government",
    contactPerson: "Mrs. Folashade Adefisayo",
    email: "folashade.adefisayo@lasg.gov.ng",
    phone: "+234 802 345 6789",
    address: "Lagos State Secretariat, Alausa, Ikeja",
    accountNumber: "9876543210",
    bankName: "Access Bank",
    taxId: "GOV67890",
    category: "government",
    status: "active",
    createdAt: "2023-02-01T09:15:00",
    lastPaymentDate: "2023-05-05T11:45:00",
    lastPaymentAmount: 1750000.0,
    notes: "State education funding",
  },
  {
    id: "3",
    name: "Nigerian National Petroleum Corporation",
    contactPerson: "Mr. Mele Kyari",
    email: "mele.kyari@nnpc.gov.ng",
    phone: "+234 803 456 7890",
    address: "NNPC Towers, Central Business District, Abuja",
    accountNumber: "5678901234",
    bankName: "Zenith Bank",
    taxId: "GOV24680",
    category: "corporate",
    status: "active",
    createdAt: "2023-01-20T14:45:00",
    lastPaymentDate: "2023-04-28T16:20:00",
    lastPaymentAmount: 3200000.0,
    notes: "Corporate social responsibility funding",
  },
  {
    id: "4",
    name: "MTN Nigeria",
    contactPerson: "Mr. Karl Toriola",
    email: "karl.toriola@mtn.com",
    phone: "+234 804 567 8901",
    address: "MTN Plaza, Ikoyi, Lagos",
    accountNumber: "2468013579",
    bankName: "Guaranty Trust Bank",
    taxId: "CORP13579",
    category: "corporate",
    status: "active",
    createdAt: "2023-03-05T11:30:00",
    lastPaymentDate: "2023-05-02T09:15:00",
    lastPaymentAmount: 1500000.0,
    notes: "Telecommunications partner",
  },
  {
    id: "5",
    name: "Dangote Foundation",
    contactPerson: "Ms. Zouera Youssoufou",
    email: "zouera.youssoufou@dangote.com",
    phone: "+234 805 678 9012",
    address: "Dangote Industries Limited, Ikoyi, Lagos",
    accountNumber: "1357924680",
    bankName: "United Bank for Africa",
    taxId: "NGO97531",
    category: "ngo",
    status: "active",
    createdAt: "2023-02-15T13:20:00",
    lastPaymentDate: "2023-03-20T10:30:00",
    lastPaymentAmount: 5000000.0,
    notes: "Philanthropic organization",
  },
  {
    id: "6",
    name: "Bill & Melinda Gates Foundation",
    contactPerson: "Dr. Mairo Mandara",
    email: "mairo.mandara@gatesfoundation.org",
    phone: "+234 806 789 0123",
    address: "Transcorp Hilton, Abuja",
    accountNumber: "8642097531",
    bankName: "Standard Chartered",
    taxId: "NGO86420",
    category: "international",
    status: "active",
    createdAt: "2023-04-01T10:00:00",
    lastPaymentDate: "2023-04-25T15:45:00",
    lastPaymentAmount: 7500000.0,
    notes: "International development partner",
  },
  {
    id: "7",
    name: "United Nations Development Programme",
    contactPerson: "Mr. Mohamed Yahya",
    email: "mohamed.yahya@undp.org",
    phone: "+234 807 890 1234",
    address: "UN House, Diplomatic Zone, Abuja",
    accountNumber: "9753108642",
    bankName: "Citibank",
    taxId: "INT75319",
    category: "international",
    status: "active",
    createdAt: "2023-03-15T09:30:00",
    lastPaymentDate: "2023-05-01T11:00:00",
    lastPaymentAmount: 4500000.0,
    notes: "UN agency funding",
  },
  {
    id: "8",
    name: "World Bank Nigeria",
    contactPerson: "Mr. Shubham Chaudhuri",
    email: "schaudhuri@worldbank.org",
    phone: "+234 808 901 2345",
    address: "102 Yakubu Gowon Crescent, Asokoro, Abuja",
    accountNumber: "3691470258",
    bankName: "First Bank",
    taxId: "INT36914",
    category: "international",
    status: "active",
    createdAt: "2023-01-10T15:15:00",
    lastPaymentDate: "2023-04-15T14:30:00",
    lastPaymentAmount: 10000000.0,
    notes: "International financial institution",
  },
  {
    id: "9",
    name: "African Development Bank",
    contactPerson: "Dr. Akinwumi Adesina",
    email: "a.adesina@afdb.org",
    phone: "+234 809 012 3456",
    address: "Plot 813, Lake Chad Crescent, Maitama, Abuja",
    accountNumber: "7531902468",
    bankName: "Ecobank",
    taxId: "INT75319",
    category: "international",
    status: "active",
    createdAt: "2023-02-20T13:45:00",
    lastPaymentDate: "2023-04-10T09:45:00",
    lastPaymentAmount: 8500000.0,
    notes: "Regional development bank",
  },
  {
    id: "10",
    name: "Oando Foundation",
    contactPerson: "Ms. Adekanla Adegoke",
    email: "aadegoke@oandofoundation.org",
    phone: "+234 810 123 4567",
    address: "2 Ajose Adeogun Street, Victoria Island, Lagos",
    accountNumber: "1472583690",
    bankName: "Union Bank",
    taxId: "NGO14725",
    category: "ngo",
    status: "inactive",
    createdAt: "2022-12-01T10:30:00",
    lastPaymentDate: "2023-02-15T13:15:00",
    lastPaymentAmount: 1200000.0,
    notes: "Corporate foundation - currently inactive",
  },
]

// const [currentPage, setCurrentPage] = useState(1);
// const [itemsPerPage, setItemsPerPage] = useState(50); // default 50
// const indexOfLastItem = currentPage * itemsPerPage;
// const indexOfFirstItem = indexOfLastItem - itemsPerPage;
// const currentRows = mockPayers.slice(indexOfFirstItem, indexOfLastItem);
// const totalPages = Math.ceil(mockPayers.length / itemsPerPage);

// const handlePrev = () => {
//   setCurrentPage((prev) => Math.max(prev - 1, 1));
// };

// const handleNext = () => {
//   setCurrentPage((prev) => Math.min(prev + 1, totalPages));
// };


// Category options for filtering
const categoryOptions = [
  { value: "government", label: "Government" },
  { value: "corporate", label: "Corporate" },
  { value: "ngo", label: "NGO" },
  { value: "international", label: "International" },
]

// Status options for filtering
const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]

export function PayerContent() {
  const [selectedPayer, setSelectedPayer] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  const handleAddPayer = () => {
    setIsEditMode(false)
    setIsFormOpen(true)
  }

  const handleEditPayer = (id: string) => {
    const payer = mockPayers.find((p) => p.id === id)
    if (payer) {
      setSelectedPayer(payer)
      setIsEditMode(true)
      setIsFormOpen(true)
    }
  }

  const handleViewPayer = (id: string) => {
    const payer = mockPayers.find((p) => p.id === id)
    if (payer) {
      setSelectedPayer(payer)
      setIsDetailsOpen(true)
    }
  }

  const handleDeletePayer = (id: string) => {
    console.log("Delete payer:", id)
    // Implement delete logic here
  }

  const handleSubmitPayer = async (data: Record<string, any>) => {
    console.log("Submit payer:", data)
    // Implement submit logic here
    return Promise.resolve()
  }

  const columns = [
    {
      key: "name",
      label: "Payer Name",
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
      key: "lastPaymentDate",
      label: "Payment Date",
      sortable: true,
      render: (value: string) => {
        return format(new Date(value), "MMM d, yyyy")
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
      label: "Payer Name",
      type: "text" as const,
      required: true,
      placeholder: "Enter payer name",
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
      label: "Payer Name",
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
        <h1 className="text-2xl font-bold tracking-tight">Payer Management</h1>
        <Button
          onClick={handleAddPayer}
          className="gap-1 bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4" />
          Add New Payer
        </Button>
      </div>

      <FinanceDataTable
        title="Payers"
        columns={columns}
        data={mockPayers}
        filterOptions={filterOptions}
        onAdd={handleAddPayer}
        onEdit={handleEditPayer}
        onDelete={handleDeletePayer}
        onView={handleViewPayer}
        currencySymbol="₦"
        // currentRows={currentRows}
        // handleNext={handleNext}
        // handlePrev={handlePrev}
      />

      <FinanceFormDialog
        title={isEditMode ? "Edit Payer" : "Add New Payer"}
        fields={formFields}
        onSubmit={handleSubmitPayer}
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialValues={isEditMode ? selectedPayer : {}}
        currencySymbol="₦"
      />

      <FinanceDetailsDialog
        title="Payer Details"
        data={selectedPayer || {}}
        fields={detailsFields}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        actions={{
          edit: true,
          delete: true,
          print: true,
        }}
        onEdit={() => {
          setIsDetailsOpen(false);
          setIsEditMode(true);
          setIsFormOpen(true);
        }}
        onDelete={() => {
          setIsDetailsOpen(false);
          if (selectedPayer) {
            handleDeletePayer(selectedPayer.id);
          }
        }}
        onPrint={() => {
          window.print();
        }}
        currencySymbol="₦"
      />
    </div>
  );
}
