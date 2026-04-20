"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { Building2, CreditCard, RefreshCw, Search, Sparkles, Wallet } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useGetFinanceAccounts } from "@/services/hooks/finance/accounts"
import {
  useCreateFinanceTransfer,
  useDeleteFinanceTransfer,
  useGetFinanceTransfer,
  useGetFinanceTransfers,
  useUpdateFinanceTransfer,
} from "@/services/hooks/finance/transfers"
import { FinanceCard } from "../components/finance-card"
import { FinanceDataTable } from "../components/finance-data-table"
import { FinanceDetailsDialog, type FinanceDetailsField } from "../components/finance-details-dialog"
import { FinanceFormDialog } from "../components/finance-form-dialog"

type TransferUI = {
  id: string
  transfer_id: string
  fromAccountId: string
  fromAccountName: string
  toAccountId: string
  toAccountName: string
  amount: number
  fees: number
  paymentMode: string
  referenceNo: string
  description?: string | null
  status: string
  date?: string
  createdAt?: string
  updatedAt?: string
}

const paymentModeOptions = [
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "Cash", label: "Cash" },
  { value: "Cheque", label: "Cheque" },
  { value: "Online Payment", label: "Online Payment" },
  { value: "Direct Debit", label: "Direct Debit" },
]

const statusOptions = [
  { value: "Completed", label: "Completed" },
  { value: "Pending", label: "Pending" },
  { value: "Failed", label: "Failed" },
  { value: "Reversed", label: "Reversed" },
]

const resolvePaymentMode = (value?: string | null) => {
  const normalized = String(value ?? "Bank Transfer").trim().toLowerCase()
  return paymentModeOptions.find((item) => item.value.toLowerCase() === normalized)?.value || paymentModeOptions[0].value
}

const resolveStatus = (value?: string | null) => {
  const normalized = String(value ?? "Completed").trim().toLowerCase()
  return statusOptions.find((item) => item.value.toLowerCase() === normalized)?.value || "Completed"
}

const normalizeAccountOptions = (accounts: any[] = []) =>
  accounts.map((account) => ({
    value: String(account.account_id ?? account.id ?? ""),
    label: String(account.account_name ?? account.accountName ?? account.account_id ?? ""),
  }))

const buildCreateFields = (accountOptions: { label: string; value: string }[]) => [
  {
    name: "from_account_id",
    label: "From Account",
    type: "select" as const,
    required: true,
    options: accountOptions,
    width: "half" as const,
    placeholder: "Select source account",
  },
  {
    name: "to_account_id",
    label: "To Account",
    type: "select" as const,
    required: true,
    options: accountOptions,
    width: "half" as const,
    placeholder: "Select destination account",
  },
  { name: "amount", label: "Amount", type: "currency" as const, required: true, placeholder: "Enter amount", width: "half" as const, currencySymbol: "₦" },
  { name: "fees", label: "Fees", type: "currency" as const, required: true, placeholder: "Enter fees", width: "half" as const, currencySymbol: "₦" },
  { name: "payment_mode", label: "Payment Mode", type: "select" as const, required: true, options: paymentModeOptions, width: "half" as const },
  { name: "reference_no", label: "Reference No", type: "text" as const, required: true, placeholder: "Enter reference number", width: "half" as const },
  { name: "description", label: "Description", type: "textarea" as const, placeholder: "Enter transfer description", width: "full" as const },
]

const editFields = [
  { name: "amount", label: "Amount", type: "currency" as const, required: true, placeholder: "Enter amount", width: "half" as const, currencySymbol: "₦" },
  { name: "fees", label: "Fees", type: "currency" as const, required: true, placeholder: "Enter fees", width: "half" as const, currencySymbol: "₦" },
  { name: "description", label: "Description", type: "textarea" as const, placeholder: "Enter transfer description", width: "full" as const },
]

const detailsFields: FinanceDetailsField[] = [
  { label: "Transfer ID", key: "transfer_id", type: "reference" },
  { label: "Reference No", key: "referenceNo", type: "reference" },
  { label: "From Account", key: "fromAccountName" },
  { label: "From Account ID", key: "fromAccountId" },
  { label: "To Account", key: "toAccountName" },
  { label: "To Account ID", key: "toAccountId" },
  { label: "Payment Mode", key: "paymentMode" },
  { label: "Amount", key: "amount", type: "currency", currencySymbol: "₦" },
  { label: "Fees", key: "fees", type: "currency", currencySymbol: "₦" },
  {
    label: "Status",
    key: "status",
    type: "status",
    statusMap: {
      Completed: { label: "Completed", variant: "default" },
      Pending: { label: "Pending", variant: "secondary" },
      Failed: { label: "Failed", variant: "destructive" },
      Reversed: { label: "Reversed", variant: "outline" },
    },
  },
  { label: "Date", key: "date", type: "date", format: "PP" },
  { label: "Created At", key: "createdAt", type: "date", format: "PPpp" },
  { label: "Updated At", key: "updatedAt", type: "date", format: "PPpp" },
  { label: "Description", key: "description" },
]

