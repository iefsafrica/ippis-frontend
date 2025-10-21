"use client";

import React, { useState, useEffect } from "react";
import { FinanceDataTable } from "../components/finance-data-table";
import { FinanceFormDialog } from "../components/finance-form-dialog";
import { FinanceDetailsDialog } from "../components/finance-details-dialog";
import { FinanceCard } from "../components/finance-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, CreditCard, Building, Plus } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import type { FinanceDetailsField } from "../components/finance-details-dialog";

export type FinanceField = {
  key?: string;
  name: string;
  label: string;
  type: "text" | "number" | "currency" | "select" | "date" | "textarea";
  required?: boolean;
  defaultValue?: any;
  options?: { value: string; label: string }[];
};

// Constants
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

export function AccountsListContent() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | string>("all");

  const fetchAccounts = async () => {
    try {
      const { data } = await axios.get("/api/accounts");
      setAccounts(data);
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
      toast.error("Failed to load accounts");
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const totalBalance = accounts.reduce(
    (sum, a) => sum + (a.currency === "NGN" ? a.balance : a.balance * 1500),
    0,
  );
  const activeCount = accounts.filter((a) => a.status === "active").length;
  const uniqueBanks = new Set(accounts.map((a) => a.bankName)).size;

  const filtered = accounts
    .filter((a) => activeTab === "all" || a.accountType === activeTab)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const openForm = (account?: any) => {
    setSelectedAccount(account || null);
    setIsEditMode(!!account);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        balance: parseFloat(data.balance),
        openingDate: data.openingDate || new Date().toISOString(),
      };
      if (isEditMode && selectedAccount) {
        await axios.put(`/api/accounts/${selectedAccount.id}`, payload);
        toast.success("Account updated");
      } else {
        await axios.post("/api/accounts", payload);
        toast.success("Account created");
      }
      setIsFormOpen(false);
      fetchAccounts();
    } catch (err: any) {
      console.error("Submit error:", err);
      toast.error(err.response?.data?.error || "Submit failed");
    }
  };

  // 🔧 Fix: Convert form fields to compatible detail fields
  const detailsFields: FinanceDetailsField[] = accountFields.map(({ name, label, type }) => {
    let detailsType: FinanceDetailsField["type"];

    switch (type) {
      case "number":
      case "currency":
        detailsType = "currency";
        break;
      case "date":
        detailsType = "date";
        break;
      case "select":
        detailsType = name === "status" ? "status" : "text";
        break;
      case "textarea":
      case "text":
      default:
        detailsType = "text";
        break;
    }

    return {
      key: name,
      label,
      type: detailsType,
    };
  });

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Accounts</h1>
        <Button onClick={() => openForm()} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" /> New
        </Button>
      </header>

      <div className="grid md:grid-cols-3 gap-4">
        <FinanceCard title="Total Balance" value={totalBalance} isCurrency currencySymbol="₦" icon={<Wallet />} />
        <FinanceCard title="Active Accounts" value={activeCount} icon={<CreditCard />} description={`${activeCount} active`} />
        <FinanceCard title="Banks" value={uniqueBanks} icon={<Building />} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          {accountTypes.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="all">
          <FinanceDataTable
            title="Accounts"
            data={filtered}
            filterOptions={[]}
            columns={[]}
            onAdd={() => openForm()}
            onEdit={(id) => openForm(accounts.find((a) => a.id === id))}
            onView={(id) => {
              setSelectedAccount(accounts.find((a) => a.id === id));
              setIsDetailsOpen(true);
            }}
            onDelete={(id) => console.log("delete", id)}
            currencySymbol="₦"
          />
        </TabsContent>
      </Tabs>

      <FinanceFormDialog
        title={isEditMode ? "Edit Account" : "New Account"}
        fields={accountFields}
        initialValues={isEditMode ? selectedAccount : {}}
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        currencySymbol="₦"
      />

      <FinanceDetailsDialog
        title="Account Details"
        data={selectedAccount || {}}
        fields={detailsFields}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onEdit={() => {
          setIsDetailsOpen(false);
          openForm(selectedAccount);
        }}
        onDelete={() => console.log("delete", selectedAccount?.id)}
        onPrint={() => window.print()}
        onCopy={() => selectedAccount && navigator.clipboard.writeText(selectedAccount.accountNumber)}
        actions={{ edit: true, delete: true, print: true, copy: true }}
        currencySymbol="₦"
      />
    </div>
  );
}
