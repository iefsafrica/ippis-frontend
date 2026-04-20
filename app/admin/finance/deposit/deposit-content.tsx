"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { Building2, CreditCard, RefreshCw, Search, Sparkles, Wallet } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FinanceCard } from "../components/finance-card"
import { FinanceDataTable } from "../components/finance-data-table"
import { FinanceDetailsDialog, type FinanceDetailsField } from "../components/finance-details-dialog"
import { FinanceFormDialog } from "../components/finance-form-dialog"
import {
  useCreateFinanceDeposit,
  useDeleteFinanceDeposit,
  useGetFinanceDeposit,
  useGetFinanceDeposits,
  useUpdateFinanceDeposit,
} from "@/services/hooks/finance/deposits"

type DepositUI = {
  id: string
  deposit_id: string
  accountId: string
  accountName: string
  payerId: string
  payerName: string
  amount: number
  paymentMethod: string
  category: string
  reference: string
  description?: string | null
  status: string
  createdAt?: string
  updatedAt?: string
}

const categoryOptions = [
  { value: "Government Funding", label: "Government Funding" },
  { value: "Education Grant Payment", label: "Education Grant Payment" },
  { value: "Operational Funding", label: "Operational Funding" },
  { value: "Capital Expenditure", label: "Capital Expenditure" },
  { value: "Project Funding", label: "Project Funding" },
  { value: "Updated Revenue", label: "Updated Revenue" },
]

const paymentMethodOptions = [
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "Direct Deposit", label: "Direct Deposit" },
  { value: "Cash", label: "Cash" },
  { value: "Card", label: "Card" },
]

const resolveCategory = (value?: string | null) => {
  const normalized = String(value ?? "").trim().toLowerCase()
  return categoryOptions.find((item) => item.value.toLowerCase() === normalized)?.value || categoryOptions[0].value
}

const editFields = [
  { name: "amount", label: "Amount", type: "currency" as const, required: true, placeholder: "Enter amount", width: "half" as const, currencySymbol: "₦" },
  { name: "category", label: "Category", type: "select" as const, required: true, options: categoryOptions, width: "half" as const },
]

const createFields = [
  { name: "account_id", label: "Account ID", type: "text" as const, required: true, placeholder: "Enter account ID", width: "half" as const },
  { name: "payer_id", label: "Payer ID", type: "text" as const, required: true, placeholder: "Enter payer ID", width: "half" as const },
  { name: "amount", label: "Amount", type: "currency" as const, required: true, placeholder: "Enter amount", width: "half" as const, currencySymbol: "₦" },
  { name: "payment_method", label: "Payment Method", type: "select" as const, required: true, options: paymentMethodOptions, width: "half" as const },
  { name: "category", label: "Category", type: "select" as const, required: true, options: categoryOptions, width: "half" as const },
  { name: "date", label: "Date", type: "date" as const, required: true, width: "half" as const },
  { name: "description", label: "Description", type: "textarea" as const, placeholder: "Enter deposit description", width: "full" as const },
]

const detailsFields: FinanceDetailsField[] = [
  { label: "Deposit ID", key: "deposit_id", type: "reference" },
  { label: "Reference", key: "reference", type: "reference" },
  { label: "Account", key: "accountName" },
  { label: "Account ID", key: "accountId" },
  { label: "Payer", key: "payerName" },
  { label: "Payer ID", key: "payerId" },
  { label: "Payment Method", key: "paymentMethod" },
  {
    label: "Category",
    key: "category",
    render: (value: string) => {
      const category = categoryOptions.find((item) => item.value.toLowerCase() === String(value ?? "").toLowerCase())
      return category ? category.label : value
    },
  },
  { label: "Amount", key: "amount", type: "currency", currencySymbol: "₦" },
  {
    label: "Status",
    key: "status",
    type: "status",
    statusMap: {
      completed: { label: "Completed", variant: "default" },
      pending: { label: "Pending", variant: "secondary" },
      failed: { label: "Failed", variant: "destructive" },
      reversed: { label: "Reversed", variant: "outline" },
    },
  },
  { label: "Created At", key: "createdAt", type: "date", format: "PPpp" },
  { label: "Updated At", key: "updatedAt", type: "date", format: "PPpp" },
  { label: "Description", key: "description" },
]

