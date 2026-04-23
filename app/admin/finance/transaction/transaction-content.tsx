"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { Building2, CreditCard, RefreshCw, Search, Sparkles, Wallet } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { StatusChangeDialog } from "@/app/admin/core-hr/components/status-change-dialog"
import { useGetFinanceAccounts } from "@/services/hooks/finance/accounts"
import {
  useCreateFinanceTransaction,
  useDeleteFinanceTransaction,
  useGetFinanceTransaction,
  useGetFinanceTransactions,
  useUpdateFinanceTransaction,
} from "@/services/hooks/finance/transactions"
import { FinanceCard } from "../components/finance-card"
import { FinanceDataTable } from "../components/finance-data-table"
import { FinanceDetailsDialog, type FinanceDetailsField } from "../components/finance-details-dialog"
import { FinanceFormDialog } from "../components/finance-form-dialog"

type TransactionUI = {
  id: string
  transaction_id: string
  accountId: string
  accountName: string
  transactionType: string
  amount: number
  paymentMethod: string
  category: string
  referenceId: string
  description?: string | null
  status: string
  transactionDate?: string
  createdAt?: string
  updatedAt?: string
}

const transactionTypeOptions = [
  { value: "Income", label: "Income" },
  { value: "Expense", label: "Expense" },
]

const categoryOptions = [
  { value: "Salary", label: "Salary" },
  { value: "Office Supplies", label: "Office Supplies" },
  { value: "Utilities", label: "Utilities" },
  { value: "Training", label: "Training" },
  { value: "Travel", label: "Travel" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Other", label: "Other" },
]

const paymentMethodOptions = [
  { value: "Transfer", label: "Transfer" },
  { value: "Cash", label: "Cash" },
  { value: "Card", label: "Card" },
  { value: "Cheque", label: "Cheque" },
  { value: "Direct Debit", label: "Direct Debit" },
]

const statusOptions = [
  { value: "Completed", label: "Completed" },
  { value: "Pending", label: "Pending" },
  { value: "Failed", label: "Failed" },
  { value: "Reversed", label: "Reversed" },
]

const resolveTransactionType = (value?: string | null) => {
  const normalized = String(value ?? "Income").trim().toLowerCase()
  return (
    transactionTypeOptions.find((item) => item.value.toLowerCase() === normalized)?.value ||
    transactionTypeOptions[0].value
  )
}

const resolveCategory = (value?: string | null) => {
  const normalized = String(value ?? "").trim().toLowerCase()
  return categoryOptions.find((item) => item.value.toLowerCase() === normalized)?.value || categoryOptions[0].value
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
    name: "account_id",
    label: "Account",
    type: "select" as const,
    required: true,
    options: accountOptions,
    width: "half" as const,
    placeholder: "Select account",
  },
  {
    name: "transaction_type",
    label: "Transaction Type",
    type: "select" as const,
    required: true,
    options: transactionTypeOptions,
    width: "half" as const,
  },
  { name: "amount", label: "Amount", type: "currency" as const, required: true, placeholder: "Enter amount", width: "half" as const, currencySymbol: "₦" },
  { name: "payment_method", label: "Payment Method", type: "select" as const, required: true, options: paymentMethodOptions, width: "half" as const },
  { name: "category", label: "Category", type: "select" as const, required: true, options: categoryOptions, width: "half" as const },
  { name: "reference_id", label: "Reference ID", type: "text" as const, required: true, placeholder: "Enter reference ID", width: "half" as const },
  { name: "transaction_date", label: "Transaction Date", type: "date" as const, required: true, width: "half" as const },
  { name: "description", label: "Description", type: "textarea" as const, placeholder: "Enter transaction description", width: "full" as const },
]

const editFields = [
  { name: "amount", label: "Amount", type: "currency" as const, required: true, placeholder: "Enter amount", width: "half" as const, currencySymbol: "₦" },
  { name: "category", label: "Category", type: "select" as const, required: true, options: categoryOptions, width: "half" as const },
  { name: "description", label: "Description", type: "textarea" as const, placeholder: "Enter transaction description", width: "full" as const },
]

