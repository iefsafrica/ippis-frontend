
"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import { Building2, CreditCard, Search, Plus, Sparkles, Wallet } from "lucide-react"

import { useCreateFinancePayer, useDeleteFinancePayer, useGetFinancePayers, useUpdateFinancePayer } from "@/services/hooks/finance/payers"
import { FinanceCard } from "../components/finance-card"
import { FinanceDataTable } from "../components/finance-data-table"
import { FinanceDetailsDialog, type FinanceDetailsField } from "../components/finance-details-dialog"
import { FinanceFormDialog } from "../components/finance-form-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type PayerUI = {
  id: string
  payer_id: string
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
  created_at?: string
  createdAt?: string
  updatedAt?: string
  lastPaymentDate?: string | null
  lastPaymentAmount?: number | null
  notes?: string | null
}

const categoryOptions = [
  { value: "government", label: "Government" },
  { value: "corporate", label: "Corporate" },
  { value: "ngo", label: "NGO" },
  { value: "international", label: "International" },
]

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]

const payerFields = [
  { name: "name", label: "Payer Name", type: "text" as const, required: true, placeholder: "Enter payer name", width: "full" as const },
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
  { label: "Payer Name", key: "name" },
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
  { label: "Created At", key: "created_at", type: "date", format: "PPpp" },
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
  category: "government",
  status: "active",
  notes: "",
}

const normalizePayer = (payer: any): PayerUI => ({
  id: String(payer.id ?? payer.payer_id),
  payer_id: String(payer.payer_id ?? payer.id ?? ""),
  name: payer.payer_name ?? payer.name ?? "",
  contactPerson: payer.contact_person ?? payer.contactPerson ?? "",
  email: payer.email ?? "",
  phone: payer.phone ?? "",
  address: payer.address ?? "",
  accountNumber: payer.account_number ?? payer.accountNumber ?? "",
  bankName: payer.bank_name ?? payer.bankName ?? "",
  taxId: payer.tax_id ?? payer.taxId ?? null,
  category: String(payer.category ?? "government").toLowerCase(),
  status: String(payer.status ?? "active").toLowerCase(),
  created_at: payer.created_at ?? undefined,
  createdAt: payer.created_at ?? payer.createdAt ?? undefined,
  updatedAt: payer.updated_at ?? payer.updatedAt ?? undefined,
  lastPaymentDate: payer.last_payment_date ?? payer.lastPaymentDate ?? null,
  lastPaymentAmount: payer.last_payment_amount ?? payer.lastPaymentAmount ?? null,
  notes: payer.notes ?? null,
})