const normalizeTransfer = (transfer: any): TransferUI => ({
  id: String(transfer.id ?? transfer.transfer_id),
  transfer_id: String(transfer.transfer_id ?? transfer.id ?? ""),
  fromAccountId: String(transfer.from_account_id ?? transfer.fromAccountId ?? ""),
  fromAccountName: String(transfer.from_account_name ?? transfer.fromAccountName ?? transfer.from_account_id ?? ""),
  toAccountId: String(transfer.to_account_id ?? transfer.toAccountId ?? ""),
  toAccountName: String(transfer.to_account_name ?? transfer.toAccountName ?? transfer.to_account_id ?? ""),
  amount: Number(transfer.amount ?? 0),
  fees: Number(transfer.fees ?? 0),
  paymentMode: resolvePaymentMode(transfer.payment_mode ?? transfer.paymentMode),
  referenceNo: String(transfer.reference_no ?? transfer.referenceNo ?? ""),
  description: transfer.description ?? null,
  status: resolveStatus(transfer.status),
  date: transfer.date ?? transfer.created_at ?? transfer.createdAt ?? undefined,
  createdAt: transfer.created_at ?? transfer.createdAt ?? undefined,
  updatedAt: transfer.updated_at ?? transfer.updatedAt ?? undefined,
})