const detailsFields: FinanceDetailsField[] = [
  { label: "Transaction ID", key: "transaction_id", type: "reference" },
  { label: "Reference ID", key: "referenceId", type: "reference" },
  { label: "Account", key: "accountName" },
  { label: "Account ID", key: "accountId" },
  { label: "Transaction Type", key: "transactionType" },
  {
    label: "Category",
    key: "category",
    render: (value: string) => {
      const category = categoryOptions.find((item) => item.value.toLowerCase() === String(value ?? "").toLowerCase())
      return category ? category.label : value
    },
  },
  { label: "Payment Method", key: "paymentMethod" },
  { label: "Amount", key: "amount", type: "currency", currencySymbol: "₦" },
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
  { label: "Transaction Date", key: "transactionDate", type: "date", format: "PP" },
  { label: "Created At", key: "createdAt", type: "date", format: "PPpp" },
  { label: "Updated At", key: "updatedAt", type: "date", format: "PPpp" },
  { label: "Description", key: "description" },
]

const normalizeTransaction = (transaction: any): TransactionUI => ({
  id: String(transaction.id ?? transaction.transaction_id),
  transaction_id: String(transaction.transaction_id ?? transaction.id ?? ""),
  accountId: String(transaction.account_id ?? transaction.accountId ?? ""),
  accountName: String(transaction.account_name ?? transaction.accountName ?? transaction.account_id ?? ""),
  transactionType: resolveTransactionType(transaction.transaction_type),
  amount: Number(transaction.amount ?? 0),
  paymentMethod: String(transaction.payment_method ?? transaction.paymentMethod ?? ""),
  category: resolveCategory(transaction.category),
  referenceId: String(transaction.reference_id ?? transaction.referenceId ?? ""),
  description: transaction.description ?? null,
  status: resolveStatus(transaction.status),
  transactionDate: transaction.transaction_date ?? transaction.created_at ?? transaction.createdAt ?? undefined,
  createdAt: transaction.created_at ?? transaction.createdAt ?? undefined,
  updatedAt: transaction.updated_at ?? transaction.updatedAt ?? undefined,
})

