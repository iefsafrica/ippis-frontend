"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { Building2, CheckCircle2, CreditCard, RefreshCw, Search, Sparkles, Wallet } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { ApproveConfirmationDialog } from "@/components/ui/approve-confirmation-dialog"
import { Card } from "@/components/ui/card"
import { StatusChangeDialog } from "@/app/admin/core-hr/components/status-change-dialog"
import { useGetFinanceAccounts } from "@/services/hooks/finance/accounts"
import { useGetFinancePayees } from "@/services/hooks/finance/payees"
import {
  useApproveFinanceExpenses,
  useCreateFinanceExpense,
  useDeleteFinanceExpense,
  useGetFinanceExpense,
  useGetFinanceExpenses,
  useUpdateFinanceExpense,
} from "@/services/hooks/finance/expenses"
import { FinanceCard } from "../components/finance-card"
import { FinanceDataTable } from "../components/finance-data-table"
import { FinanceDetailsDialog, type FinanceDetailsField } from "../components/finance-details-dialog"
import { FinanceFormDialog } from "../components/finance-form-dialog"

type ExpenseUI = {
  id: string
  expense_id: string
  accountId: string
  accountName: string
  payeeId: string
  payeeName: string
  amount: number
  paymentMethod: string
  category: string
  reference: string
  description?: string | null
  status: string
  date?: string
  createdAt?: string
  updatedAt?: string
}

const categoryOptions = [
  { value: "Office Supplies", label: "Office Supplies" },
  { value: "Utilities", label: "Utilities" },
  { value: "Salaries", label: "Salaries" },
  { value: "Training", label: "Training" },
  { value: "Travel", label: "Travel" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Marketing", label: "Marketing" },
  { value: "Other", label: "Other" },
]

const paymentMethodOptions = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "cheque", label: "Cheque" },
  { value: "direct_debit", label: "Direct Debit" },
]

const statusOptions = [
  { value: "approved", label: "Approved" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "reversed", label: "Reversed" },
]

const resolveCategory = (value?: string | null) => {
  const normalized = String(value ?? "").trim().toLowerCase()
  return (
    categoryOptions.find((item) => item.value.toLowerCase() === normalized)?.value ||
    categoryOptions[0].value
  )
}

const resolveStatus = (value?: string | null) => {
  const normalized = String(value ?? "pending").trim().toLowerCase()
  return statusOptions.find((item) => item.value.toLowerCase() === normalized)?.value || "pending"
}

const normalizeAccountOptions = (accounts: any[] = []) =>
  accounts.map((account) => ({
    value: String(account.account_id ?? account.id ?? ""),
    label: String(account.account_name ?? account.accountName ?? account.account_id ?? ""),
  }))

const normalizePayeeOptions = (payees: any[] = []) =>
  payees.map((payee) => ({
    value: String(payee.payee_id ?? payee.id ?? ""),
    label: String(payee.payee_name ?? payee.name ?? payee.payee_id ?? ""),
  }))

const editFields = [
  { name: "amount", label: "Amount", type: "currency" as const, required: true, placeholder: "Enter amount", width: "half" as const, currencySymbol: "₦" },
  { name: "category", label: "Category", type: "select" as const, required: true, options: categoryOptions, width: "half" as const },
  { name: "description", label: "Description", type: "textarea" as const, placeholder: "Enter expense description", width: "full" as const },
]

const buildCreateFields = (
  accountOptions: { label: string; value: string }[],
  payeeOptions: { label: string; value: string }[],
) => [
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
    name: "payee_id",
    label: "Payee",
    type: "select" as const,
    required: true,
    options: payeeOptions,
    width: "half" as const,
    placeholder: "Select payee",
  },
  { name: "amount", label: "Amount", type: "currency" as const, required: true, placeholder: "Enter amount", width: "half" as const, currencySymbol: "₦" },
  { name: "payment_method", label: "Payment Method", type: "select" as const, required: true, options: paymentMethodOptions, width: "half" as const },
  { name: "category", label: "Category", type: "select" as const, required: true, options: categoryOptions, width: "half" as const },
  { name: "date", label: "Date", type: "date" as const, required: true, width: "half" as const },
  { name: "description", label: "Description", type: "textarea" as const, placeholder: "Enter expense description", width: "full" as const },
]

