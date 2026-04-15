"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinanceCard } from "../components/finance-card";
import { FinanceDataTable } from "../components/finance-data-table";
import { FinanceFormDialog } from "../components/finance-form-dialog";
import { FinanceDetailsDialog, type FinanceDetailsField } from "../components/finance-details-dialog";
import { Wallet, CreditCard, Building, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateFinanceAccount,
  useDeleteFinanceAccount,
  useGetFinanceAccounts,
  useUpdateFinanceAccount,
} from "@/services/hooks/finance/accounts";

export type FinanceField = {
  key?: string;
  name: string;
  label: string;
  type: "text" | "number" | "currency" | "select" | "date" | "textarea";
  required?: boolean;
  defaultValue?: any;
  options?: { value: string; label: string }[];
};

type FinanceAccountUI = {
  id: string;
  account_id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  account_type: string;
  currency: string;
  balance: number;
  opening_date?: string | null;
  status?: string | null;
  branch_code?: string | null;
  swift_code?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

const accountTypes = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
  { value: "investment", label: "Investment" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const accountFields: FinanceField[] = [
  { name: "accountName", label: "Account Name", type: "text", required: true },
  { name: "accountNumber", label: "Account Number", type: "text", required: true },
  { name: "bankName", label: "Bank Name", type: "text", required: true },
  { name: "accountType", label: "Account Type", type: "select", options: accountTypes, required: true },
  { name: "currency", label: "Currency", type: "text", defaultValue: "NGN", required: true },
  { name: "balance", label: "Balance", type: "number", required: true },
  { name: "openingDate", label: "Opening Date", type: "date" },
  { name: "status", label: "Status", type: "select", options: statusOptions, required: true },
  { name: "branchCode", label: "Branch Code", type: "text" },
  { name: "swiftCode", label: "Swift Code", type: "text" },
  { name: "description", label: "Description", type: "textarea" },
];

const accountFieldToRecordKey: Record<string, keyof FinanceAccountUI> = {
  accountName: "account_name",
  accountNumber: "account_number",
  bankName: "bank_name",
  accountType: "account_type",
  currency: "currency",
  balance: "balance",
  openingDate: "opening_date",
  status: "status",
  branchCode: "branch_code",
  swiftCode: "swift_code",
  description: "description",
};

const initialForm = {
  accountName: "",
  accountNumber: "",
  bankName: "",
  accountType: "checking",
  currency: "NGN",
  balance: "",
  openingDate: "",
  status: "active",
  branchCode: "",
  swiftCode: "",
  description: "",
};

const normalizeAccount = (account: any): FinanceAccountUI => ({
  id: String(account.id ?? account.account_id),
  account_id: String(account.account_id ?? account.id ?? ""),
  account_name: account.account_name ?? account.accountName ?? "",
  account_number: account.account_number ?? account.accountNumber ?? "",
  bank_name: account.bank_name ?? account.bankName ?? "",
  account_type: account.account_type ?? account.accountType ?? "",
  currency: account.currency ?? "NGN",
  balance: Number(account.balance ?? 0),
  opening_date: account.opening_date ?? account.openingDate ?? null,
  status: account.status ?? null,
  branch_code: account.branch_code ?? account.branchCode ?? null,
  swift_code: account.swift_code ?? account.swiftCode ?? null,
  description: account.description ?? null,
  created_at: account.created_at ?? account.createdAt,
  updated_at: account.updated_at ?? account.updatedAt,
});

const formatDate = (value?: string | null) => {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "N/A"
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatMoney = (value: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "NGN" }).format(Number(value) || 0);

const getStatusBadge = (status?: string | null) => {
  switch ((status ?? "").toLowerCase()) {
    case "active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "inactive":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
};

const getTypeBadge = (type?: string | null) => {
  switch ((type ?? "").toLowerCase()) {
    case "checking":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "savings":
      return "bg-violet-50 text-violet-700 border-violet-200";
    case "investment":
      return "bg-orange-50 text-orange-700 border-orange-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

export function AccountsListContent() {
  const { data, isLoading, isFetching, isError, refetch } = useGetFinanceAccounts();
  const createAccount = useCreateFinanceAccount();
  const updateAccount = useUpdateFinanceAccount();
  const deleteAccount = useDeleteFinanceAccount();

  const [selectedAccount, setSelectedAccount] = useState<FinanceAccountUI | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | string>("all");

  const accounts = useMemo(() => (data?.data?.accounts ?? []).map(normalizeAccount), [data]);

  const filteredAccounts = useMemo(
    () =>
      accounts
        .filter((account) => activeTab === "all" || account.account_type === activeTab)
        .sort((a, b) => new Date(b.updated_at ?? b.created_at ?? 0).getTime() - new Date(a.updated_at ?? a.created_at ?? 0).getTime()),
    [accounts, activeTab],
  );

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const activeCount = accounts.filter((account) => (account.status ?? "").toLowerCase() === "active").length;
  const uniqueBanks = new Set(accounts.map((account) => account.bank_name).filter(Boolean)).size;
  const recentUpdates = accounts.filter((account) => {
    if (!account.updated_at) return false;
    return Date.now() - new Date(account.updated_at).getTime() <= 14 * 24 * 60 * 60 * 1000;
  }).length;

  const columns = [
    {
      key: "account_name",
      label: "Account",
      sortable: true,
      render: (_: any, row: FinanceAccountUI) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-950">{row.account_name}</span>
            <Badge variant="outline" className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.22em] ${getStatusBadge(row.status)}`}>
              {row.status ?? "unknown"}
            </Badge>
          </div>
          <p className="text-xs text-slate-500">
            {row.bank_name} <span className="text-slate-300">-</span> {row.account_id}
          </p>
        </div>
      ),
    },
    {
      key: "account_type",
      label: "Type",
      sortable: true,
      render: (value: string) => (
        <Badge variant="outline" className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${getTypeBadge(value)}`}>
          {value}
        </Badge>
      ),
    },
    {
      key: "balance",
      label: "Balance",
      sortable: true,
      render: (value: number, row: FinanceAccountUI) => (
        <div className="space-y-1">
          <p className="font-semibold text-slate-950">{formatMoney(value, row.currency)}</p>
          <p className="text-xs text-slate-400">{row.currency}</p>
        </div>
      ),
    },
    {
      key: "updated_at",
      label: "Updated",
      sortable: true,
      render: (value: string, row: FinanceAccountUI) => formatDate(value ?? row.created_at),
    },
  ];

  const detailsFields: FinanceDetailsField[] = accountFields.map(({ name, label, type }) => {
    const mappedType: FinanceDetailsField["type"] =
      type === "date" ? "date" : type === "number" || type === "currency" ? "currency" : type === "select" && name === "status" ? "status" : "text";
    return { key: name, label, type: mappedType };
  });

  const editFields = useMemo(() => {
    if (!selectedAccount) return accountFields;

    return accountFields.filter((field) => {
      const recordKey = accountFieldToRecordKey[field.name]
      const value = selectedAccount[recordKey]
      return value !== null && value !== undefined && value !== ""
    })
  }, [selectedAccount]);

  const openForm = (account?: FinanceAccountUI) => {
    setSelectedAccount(account ?? null);
    setIsEditMode(Boolean(account));
    setIsFormOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    const payload = {
      account_name: formData.accountName,
      account_number: formData.accountNumber,
      bank_name: formData.bankName,
      account_type: formData.accountType,
      currency: formData.currency,
      balance: parseFloat(formData.balance),
      opening_date: formData.openingDate || undefined,
      status: formData.status,
      branch_code: formData.branchCode || undefined,
      swift_code: formData.swiftCode || undefined,
      description: formData.description || undefined,
    };

    try {
      if (isEditMode && selectedAccount) {
        await updateAccount.mutateAsync({ account_id: selectedAccount.account_id, ...payload });
        toast.success("Account updated successfully");
      } else {
        await createAccount.mutateAsync(payload);
        toast.success("Account created successfully");
      }
      setIsFormOpen(false);
      setSelectedAccount(null);
    } catch (error: any) {
      toast.error(error?.message || "Submit failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAccount.mutateAsync(id);
      toast.success("Account deleted successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete account");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.28)] backdrop-blur animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Finance module
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Accounts</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage account records with a cleaner, premium interface and live React Query updates.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <FinanceCard title="Total Balance" value={totalBalance} isCurrency currencySymbol="NGN" icon={<Wallet className="h-4 w-4 text-slate-500" />} />
          <FinanceCard title="Active Accounts" value={activeCount} icon={<CreditCard className="h-4 w-4 text-slate-500" />} description={`${activeCount} active`} />
          <FinanceCard title="Banks" value={uniqueBanks} icon={<Building className="h-4 w-4 text-slate-500" />} description={`${recentUpdates} updated recently`} />
        </div>
      </div>

      <Card className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.26)]">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Account registry</h2>
              <p className="text-sm text-slate-500">Browse, filter, and manage finance accounts.</p>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">Use the table search and filters for quick lookup</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-5 h-auto rounded-full border border-slate-200 bg-slate-50 p-1">
              <TabsTrigger value="all" className="rounded-full px-4 data-[state=active]:bg-slate-950 data-[state=active]:text-white">All</TabsTrigger>
              {accountTypes.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="rounded-full px-4 capitalize data-[state=active]:bg-slate-950 data-[state=active]:text-white">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {isError ? (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  We had trouble fetching finance accounts.
                  <Button variant="outline" onClick={() => refetch()} className="ml-3 rounded-xl border-red-200 bg-white">
                    Retry
                  </Button>
                </div>
              ) : null}

              <FinanceDataTable
                title="Accounts"
                description="Premium account management table"
                data={filteredAccounts}
                filterOptions={[]}
                columns={columns}
                onAdd={() => openForm()}
                onEdit={(id) => openForm(accounts.find((account) => account.id === id))}
                onView={(id) => {
                  setSelectedAccount(accounts.find((account) => account.id === id) ?? null);
                  setIsDetailsOpen(true);
                }}
                onDelete={(id) => handleDelete(accounts.find((account) => account.id === id)?.account_id ?? id)}
                currencySymbol="NGN"
                isLoading={isLoading || isFetching}
              />
            </TabsContent>
          </Tabs>
        </div>
      </Card>

      <FinanceFormDialog
        title={isEditMode ? "Edit Account" : "New Account"}
        fields={isEditMode ? editFields : accountFields}
        initialValues={isEditMode && selectedAccount ? {
          accountName: selectedAccount.account_name,
          accountNumber: selectedAccount.account_number,
          bankName: selectedAccount.bank_name,
          accountType: String(selectedAccount.account_type ?? "").toLowerCase(),
          currency: selectedAccount.currency,
          balance: String(selectedAccount.balance),
          openingDate: selectedAccount.opening_date ?? "",
          status: String(selectedAccount.status ?? "active").toLowerCase(),
          branchCode: selectedAccount.branch_code ?? "",
          swiftCode: selectedAccount.swift_code ?? "",
          description: selectedAccount.description ?? "",
        } : initialForm}
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        currencySymbol="NGN"
      />

      <FinanceDetailsDialog
        title="Account Details"
        data={selectedAccount || {}}
        fields={detailsFields}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onEdit={() => {
          setIsDetailsOpen(false);
          if (selectedAccount) openForm(selectedAccount);
        }}
        onDelete={() => selectedAccount && handleDelete(selectedAccount.account_id)}
        onPrint={() => window.print()}
        onCopy={() => selectedAccount && navigator.clipboard.writeText(selectedAccount.account_number)}
        actions={{ edit: true, delete: true, print: true, copy: true }}
        currencySymbol="NGN"
      />
    </div>
  );
}