export function TransferContent() {
  const { data, isLoading, isFetching, isError, refetch } = useGetFinanceTransfers()
  const { data: accountsData } = useGetFinanceAccounts()
  const createTransfer = useCreateFinanceTransfer()
  const updateTransfer = useUpdateFinanceTransfer()
  const deleteTransfer = useDeleteFinanceTransfer()

  const [selectedTransfer, setSelectedTransfer] = useState<TransferUI | null>(null)
  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const transfers = useMemo(() => (data?.data?.transfers ?? []).map(normalizeTransfer), [data])
  const selectedTransferDetailsQuery = useGetFinanceTransfer(selectedTransferId ?? undefined, isDetailsOpen || isEditOpen)
  const selectedTransferDetails = selectedTransferDetailsQuery.data?.data
    ? normalizeTransfer(selectedTransferDetailsQuery.data.data)
    : selectedTransfer

  const accountOptions = useMemo(() => normalizeAccountOptions(accountsData?.data?.accounts ?? []), [accountsData])
  const createFields = useMemo(() => buildCreateFields(accountOptions), [accountOptions])

  useEffect(() => {
    if (isError) toast.error("Failed to load transfers")
  }, [isError])

  useEffect(() => {
    if (selectedTransferDetailsQuery.isError && selectedTransferId) {
      toast.error("Failed to load transfer details")
    }
  }, [selectedTransferDetailsQuery.isError, selectedTransferId])

  const totalAmount = transfers.reduce((sum, transfer) => sum + Number(transfer.amount ?? 0), 0)
  const totalFees = transfers.reduce((sum, transfer) => sum + Number(transfer.fees ?? 0), 0)
  const completedTransfers = transfers.filter((transfer) => transfer.status === "Completed").length

  const columns = [
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (value: string) => (value ? format(new Date(value), "MMM d, yyyy") : "N/A"),
    },
    { key: "fromAccountName", label: "From Account", sortable: true },
    { key: "toAccountName", label: "To Account", sortable: true },
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
      key: "fees",
      label: "Fees",
      sortable: true,
      render: (value: number) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "NGN",
        }).format(Number(value ?? 0)),
    },
    { key: "paymentMode", label: "Payment Mode", sortable: true },
    { key: "referenceNo", label: "Reference No", sortable: true },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            value === "Completed"
              ? "bg-green-100 text-green-800"
              : value === "Pending"
                ? "bg-amber-100 text-amber-800"
                : value === "Failed"
                  ? "bg-red-100 text-red-800"
                  : "bg-slate-100 text-slate-700"
          }`}
        >
          {value}
        </span>
      ),
    },
  ]

  const handleViewTransfer = (id: string) => {
    const transfer = transfers.find((item) => item.id === id)
    if (!transfer) return

    setSelectedTransfer(transfer)
    setSelectedTransferId(transfer.transfer_id)
    setIsDetailsOpen(true)
  }

  const handleEditTransfer = (id: string) => {
    const transfer = transfers.find((item) => item.id === id)
    if (!transfer) return

    setSelectedTransfer(transfer)
    setSelectedTransferId(transfer.transfer_id)
    setIsEditOpen(true)
  }

  const handleDeleteTransfer = async (transferId: string) => {
    try {
      await deleteTransfer.mutateAsync(transferId)
      toast.success("Transfer deleted successfully")
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete transfer")
    }
  }

  const handleDetailsOpenChange = (open: boolean) => {
    setIsDetailsOpen(open)
    if (!open) {
      setSelectedTransferId(null)
    }
  }

  const handleEditOpenChange = (open: boolean) => {
    setIsEditOpen(open)
    if (!open) {
      setSelectedTransferId(null)
    }
  }

  const handleCreateOpenChange = (open: boolean) => {
    setIsCreateOpen(open)
  }

  const handleAddTransfer = () => {
    setSelectedTransfer(null)
    setSelectedTransferId(null)
    setIsCreateOpen(true)
  }

  const handleSubmitTransfer = async (formData: Record<string, any>) => {
    if (!selectedTransfer) {
      toast.error("No transfer selected")
      return
    }

    try {
      await updateTransfer.mutateAsync({
        transfer_id: selectedTransfer.transfer_id,
        amount: Number(formData.amount),
        fees: Number(formData.fees),
        description: formData.description ? String(formData.description).trim() : null,
      })
      toast.success("Transfer updated successfully")
      setIsEditOpen(false)
      setSelectedTransfer(null)
      setSelectedTransferId(null)
    } catch (error: any) {
      toast.error(error?.message || "Update failed")
    }
  }

  const handleSubmitCreateTransfer = async (formData: Record<string, any>) => {
    try {
      await createTransfer.mutateAsync({
        from_account_id: String(formData.from_account_id ?? "").trim(),
        to_account_id: String(formData.to_account_id ?? "").trim(),
        amount: Number(formData.amount ?? 0),
        fees: Number(formData.fees ?? 0),
        payment_mode: String(formData.payment_mode ?? "").trim(),
        reference_no: String(formData.reference_no ?? "").trim(),
        description: formData.description ? String(formData.description).trim() : null,
      })
      toast.success("Transfer created successfully")
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
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Transfers</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Review transfer records with live React Query updates, details lookup, edits, and deletes.
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
            title="Total Amount"
            value={totalAmount}
            isCurrency
            currencySymbol="₦"
            icon={<Wallet className="h-4 w-4 text-slate-500" />}
            isLoading={isLoading || isFetching}
          />
          <FinanceCard
            title="Total Fees"
            value={totalFees}
            isCurrency
            currencySymbol="₦"
            icon={<CreditCard className="h-4 w-4 text-slate-500" />}
            description={`${totalFees} in transfer fees`}
            isLoading={isLoading || isFetching}
          />
          <FinanceCard
            title="Completed"
            value={completedTransfers}
            icon={<Building2 className="h-4 w-4 text-slate-500" />}
            description={`${completedTransfers} completed transfers`}
            isLoading={isLoading || isFetching}
          />
        </div>
      </div>

      {isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          We had trouble fetching transfers.
          <Button variant="outline" onClick={() => refetch()} className="ml-3 rounded-xl border-red-200 bg-white">
            Retry
          </Button>
        </div>
      ) : null}

      <Card className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.26)]">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Transfer registry</h2>
              <p className="text-sm text-slate-500">Browse, filter, and manage transfer entries.</p>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">Use the table search and filters for quick lookup</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <FinanceDataTable
            title="Transfers"
            description="Premium transfer management table"
            data={transfers}
            filterOptions={[]}
            columns={columns}
            onAdd={handleAddTransfer}
            onEdit={handleEditTransfer}
            onView={handleViewTransfer}
            onDelete={(id) => handleDeleteTransfer(transfers.find((item) => item.id === id)?.transfer_id ?? id)}
            currencySymbol="₦"
            isLoading={isLoading || isFetching}
          />
        </div>
      </Card>

      <FinanceFormDialog
        title="New Transfer"
        fields={createFields}
        initialValues={{
          from_account_id: accountOptions[0]?.value ?? "",
          to_account_id: accountOptions[1]?.value ?? accountOptions[0]?.value ?? "",
          amount: "",
          fees: "",
          payment_mode: paymentModeOptions[0].value,
          reference_no: "",
          description: "",
        }}
        isOpen={isCreateOpen}
        onOpenChange={handleCreateOpenChange}
        onSubmit={handleSubmitCreateTransfer}
        submitLabel="Save Transfer"
        currencySymbol="₦"
      />

      <FinanceFormDialog
        title="Edit Transfer"
        fields={editFields}
        initialValues={
          selectedTransfer
            ? {
                amount: String(selectedTransfer.amount ?? ""),
                fees: String(selectedTransfer.fees ?? ""),
                description: selectedTransfer.description ?? "",
              }
            : {
                amount: "",
                fees: "",
                description: "",
              }
        }
        isOpen={isEditOpen}
        onOpenChange={handleEditOpenChange}
        onSubmit={handleSubmitTransfer}
        submitLabel="Update Transfer"
        currencySymbol="₦"
      />

      <FinanceDetailsDialog
        title="Transfer Details"
        data={selectedTransferDetails || {}}
        fields={detailsFields}
        isOpen={isDetailsOpen}
        onOpenChange={handleDetailsOpenChange}
        currencySymbol="₦"
      />
    </div>
  )
}