const detailsFields: FinanceDetailsField[] = [
  { label: "Expense ID", key: "expense_id", type: "reference" },
  { label: "Reference", key: "reference", type: "reference" },
  { label: "Account", key: "accountName" },
  { label: "Account ID", key: "accountId" },
  { label: "Payee", key: "payeeName" },
  { label: "Payee ID", key: "payeeId" },
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
      paid: { label: "Paid", variant: "default" },
      pending: { label: "Pending", variant: "secondary" },
      failed: { label: "Failed", variant: "destructive" },
      reversed: { label: "Reversed", variant: "outline" },
    },
  },
  { label: "Date", key: "date", type: "date", format: "PP" },
  { label: "Created At", key: "createdAt", type: "date", format: "PPpp" },
  { label: "Updated At", key: "updatedAt", type: "date", format: "PPpp" },
  { label: "Description", key: "description" },
]

const normalizeExpense = (expense: any): ExpenseUI => ({
  id: String(expense.id ?? expense.expense_id),
  expense_id: String(expense.expense_id ?? expense.id ?? ""),
  accountId: String(expense.account_id ?? expense.accountId ?? ""),
  accountName: String(expense.account_name ?? expense.accountName ?? expense.account_id ?? ""),
  payeeId: String(expense.payee_id ?? expense.payeeId ?? ""),
  payeeName: String(expense.payee_name ?? expense.payeeName ?? expense.payee_id ?? ""),
  amount: Number(expense.amount ?? 0),
  paymentMethod: String(expense.payment_method ?? expense.paymentMethod ?? ""),
  category: resolveCategory(expense.category),
  reference: String(expense.reference ?? expense.expense_id ?? ""),
  description: expense.description ?? null,
  status: resolveStatus(expense.status),
  date: expense.date ?? expense.created_at ?? expense.createdAt ?? undefined,
  createdAt: expense.created_at ?? expense.createdAt ?? undefined,
  updatedAt: expense.updated_at ?? expense.updatedAt ?? undefined,
})