const normalizeDeposit = (deposit: any): DepositUI => ({
  id: String(deposit.id ?? deposit.deposit_id),
  deposit_id: String(deposit.deposit_id ?? deposit.id ?? ""),
  accountId: deposit.account_id ?? deposit.accountId ?? "",
  accountName: deposit.account_name ?? deposit.accountName ?? deposit.account_id ?? "",
  payerId: deposit.payer_id ?? deposit.payerId ?? "",
  payerName: deposit.payer_name ?? deposit.payerName ?? deposit.payer_id ?? "",
  amount: Number(deposit.amount ?? 0),
  paymentMethod: deposit.payment_method ?? deposit.paymentMethod ?? "",
  category: resolveCategory(deposit.category),
  reference: deposit.reference ?? "",
  description: deposit.description ?? null,
  status: String(deposit.status ?? "pending").toLowerCase(),
  createdAt: deposit.created_at ?? deposit.createdAt ?? undefined,
  updatedAt: deposit.updated_at ?? deposit.updatedAt ?? undefined,
})

export function DepositContent() {
  const { data, isLoading, isFetching, isError, refetch } = useGetFinanceDeposits()
  const createDeposit = useCreateFinanceDeposit()
  const updateDeposit = useUpdateFinanceDeposit()
  const deleteDeposit = useDeleteFinanceDeposit()

  const [selectedDeposit, setSelectedDeposit] = useState<DepositUI | null>(null)
  const [selectedDepositId, setSelectedDepositId] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const deposits = useMemo(() => (data?.data?.deposits ?? []).map(normalizeDeposit), [data])
  const selectedDepositDetailsQuery = useGetFinanceDeposit(selectedDepositId ?? undefined, isDetailsOpen || isEditOpen)
  const selectedDepositDetails = selectedDepositDetailsQuery.data?.data
    ? normalizeDeposit(selectedDepositDetailsQuery.data.data)
    : selectedDeposit

  useEffect(() => {
    if (isError) toast.error("Failed to load deposits")
  }, [isError])

  useEffect(() => {
    if (selectedDepositDetailsQuery.isError && selectedDepositId) {
      toast.error("Failed to load deposit details")
    }
  }, [selectedDepositDetailsQuery.isError, selectedDepositId])

  const totalAmount = deposits.reduce((sum, deposit) => sum + Number(deposit.amount ?? 0), 0)
  const completedDeposits = deposits.filter((deposit) => deposit.status === "completed").length
  const uniqueAccounts = new Set(deposits.map((deposit) => deposit.accountId).filter(Boolean)).size

  const columns = [
    { key: "reference", label: "Reference", sortable: true },
    { key: "accountName", label: "Account", sortable: true },
    { key: "payerName", label: "Payer", sortable: true },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (value: number) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "NGN",
        }).format(Number(value ?? 0)),
    },
    {
      key: "paymentMethod",
      label: "Method",
      sortable: true,
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      render: (value: string) => {
        const category = categoryOptions.find((item) => item.value.toLowerCase() === String(value ?? "").toLowerCase())
        return category ? category.label : value
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => (
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${value === "completed" ? "bg-green-100 text-green-800" : value === "pending" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`}>
          {value ? value.charAt(0).toUpperCase() + value.slice(1) : "Unknown"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (value: string) => (value ? format(new Date(value), "MMM d, yyyy") : "N/A"),
    },
  ]

  const handleViewDeposit = (id: string) => {
    const deposit = deposits.find((item) => item.id === id)
    if (!deposit) return

    setSelectedDeposit(deposit)
    setSelectedDepositId(deposit.deposit_id)
    setIsDetailsOpen(true)
  }

  const handleEditDeposit = (id: string) => {
    const deposit = deposits.find((item) => item.id === id)
    if (!deposit) return

    setSelectedDeposit(deposit)
    setSelectedDepositId(deposit.deposit_id)
    setIsEditOpen(true)
  }

  const handleDeleteDeposit = async (depositId: string) => {
    try {
      await deleteDeposit.mutateAsync(depositId)
      toast.success("Deposit deleted successfully")
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete deposit")
    }
  }

  const handleDetailsOpenChange = (open: boolean) => {
    setIsDetailsOpen(open)
    if (!open) {
      setSelectedDepositId(null)
    }
  }

  const handleEditOpenChange = (open: boolean) => {
    setIsEditOpen(open)
    if (!open) {
      setSelectedDepositId(null)
    }
  }

  const handleCreateOpenChange = (open: boolean) => {
    setIsCreateOpen(open)
  }

  const handleAddDeposit = () => {
    setSelectedDeposit(null)
    setSelectedDepositId(null)
    setIsCreateOpen(true)
  }

  const handleSubmitDeposit = async (formData: Record<string, any>) => {
    if (!selectedDeposit) {
      toast.error("No deposit selected")
      return
    }

    try {
      await updateDeposit.mutateAsync({
        deposit_id: selectedDeposit.deposit_id,
        amount: Number(formData.amount),
        category: formData.category,
      })
      toast.success("Deposit updated successfully")
      setIsEditOpen(false)
      setSelectedDeposit(null)
      setSelectedDepositId(null)
    } catch (error: any) {
      toast.error(error?.message || "Update failed")
    }
  }

  const handleSubmitCreateDeposit = async (formData: Record<string, any>) => {
    try {
      await createDeposit.mutateAsync({
        account_id: String(formData.account_id ?? "").trim(),
        payer_id: String(formData.payer_id ?? "").trim(),
        amount: Number(formData.amount ?? 0),
        payment_method: String(formData.payment_method ?? "").trim(),
        category: String(formData.category ?? "").trim(),
        date: String(formData.date ?? "").slice(0, 10),
        description: formData.description ? String(formData.description).trim() : null,
      })
      toast.success("Deposit created successfully")
      setIsCreateOpen(false)
    } catch (error: any) {
      toast.error(error?.message || "Create failed")
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
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Deposits</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Review deposit records with live React Query updates, details lookup, edits, and deletes.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => refetch()}
            className="w-full gap-2 rounded-2xl border-slate-200 bg-white text-slate-700 shadow-sm xl:w-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <FinanceCard
            title="Total Deposits"
            value={totalAmount}
            isCurrency
            currencySymbol="₦"
            icon={<Wallet className="h-4 w-4 text-slate-500" />}
            isLoading={isLoading || isFetching}
          />
          <FinanceCard
            title="Completed"
            value={completedDeposits}
            icon={<CreditCard className="h-4 w-4 text-slate-500" />}
            description={`${completedDeposits} completed deposits`}
            isLoading={isLoading || isFetching}
          />
          <FinanceCard
            title="Accounts"
            value={uniqueAccounts}
            icon={<Building2 className="h-4 w-4 text-slate-500" />}
            description="Unique deposit accounts"
            isLoading={isLoading || isFetching}
          />
        </div>
      </div>

      {isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          We had trouble fetching deposits.
          <Button variant="outline" onClick={() => refetch()} className="ml-3 rounded-xl border-red-200 bg-white">
            Retry
          </Button>
        </div>
      ) : null}

      <Card className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.26)]">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Deposit registry</h2>
              <p className="text-sm text-slate-500">Browse, filter, and manage deposit entries.</p>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">Use the table search and filters for quick lookup</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <FinanceDataTable
            title="Deposits"
            description="Premium deposit management table"
            data={deposits}
            filterOptions={[]}
            columns={columns}
            onAdd={handleAddDeposit}
            onEdit={handleEditDeposit}
            onView={handleViewDeposit}
            onDelete={(id) => handleDeleteDeposit(deposits.find((item) => item.id === id)?.deposit_id ?? id)}
            currencySymbol="₦"
            isLoading={isLoading || isFetching}
          />
        </div>
      </Card>

      <FinanceFormDialog
        title="New Deposit"
        fields={createFields}
        initialValues={{
          account_id: "",
          payer_id: "",
          amount: "",
          payment_method: paymentMethodOptions[0].value,
          category: categoryOptions[0].value,
          date: new Date().toISOString().slice(0, 10),
          description: "",
        }}
        isOpen={isCreateOpen}
        onOpenChange={handleCreateOpenChange}
        onSubmit={handleSubmitCreateDeposit}
        submitLabel="Save Deposit"
        currencySymbol="₦"
      />

      <FinanceFormDialog
        title="Edit Deposit"
        fields={editFields}
        initialValues={
          selectedDeposit
            ? {
                amount: String(selectedDeposit.amount ?? ""),
                category: selectedDeposit.category,
              }
            : {
                amount: "",
                category: categoryOptions[0].value,
              }
        }
        isOpen={isEditOpen}
        onOpenChange={handleEditOpenChange}
        onSubmit={handleSubmitDeposit}
        submitLabel="Update Deposit"
        currencySymbol="₦"
      />

      <FinanceDetailsDialog
        title="Deposit Details"
        data={selectedDepositDetails || {}}
        fields={detailsFields}
        isOpen={isDetailsOpen}
        onOpenChange={handleDetailsOpenChange}
        currencySymbol="₦"
      />
    </div>
  )
}