export function TransactionContent() {
  const { data, isLoading, isFetching, isError, refetch } = useGetFinanceTransactions()
  const { data: accountsData } = useGetFinanceAccounts()
  const createTransaction = useCreateFinanceTransaction()
  const updateTransaction = useUpdateFinanceTransaction()
  const deleteTransaction = useDeleteFinanceTransaction()

  const [selectedTransaction, setSelectedTransaction] = useState<TransactionUI | null>(null)
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [statusTransaction, setStatusTransaction] = useState<TransactionUI | null>(null)
  const [isStatusOpen, setIsStatusOpen] = useState(false)

  const transactions = useMemo(() => (data?.data?.transactions ?? []).map(normalizeTransaction), [data])
  const selectedTransactionDetailsQuery = useGetFinanceTransaction(selectedTransactionId ?? undefined, isDetailsOpen || isEditOpen)
  const selectedTransactionDetails = selectedTransactionDetailsQuery.data?.data
    ? normalizeTransaction(selectedTransactionDetailsQuery.data.data)
    : selectedTransaction

  const accountOptions = useMemo(() => normalizeAccountOptions(accountsData?.data?.accounts ?? []), [accountsData])
  const createFields = useMemo(() => buildCreateFields(accountOptions), [accountOptions])

  useEffect(() => {
    if (isError) toast.error("Failed to load transactions")
  }, [isError])

  useEffect(() => {
    if (selectedTransactionDetailsQuery.isError && selectedTransactionId) {
      toast.error("Failed to load transaction details")
    }
  }, [selectedTransactionDetailsQuery.isError, selectedTransactionId])

  const totalAmount = transactions.reduce((sum, transaction) => sum + Number(transaction.amount ?? 0), 0)
  const incomeCount = transactions.filter((transaction) => transaction.transactionType === "Income").length
  const expenseCount = transactions.filter((transaction) => transaction.transactionType === "Expense").length

  const columns = [
    {
      key: "transactionDate",
      label: "Date",
      sortable: true,
      render: (value: string) => (value ? format(new Date(value), "MMM d, yyyy") : "N/A"),
    },
    { key: "accountName", label: "Account", sortable: true },
    { key: "transactionType", label: "Type", sortable: true },
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
      label: "Payment Method",
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
    { key: "referenceId", label: "Reference ID", sortable: true },
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

  const handleViewTransaction = (id: string) => {
    const transaction = transactions.find((item) => item.id === id)
    if (!transaction) return

    setSelectedTransaction(transaction)
    setSelectedTransactionId(transaction.transaction_id)
    setIsDetailsOpen(true)
  }

  const handleEditTransaction = (id: string) => {
    const transaction = transactions.find((item) => item.id === id)
    if (!transaction) return

    setSelectedTransaction(transaction)
    setSelectedTransactionId(transaction.transaction_id)
    setIsEditOpen(true)
  }

  const handleChangeStatus = (id: string) => {
    const transaction = transactions.find((item) => item.id === id)
    if (!transaction) return

    setStatusTransaction(transaction)
    setIsStatusOpen(true)
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await deleteTransaction.mutateAsync(transactionId)
      toast.success("Transaction deleted successfully")
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete transaction")
    }
  }

  const handleDetailsOpenChange = (open: boolean) => {
    setIsDetailsOpen(open)
    if (!open) {
      setSelectedTransactionId(null)
    }
  }

  const handleEditOpenChange = (open: boolean) => {
    setIsEditOpen(open)
    if (!open) {
      setSelectedTransactionId(null)
    }
  }

  const handleCreateOpenChange = (open: boolean) => {
    setIsCreateOpen(open)
  }

  const handleAddTransaction = () => {
    setSelectedTransaction(null)
    setSelectedTransactionId(null)
    setIsCreateOpen(true)
  }

  const handleSubmitTransaction = async (formData: Record<string, any>) => {
    if (!selectedTransaction) {
      toast.error("No transaction selected")
      return
    }

    try {
      await updateTransaction.mutateAsync({
        transaction_id: selectedTransaction.transaction_id,
        amount: Number(formData.amount),
        category: String(formData.category ?? "").trim(),
        description: formData.description ? String(formData.description).trim() : null,
        status: selectedTransaction.status ?? "Completed",
      })
      toast.success("Transaction updated successfully")
      setIsEditOpen(false)
      setSelectedTransaction(null)
      setSelectedTransactionId(null)
    } catch (error: any) {
      toast.error(error?.message || "Update failed")
    }
  }

  const handleSubmitCreateTransaction = async (formData: Record<string, any>) => {
    try {
      await createTransaction.mutateAsync({
        account_id: String(formData.account_id ?? "").trim(),
        amount: Number(formData.amount ?? 0),
        payment_method: String(formData.payment_method ?? "").trim(),
        category: String(formData.category ?? "").trim(),
        reference_id: String(formData.reference_id ?? "").trim(),
        description: formData.description ? String(formData.description).trim() : null,
        transaction_date: String(formData.transaction_date ?? "").slice(0, 10),
        transaction_type: String(formData.transaction_type ?? "").trim(),
      })
      toast.success("Transaction created successfully")
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
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Transactions</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Review transaction records with live React Query updates, details lookup, edits, and deletes.
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
            title="Income"
            value={incomeCount}
            icon={<CreditCard className="h-4 w-4 text-slate-500" />}
            description={`${incomeCount} income transactions`}
            isLoading={isLoading || isFetching}
          />
          <FinanceCard
            title="Expense"
            value={expenseCount}
            icon={<Building2 className="h-4 w-4 text-slate-500" />}
            description={`${expenseCount} expense transactions`}
            isLoading={isLoading || isFetching}
          />
        </div>
      </div>

      {isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          We had trouble fetching transactions.
          <Button variant="outline" onClick={() => refetch()} className="ml-3 rounded-xl border-red-200 bg-white">
            Retry
          </Button>
        </div>
      ) : null}

      <Card className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.26)]">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Transaction registry</h2>
              <p className="text-sm text-slate-500">Browse, filter, and manage transaction entries.</p>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">Use the table search and filters for quick lookup</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <FinanceDataTable
            title="Transactions"
            description="Premium transaction management table"
            data={transactions}
            filterOptions={[]}
            columns={columns}
            onAdd={handleAddTransaction}
            onEdit={handleEditTransaction}
            onView={handleViewTransaction}
            onChangeStatus={handleChangeStatus}
            onDelete={(id) => handleDeleteTransaction(transactions.find((item) => item.id === id)?.transaction_id ?? id)}
            currencySymbol="₦"
            isLoading={isLoading || isFetching}
          />
        </div>
      </Card>

      <FinanceFormDialog
        title="New Transaction"
        fields={createFields}
        initialValues={{
          account_id: accountOptions[0]?.value ?? "",
          transaction_type: transactionTypeOptions[0].value,
          amount: "",
          payment_method: paymentMethodOptions[0].value,
          category: categoryOptions[0].value,
          reference_id: "",
          transaction_date: new Date().toISOString().slice(0, 10),
          description: "",
        }}
        isOpen={isCreateOpen}
        onOpenChange={handleCreateOpenChange}
        onSubmit={handleSubmitCreateTransaction}
        submitLabel="Save Transaction"
        currencySymbol="₦"
      />

      <FinanceFormDialog
        title="Edit Transaction"
        fields={editFields}
        initialValues={
          selectedTransaction
            ? {
                amount: String(selectedTransaction.amount ?? ""),
                category: selectedTransaction.category,
                description: selectedTransaction.description ?? "",
              }
            : {
                amount: "",
                category: categoryOptions[0].value,
                description: "",
              }
        }
        isOpen={isEditOpen}
        onOpenChange={handleEditOpenChange}
        onSubmit={handleSubmitTransaction}
        submitLabel="Update Transaction"
        currencySymbol="₦"
      />

      <FinanceDetailsDialog
        title="Transaction Details"
        data={selectedTransactionDetails || {}}
        fields={detailsFields}
        isOpen={isDetailsOpen}
        onOpenChange={handleDetailsOpenChange}
        currencySymbol="₦"
      />
      <StatusChangeDialog
        isOpen={isStatusOpen}
        onClose={() => {
          setIsStatusOpen(false)
          setStatusTransaction(null)
        }}
        title="Change Transaction Status"
        description={`Update the status for ${statusTransaction?.referenceId ?? "this transaction"}.`}
        currentStatus={statusTransaction?.status ?? "Completed"}
        options={statusOptions}
        isLoading={updateTransaction.isPending}
        onConfirm={async (status) => {
          if (!statusTransaction) return
          try {
            await updateTransaction.mutateAsync({
              transaction_id: statusTransaction.transaction_id,
              amount: Number(statusTransaction.amount ?? 0),
              category: statusTransaction.category,
              description: statusTransaction.description ?? null,
              payment_method: statusTransaction.paymentMethod,
              reference_id: statusTransaction.referenceId,
              transaction_date: statusTransaction.transactionDate ? String(statusTransaction.transactionDate).slice(0, 10) : undefined,
              transaction_type: statusTransaction.transactionType,
              account_id: statusTransaction.accountId,
              status,
            })
            toast.success("Transaction status updated successfully")
            setIsStatusOpen(false)
            setStatusTransaction(null)
          } catch (error: any) {
            toast.error(error?.message || "Failed to update transaction status")
          }
        }}
      />
    </div>
  )
}