export function ExpenseContent() {
  const { data, isLoading, isFetching, isError, refetch } = useGetFinanceExpenses()
  const { data: accountsData } = useGetFinanceAccounts()
  const { data: payeesData } = useGetFinancePayees()
  const approveFinanceExpenses = useApproveFinanceExpenses()
  const createExpense = useCreateFinanceExpense()
  const updateExpense = useUpdateFinanceExpense()
  const deleteExpense = useDeleteFinanceExpense()

  const [selectedExpense, setSelectedExpense] = useState<ExpenseUI | null>(null)
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [statusExpense, setStatusExpense] = useState<ExpenseUI | null>(null)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [approveExpenseCandidate, setApproveExpenseCandidate] = useState<ExpenseUI | null>(null)
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isBulkApproveOpen, setIsBulkApproveOpen] = useState(false)
  const [expenseRows, setExpenseRows] = useState<ExpenseUI[]>([])

  useEffect(() => {
    setExpenseRows((data?.data?.expenses ?? []).map(normalizeExpense))
  }, [data])

  const expenses = expenseRows
  const selectedExpenseDetailsQuery = useGetFinanceExpense(selectedExpenseId ?? undefined, isDetailsOpen || isEditOpen)
  const selectedExpenseDetails = selectedExpenseDetailsQuery.data?.data
    ? normalizeExpense(selectedExpenseDetailsQuery.data.data)
    : selectedExpense

  const accountOptions = useMemo(() => normalizeAccountOptions(accountsData?.data?.accounts ?? []), [accountsData])
  const payeeOptions = useMemo(() => normalizePayeeOptions(payeesData?.data?.payees ?? []), [payeesData])

  const createFields = useMemo(() => buildCreateFields(accountOptions, payeeOptions), [accountOptions, payeeOptions])

  useEffect(() => {
    if (isError) toast.error("Failed to load expenses")
  }, [isError])

  useEffect(() => {
    if (selectedExpenseDetailsQuery.isError && selectedExpenseId) {
      toast.error("Failed to load expense details")
    }
  }, [selectedExpenseDetailsQuery.isError, selectedExpenseId])

  const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount ?? 0), 0)
  const uniqueAccounts = new Set(expenses.map((expense) => expense.accountId).filter(Boolean)).size
  const uniquePayees = new Set(expenses.map((expense) => expense.payeeId).filter(Boolean)).size

  const columns = [
    { key: "reference", label: "Reference", sortable: true },
    { key: "accountName", label: "Account", sortable: true },
    { key: "payeeName", label: "Payee", sortable: true },
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
      render: (value: string) =>
        String(value ?? "")
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase()),
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
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            value === "approved" || value === "paid"
              ? "bg-green-100 text-green-800"
              : value === "pending"
                ? "bg-amber-100 text-amber-800"
                : value === "failed"
                  ? "bg-red-100 text-red-800"
                  : "bg-slate-100 text-slate-700"
          }`}
        >
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

  const handleViewExpense = (id: string) => {
    const expense = expenses.find((item) => item.id === id)
    if (!expense) return

    setSelectedExpense(expense)
    setSelectedExpenseId(expense.expense_id)
    setIsDetailsOpen(true)
  }

  const handleEditExpense = (id: string) => {
    const expense = expenses.find((item) => item.id === id)
    if (!expense) return

    setSelectedExpense(expense)
    setSelectedExpenseId(expense.expense_id)
    setIsEditOpen(true)
  }

  const handleChangeStatus = (id: string) => {
    const expense = expenses.find((item) => item.id === id)
    if (!expense) return

    setStatusExpense(expense)
    setIsStatusOpen(true)
  }

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteExpense.mutateAsync(expenseId)
      toast.success("Expense deleted successfully")
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete expense")
    }
  }

  const handleApproveExpense = async (expenseId: string) => {
    const expense = expenses.find((item) => item.id === expenseId)
    if (!expense) {
      toast.error("Expense not found")
      return
    }
    setApproveExpenseCandidate(expense)
    setIsApproveOpen(true)
  }

  const pendingExpenseIds = useMemo(
    () => expenses.filter((expense) => expense.status?.toLowerCase() === "pending").map((expense) => expense.expense_id),
    [expenses],
  )
  const pendingExpenseCount = pendingExpenseIds.length

  const handleBulkApproveExpenses = () => {
    if (!pendingExpenseCount) {
      toast.info("No pending expenses to approve")
      return
    }

    setIsBulkApproveOpen(true)
  }

  const handleConfirmApproveExpense = async () => {
    if (!approveExpenseCandidate) return

    try {
      const response = await approveFinanceExpenses.mutateAsync({ expense_ids: [approveExpenseCandidate.expense_id] })
      const approvedCount = response.approvedIds?.length ?? 1
      toast.success(
        response.message || `${approvedCount} expense${approvedCount === 1 ? "" : "s"} approved successfully`,
      )
      setIsApproveOpen(false)
      setApproveExpenseCandidate(null)
      setExpenseRows((prev) =>
        prev.map((item) =>
          item.expense_id === approveExpenseCandidate.expense_id ? { ...item, status: "approved" } : item,
        ),
      )
    } catch (error: any) {
      toast.error(error?.message || "Failed to approve expense")
    }
  }

  const handleConfirmBulkApproveExpenses = async () => {
    if (!pendingExpenseIds.length) return

    try {
      const response = await approveFinanceExpenses.mutateAsync({ expense_ids: pendingExpenseIds })
      const approvedCount = response.approvedIds?.length ?? pendingExpenseIds.length
      toast.success(
        response.message || `${approvedCount} expense${approvedCount === 1 ? "" : "s"} approved successfully`,
      )
      setExpenseRows((prev) =>
        prev.map((item) => (pendingExpenseIds.includes(item.expense_id) ? { ...item, status: "approved" } : item)),
      )
      setIsBulkApproveOpen(false)
    } catch (error: any) {
      toast.error(error?.message || "Failed to approve expenses")
    }
  }

  const handleDetailsOpenChange = (open: boolean) => {
    setIsDetailsOpen(open)
    if (!open) {
      setSelectedExpenseId(null)
    }
  }

  const handleEditOpenChange = (open: boolean) => {
    setIsEditOpen(open)
    if (!open) {
      setSelectedExpenseId(null)
    }
  }

  const handleCreateOpenChange = (open: boolean) => {
    setIsCreateOpen(open)
  }

  const handleAddExpense = () => {
    setSelectedExpense(null)
    setSelectedExpenseId(null)
    setIsCreateOpen(true)
  }

  const handleSubmitExpense = async (formData: Record<string, any>) => {
    if (!selectedExpense) {
      toast.error("No expense selected")
      return
    }

    try {
      await updateExpense.mutateAsync({
        expense_id: selectedExpense.expense_id,
        amount: Number(formData.amount),
        category: String(formData.category ?? "").trim(),
        description: formData.description ? String(formData.description).trim() : null,
        status: selectedExpense.status ?? "pending",
      })
      toast.success("Expense updated successfully")
      setIsEditOpen(false)
      setSelectedExpense(null)
      setSelectedExpenseId(null)
    } catch (error: any) {
      toast.error(error?.message || "Update failed")
    }
  }

  const handleSubmitCreateExpense = async (formData: Record<string, any>) => {
    try {
      await createExpense.mutateAsync({
        account_id: String(formData.account_id ?? "").trim(),
        payee_id: String(formData.payee_id ?? "").trim(),
        amount: Number(formData.amount ?? 0),
        payment_method: String(formData.payment_method ?? "").trim(),
        category: String(formData.category ?? "").trim(),
        date: String(formData.date ?? "").slice(0, 10),
        description: formData.description ? String(formData.description).trim() : null,
      })
      toast.success("Expense created successfully")
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
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Expenses</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Review expense records with live React Query updates, details lookup, edits, and deletes.
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
            title="Total Expenses"
            value={totalAmount}
            isCurrency
            currencySymbol="₦"
            icon={<Wallet className="h-4 w-4 text-slate-500" />}
            isLoading={isLoading || isFetching}
          />
          <FinanceCard
            title="Accounts"
            value={uniqueAccounts}
            icon={<Building2 className="h-4 w-4 text-slate-500" />}
            description="Unique expense accounts"
            isLoading={isLoading || isFetching}
          />
          <FinanceCard
            title="Payees"
            value={uniquePayees}
            icon={<CreditCard className="h-4 w-4 text-slate-500" />}
            description="Unique payees"
            isLoading={isLoading || isFetching}
          />
        </div>
      </div>

      {isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          We had trouble fetching expenses.
          <Button variant="outline" onClick={() => refetch()} className="ml-3 rounded-xl border-red-200 bg-white">
            Retry
          </Button>
        </div>
      ) : null}

      <Card className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.26)]">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Expense registry</h2>
              <p className="text-sm text-slate-500">Browse, filter, and manage expense entries.</p>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">Use the table search and filters for quick lookup</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <FinanceDataTable
            title="Expenses"
            description="Premium expense management table"
            data={expenses}
            filterOptions={[]}
            columns={columns}
            onAdd={handleAddExpense}
            onEdit={handleEditExpense}
            onView={handleViewExpense}
            onChangeStatus={handleChangeStatus}
            onApprove={handleApproveExpense}
            onDelete={(id) => handleDeleteExpense(expenses.find((item) => item.id === id)?.expense_id ?? id)}
            currencySymbol="₦"
            isLoading={isLoading || isFetching}
          />
        </div>
      </Card>

      <FinanceFormDialog
        title="New Expense"
        fields={createFields}
        initialValues={{
          account_id: accountOptions[0]?.value ?? "",
          payee_id: payeeOptions[0]?.value ?? "",
          amount: "",
          payment_method: paymentMethodOptions[0].value,
          category: categoryOptions[0].value,
          date: new Date().toISOString().slice(0, 10),
          description: "",
        }}
        isOpen={isCreateOpen}
        onOpenChange={handleCreateOpenChange}
        onSubmit={handleSubmitCreateExpense}
        submitLabel="Save Expense"
        currencySymbol="₦"
      />

      <FinanceFormDialog
        title="Edit Expense"
        fields={editFields}
        initialValues={
          selectedExpense
            ? {
                amount: String(selectedExpense.amount ?? ""),
                category: selectedExpense.category,
                description: selectedExpense.description ?? "",
              }
            : {
                amount: "",
                category: categoryOptions[0].value,
                description: "",
              }
        }
        isOpen={isEditOpen}
        onOpenChange={handleEditOpenChange}
        onSubmit={handleSubmitExpense}
        submitLabel="Update Expense"
        currencySymbol="₦"
      />

      <FinanceDetailsDialog
        title="Expense Details"
        data={selectedExpenseDetails || {}}
        fields={detailsFields}
        isOpen={isDetailsOpen}
        onOpenChange={handleDetailsOpenChange}
        currencySymbol="₦"
      />
      <StatusChangeDialog
        isOpen={isStatusOpen}
        onClose={() => {
          setIsStatusOpen(false)
          setStatusExpense(null)
        }}
        title="Change Expense Status"
        description={`Update the status for ${statusExpense?.reference ?? "this expense"}.`}
        currentStatus={statusExpense?.status ?? "pending"}
        options={statusOptions}
        isLoading={updateExpense.isPending}
        onConfirm={async (status) => {
          if (!statusExpense) return
          try {
            await updateExpense.mutateAsync({
              expense_id: statusExpense.expense_id,
              amount: Number(statusExpense.amount ?? 0),
              category: statusExpense.category,
              description: statusExpense.description ?? null,
              account_id: statusExpense.accountId,
              payee_id: statusExpense.payeeId,
              payment_method: statusExpense.paymentMethod,
              date: statusExpense.date ? String(statusExpense.date).slice(0, 10) : undefined,
              status,
            })
            toast.success("Expense status updated successfully")
            setIsStatusOpen(false)
            setStatusExpense(null)
          } catch (error: any) {
            toast.error(error?.message || "Failed to update expense status")
          }
        }}
      />
      <ApproveConfirmationDialog
        isOpen={isApproveOpen}
        onClose={() => {
          setIsApproveOpen(false)
          setApproveExpenseCandidate(null)
        }}
        onConfirm={handleConfirmApproveExpense}
        title="Approve Expense"
        description={`Approve ${approveExpenseCandidate?.reference ?? "this expense"}?`}
        itemName={approveExpenseCandidate?.reference || "this expense"}
        isLoading={approveFinanceExpenses.isPending}
      />
      <ApproveConfirmationDialog
        isOpen={isBulkApproveOpen}
        onClose={() => setIsBulkApproveOpen(false)}
        onConfirm={handleConfirmBulkApproveExpenses}
        title="Approve Pending Expenses"
        description={`Approve all ${pendingExpenseCount} pending expense${pendingExpenseCount === 1 ? "" : "s"}?`}
        itemName={`${pendingExpenseCount} pending expense${pendingExpenseCount === 1 ? "" : "s"}`}
        isLoading={approveFinanceExpenses.isPending}
      />
    </div>
  )
}
