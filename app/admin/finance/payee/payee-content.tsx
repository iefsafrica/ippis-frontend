"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import { Building2, CreditCard, Search, Sparkles, Wallet } from "lucide-react"

import { useCreateFinancePayee, useDeleteFinancePayee, useGetFinancePayees, useUpdateFinancePayee } from "@/services/hooks/finance/payees"
import { FinanceCard } from "../components/finance-card"
import { FinanceDataTable } from "../components/finance-data-table"
import { FinanceDetailsDialog, type FinanceDetailsField } from "../components/finance-details-dialog"
import { FinanceFormDialog } from "../components/finance-form-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type PayeeUI = {
  id: string
  payee_id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  accountNumber: string
  bankName: string
  taxId?: string | null
  category: string
  status: string
  createdAt?: string
  updatedAt?: string
  lastPaymentDate?: string | null
  lastPaymentAmount?: number | null
  notes?: string | null
}

const categoryOptions = [
  { value: "supplier", label: "Supplier" },
  { value: "service", label: "Service" },
  { value: "logistics", label: "Logistics" },
  { value: "technology", label: "Technology" },
  { value: "marketing", label: "Marketing" },
  { value: "legal", label: "Legal" },
  { value: "education", label: "Education" },
]

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]

const payeeFields = [
  { name: "name", label: "Payee Name", type: "text" as const, required: true, placeholder: "Enter payee name", width: "full" as const },
  { name: "contactPerson", label: "Contact Person", type: "text" as const, required: true, placeholder: "Enter contact person name", width: "half" as const },
  { name: "email", label: "Email", type: "email" as const, required: true, placeholder: "Enter email address", width: "half" as const },
  { name: "phone", label: "Phone", type: "text" as const, required: true, placeholder: "Enter phone number", width: "half" as const },
  { name: "address", label: "Address", type: "textarea" as const, required: true, placeholder: "Enter address", width: "half" as const },
  { name: "accountNumber", label: "Account Number", type: "text" as const, required: true, placeholder: "Enter account number", width: "half" as const },
  { name: "bankName", label: "Bank Name", type: "text" as const, required: true, placeholder: "Enter bank name", width: "half" as const },
  { name: "taxId", label: "Tax ID", type: "text" as const, placeholder: "Enter tax ID", width: "half" as const },
  { name: "category", label: "Category", type: "select" as const, required: true, options: categoryOptions, width: "half" as const },
  { name: "status", label: "Status", type: "select" as const, required: true, options: statusOptions, width: "half" as const },
  { name: "notes", label: "Notes", type: "textarea" as const, placeholder: "Enter additional notes", width: "full" as const },
]

const detailsFields: FinanceDetailsField[] = [
  { label: "Payee Name", key: "name" },
  { label: "Contact Person", key: "contactPerson" },
  { label: "Email", key: "email", type: "email" },
  { label: "Phone", key: "phone" },
  { label: "Address", key: "address" },
  { label: "Account Number", key: "accountNumber" },
  { label: "Bank Name", key: "bankName" },
  { label: "Tax ID", key: "taxId" },
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
  { label: "Created At", key: "createdAt", type: "date", format: "PPpp" },
  { label: "Last Payment Date", key: "lastPaymentDate", type: "date", format: "PPpp" },
  { label: "Last Payment Amount", key: "lastPaymentAmount", type: "currency" },
  { label: "Notes", key: "notes" },
]

const initialForm = {
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
  accountNumber: "",
  bankName: "",
  taxId: "",
  category: "supplier",
  status: "active",
  notes: "",
}

const normalizePayee = (payee: any): PayeeUI => ({
  id: String(payee.id ?? payee.payee_id),
  payee_id: String(payee.payee_id ?? payee.id ?? ""),
  name: payee.payee_name ?? payee.name ?? "",
  contactPerson: payee.contact_person ?? payee.contactPerson ?? "",
  email: payee.email ?? "",
  phone: payee.phone ?? "",
  address: payee.address ?? "",
  accountNumber: payee.account_number ?? payee.accountNumber ?? "",
  bankName: payee.bank_name ?? payee.bankName ?? "",
  taxId: payee.tax_id ?? payee.taxId ?? null,
  category: String(payee.category ?? "supplier").toLowerCase(),
  status: String(payee.status ?? "active").toLowerCase(),
  createdAt: payee.created_at ?? payee.createdAt ?? undefined,
  updatedAt: payee.updated_at ?? payee.updatedAt ?? undefined,
  lastPaymentDate: payee.last_payment_date ?? payee.lastPaymentDate ?? null,
  lastPaymentAmount: payee.last_payment_amount ?? payee.lastPaymentAmount ?? null,
  notes: payee.notes ?? null,
})