export function PayerContent() {
  const { data, isLoading, isFetching, isError, refetch } = useGetFinancePayers({
    order: "desc",
  })
  const createPayer = useCreateFinancePayer()
  const updatePayer = useUpdateFinancePayer()
  const deletePayer = useDeleteFinancePayer()

  const [selectedPayer, setSelectedPayer] = useState<PayerUI | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  const payers = useMemo(() => (data?.data?.payers ?? []).map(normalizePayer), [data])

  useEffect(() => {
    if (isError) toast.error("Failed to load payers")
  }, [isError])

  const totalLastPayments = payers.reduce((sum, payer) => sum + Number(payer.lastPaymentAmount ?? 0), 0)
  const activePayers = payers.filter((payer) => payer.status === "active").length
  const uniqueBanks = new Set(payers.map((payer) => payer.bankName).filter(Boolean)).size

  const columns = [
    { key: "name", label: "Payer Name", sortable: true },
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
      key: "createdAt",
      label: "Created Date",
      sortable: true,
      render: (value: string) => (value ? format(new Date(value), "MMM d, yyyy") : "N/A"),
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

  const handleAddPayer = () => {
    setSelectedPayer(null)
    setIsEditMode(false)
    setIsFormOpen(true)
  }

  const handleEditPayer = (id: string) => {
    const payer = payers.find((item) => item.id === id)
    if (payer) {
      setSelectedPayer(payer)
      setIsEditMode(true)
      setIsFormOpen(true)
    }
  }

  const handleViewPayer = (id: string) => {
    const payer = payers.find((item) => item.id === id)
    if (payer) {
      setSelectedPayer(payer)
      setIsDetailsOpen(true)
    }
  }

  const handleDeletePayer = async (payerId: string) => {
    try {
      await deletePayer.mutateAsync(payerId)
      toast.success("Payer deleted successfully")
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete payer")
    }
  }

  const handleSubmitPayer = async (formData: Record<string, any>) => {
    const currentDate = new Date().toISOString()
    
    const payload = {
      payer_name: formData.name,
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
      created_at: currentDate,
      updated_at: currentDate,
    }

    try {
      if (isEditMode && selectedPayer) {
        await updatePayer.mutateAsync({
          payer_id: selectedPayer.payer_id,
          ...payload,
        })
        toast.success("Payer updated successfully")
      } else {
        await createPayer.mutateAsync(payload)
        toast.success("Payer created successfully")
      }

      setIsFormOpen(false)
      setSelectedPayer(null)
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
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Payers</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage payer records with a cleaner, premium interface and live React Query updates.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <FinanceCard title="Total Last Payments" value={totalLastPayments} isCurrency currencySymbol="₦" icon={<Wallet className="h-4 w-4 text-slate-500" />} isLoading={isLoading || isFetching} />
          <FinanceCard title="Active Payers" value={activePayers} icon={<CreditCard className="h-4 w-4 text-slate-500" />} description={`${activePayers} active`} isLoading={isLoading || isFetching} />
          <FinanceCard title="Banks" value={uniqueBanks} icon={<Building2 className="h-4 w-4 text-slate-500" />} description="Unique payment banks" isLoading={isLoading || isFetching} />
        </div>
      </div>

      {isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          We had trouble fetching payers.
          <Button variant="outline" onClick={() => refetch()} className="ml-3 rounded-xl border-red-200 bg-white">
            Retry
          </Button>
        </div>
      ) : null}

      <Card className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.26)]">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Payer registry</h2>
              <p className="text-sm text-slate-500">Browse, filter, and manage payer accounts.</p>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">Use the table search and filters for quick lookup</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <FinanceDataTable
            title="Payers"
            description="Premium payer management table"
            data={payers}
            filterOptions={[]}
            columns={columns}
            onAdd={handleAddPayer}
            onEdit={handleEditPayer}
            onView={handleViewPayer}
            onDelete={(id) => handleDeletePayer(payers.find((item) => item.id === id)?.payer_id ?? id)}
            currencySymbol="₦"
            isLoading={isLoading || isFetching}
          />
        </div>
      </Card>

      <FinanceFormDialog
        title={isEditMode ? "Edit Payer" : "New Payer"}
        fields={payerFields}
        initialValues={
          isEditMode && selectedPayer
            ? {
                name: selectedPayer.name,
                contactPerson: selectedPayer.contactPerson,
                email: selectedPayer.email,
                phone: selectedPayer.phone,
                address: selectedPayer.address,
                accountNumber: selectedPayer.accountNumber,
                bankName: selectedPayer.bankName,
                taxId: selectedPayer.taxId ?? "",
                category: selectedPayer.category,
                status: selectedPayer.status,
                notes: selectedPayer.notes ?? "",
              }
            : initialForm
        }
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmitPayer}
        currencySymbol="₦"
      />

      <FinanceDetailsDialog
        title="Payer Details"
        data={selectedPayer || {}}
        fields={detailsFields}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onEdit={() => {
          setIsDetailsOpen(false)
          if (selectedPayer) {
            setIsEditMode(true)
            setIsFormOpen(true)
          }
        }}
        onDelete={() => {
          setIsDetailsOpen(false)
          if (selectedPayer) {
            handleDeletePayer(selectedPayer.payer_id)
          }
        }}
      />
    </div>
  )
}