export function PayeeContent() {
  const { data, isLoading, isFetching, isError, refetch } = useGetFinancePayees({
    sortBy: "created_at",
    order: "desc",
  })
  const createPayee = useCreateFinancePayee()
  const updatePayee = useUpdateFinancePayee()
  const deletePayee = useDeleteFinancePayee()

  const [selectedPayee, setSelectedPayee] = useState<PayeeUI | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  const payees = useMemo(() => (data?.data?.payees ?? []).map(normalizePayee), [data])

  useEffect(() => {
    if (isError) toast.error("Failed to load payees")
  }, [isError])

  const totalLastPayments = payees.reduce((sum, payee) => sum + Number(payee.lastPaymentAmount ?? 0), 0)
  const activePayees = payees.filter((payee) => payee.status === "active").length
  const uniqueBanks = new Set(payees.map((payee) => payee.bankName).filter(Boolean)).size

  const columns = [
    { key: "name", label: "Payee Name", sortable: true },
    { key: "contactPerson", label: "Contact Person", sortable: true },
    { key: "email", label: "Email", sortable: true },
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
      render: (value: number) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "NGN",
        }).format(Number(value ?? 0)),
    },
    {
      key: "lastPaymentDate",
      label: "Payment Date",
      sortable: true,
      render: (value: string) => (value ? format(new Date(value), "MMM d, yyyy") : "N/A"),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => (
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${value === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
          {value === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
  ]

  const handleAddPayee = () => {
    setSelectedPayee(null)
    setIsEditMode(false)
    setIsFormOpen(true)
  }

  const handleEditPayee = (id: string) => {
    const payee = payees.find((item) => item.id === id)
    if (payee) {
      setSelectedPayee(payee)
      setIsEditMode(true)
      setIsFormOpen(true)
    }
  }

  const handleViewPayee = (id: string) => {
    const payee = payees.find((item) => item.id === id)
    if (payee) {
      setSelectedPayee(payee)
      setIsDetailsOpen(true)
    }
  }

  const handleDeletePayee = async (payeeId: string) => {
    try {
      await deletePayee.mutateAsync(payeeId)
      toast.success("Payee deleted successfully")
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete payee")
    }
  }

  const handleSubmitPayee = async (formData: Record<string, any>) => {
    const payload = {
      payee_name: formData.name,
      contact_person: formData.contactPerson,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      account_number: formData.accountNumber,
      bank_name: formData.bankName,
      tax_id: formData.taxId || null,
      category: formData.category,
      status: formData.status,
      notes: formData.notes || null,
    }

    try {
      if (isEditMode && selectedPayee) {
        await updatePayee.mutateAsync({
          payee_id: selectedPayee.payee_id,
          ...payload,
        })
        toast.success("Payee updated successfully")
      } else {
        await createPayee.mutateAsync(payload)
        toast.success("Payee created successfully")
      }

      setIsFormOpen(false)
      setSelectedPayee(null)
    } catch (error: any) {
      toast.error(error?.message || "Submit failed")
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.28)] backdrop-blur">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Finance module
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Payees</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage payee records with a cleaner, premium interface and live React Query updates.
              </p>
            </div>
          </div>
          
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <FinanceCard title="Total Last Payments" value={totalLastPayments} isCurrency currencySymbol="₦" icon={<Wallet className="h-4 w-4 text-slate-500" />} isLoading={isLoading || isFetching} />
          <FinanceCard title="Active Payees" value={activePayees} icon={<CreditCard className="h-4 w-4 text-slate-500" />} description={`${activePayees} active`} isLoading={isLoading || isFetching} />
          <FinanceCard title="Banks" value={uniqueBanks} icon={<Building2 className="h-4 w-4 text-slate-500" />} description="Unique payment banks" isLoading={isLoading || isFetching} />
        </div>
      </div>

      {isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          We had trouble fetching payees.
          <Button variant="outline" onClick={() => refetch()} className="ml-3 rounded-xl border-red-200 bg-white">
            Retry
          </Button>
        </div>
      ) : null}

      <Card className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.26)]">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Payee registry</h2>
              <p className="text-sm text-slate-500">Browse, filter, and manage payee accounts.</p>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">Use the table search and filters for quick lookup</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <FinanceDataTable
            title="Payees"
            description="Premium payee management table"
            data={payees}
            filterOptions={[]}
            columns={columns}
            onAdd={handleAddPayee}
            onEdit={handleEditPayee}
            onView={handleViewPayee}
            onDelete={(id) => handleDeletePayee(payees.find((item) => item.id === id)?.payee_id ?? id)}
            currencySymbol="₦"
            isLoading={isLoading || isFetching}
          />
        </div>
      </Card>

      <FinanceFormDialog
        title={isEditMode ? "Edit Payee" : "New Payee"}
        fields={payeeFields}
        initialValues={
          isEditMode && selectedPayee
            ? {
                name: selectedPayee.name,
                contactPerson: selectedPayee.contactPerson,
                email: selectedPayee.email,
                phone: selectedPayee.phone,
                address: selectedPayee.address,
                accountNumber: selectedPayee.accountNumber,
                bankName: selectedPayee.bankName,
                taxId: selectedPayee.taxId ?? "",
                category: selectedPayee.category,
                status: selectedPayee.status,
                notes: selectedPayee.notes ?? "",
              }
            : initialForm
        }
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmitPayee}
        currencySymbol="₦"
      />

      <FinanceDetailsDialog
        title="Payee Details"
        data={selectedPayee || {}}
        fields={detailsFields}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onEdit={() => {
          setIsDetailsOpen(false)
          if (selectedPayee) {
            setIsEditMode(true)
            setIsFormOpen(true)
          }
        }}
        onDelete={() => {
          setIsDetailsOpen(false)
          if (selectedPayee) {
            handleDeletePayee(selectedPayee.payee_id)
          }
        }}
       
      />
    </div>
  )
}
