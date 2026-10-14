"use client"

import React, { useState, useEffect } from "react"
import {
  Wallet,
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  TrendingUp,
  Receipt,
  Scale,
  Building,
  CreditCard,
  CheckCircle2,
} from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import {
  AnalyticsHeader,
  AnalyticsKpiGrid,
  AnalyticsChartCard,
  QuickNavGrid,
  KpiItem,
} from "./analytics-ui"

const monthlyCashFlowData = [
  { month: "May", revenue: 4.8, expenses: 3.2, net: 1.6 },
  { month: "Jun", revenue: 5.1, expenses: 3.5, net: 1.6 },
  { month: "Jul", revenue: 5.4, expenses: 3.8, net: 1.6 },
  { month: "Aug", revenue: 5.9, expenses: 4.1, net: 1.8 },
  { month: "Sep", revenue: 6.2, expenses: 4.3, net: 1.9 },
  { month: "Oct", revenue: 6.8, expenses: 4.6, net: 2.2 },
]

const expenseDistribution = [
  { name: "Personnel Emoluments", value: 4120, color: "#008751" },
  { name: "Capital Infrastructure", value: 1680, color: "#3b82f6" },
  { name: "Overheads & Maintenance", value: 640, color: "#f59e0b" },
  { name: "Statutory Debt Service", value: 360, color: "#8b5cf6" },
]

const recentTransactions = [
  {
    ref: "TRX-2026-9901",
    description: "Federal Capital Project Fund Allocation - Batch 4",
    type: "Deposit",
    account: "CBN Treasury Single Account (TSA)",
    amount: "₦1,450,000,000",
    date: "12 Oct 2026",
    status: "Reconciled",
  },
  {
    ref: "TRX-2026-9900",
    description: "Monthly IPPIS Cloud Infrastructure Hosting & Disaster Recovery",
    type: "Expense",
    account: "Operational Account 01 - Zenith",
    amount: "₦18,450,000",
    date: "11 Oct 2026",
    status: "Approved",
  },
  {
    ref: "TRX-2026-9899",
    description: "National Housing Fund (NHF) Remittance - FMBN",
    type: "Transfer",
    account: "Statutory Deductions - First Bank",
    amount: "₦65,240,000",
    date: "10 Oct 2026",
    status: "Completed",
  },
  {
    ref: "TRX-2026-9898",
    description: "Civil Service Pension Commission RSA Remittance",
    type: "Transfer",
    account: "PenCom Dedicated Holding Account",
    amount: "₦240,150,000",
    date: "09 Oct 2026",
    status: "Completed",
  },
]

export function FinanceAnalytics() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const kpis: KpiItem[] = [
    {
      title: "Consolidated Treasury Balance",
      value: "₦24.6B",
      change: "+8.4%",
      trend: "up",
      comparison: "Central Bank TSA balance",
      icon: Landmark,
      theme: "emerald",
    },
    {
      title: "Monthly Inflows / Deposits",
      value: "₦6.8B",
      change: "+9.7%",
      trend: "up",
      comparison: "Federal subventions & revenue",
      icon: ArrowUpRight,
      theme: "blue",
    },
    {
      title: "Operational Expenditure",
      value: "₦4.6B",
      change: "+6.9%",
      trend: "neutral",
      comparison: "Personnel & capital overhead",
      icon: ArrowDownLeft,
      theme: "purple",
    },
    {
      title: "Net Fiscal Position",
      value: "+₦2.2B",
      change: "+15.8%",
      trend: "up",
      comparison: "Surplus margin",
      icon: Scale,
      theme: "amber",
    },
  ]

  const quickLinks = [
    {
      title: "Accounts List",
      description: "Manage Treasury Single Account (TSA) sub-accounts and designated bank ledgers",
      href: "/admin/finance/accounts-list",
      icon: Landmark,
      badge: "Accounts",
    },
    {
      title: "Account Balances",
      description: "Real-time bank balance reconciliation across Central Bank and partner banks",
      href: "/admin/finance/account-balances",
      icon: Wallet,
      badge: "Real-time",
    },
    {
      title: "Payees & Contractors",
      description: "Directory of authorized institutional payees, civil servants, and verified vendors",
      href: "/admin/finance/payee",
      icon: CreditCard,
    },
    {
      title: "Revenue & Deposits",
      description: "Record and track government subventions, MDA deposits, and statutory allocations",
      href: "/admin/finance/deposit",
      icon: ArrowUpRight,
    },
    {
      title: "Operating Expenses",
      description: "Audit ministry operating expenditures, vouchers, procurement orders, and requisitions",
      href: "/admin/finance/expense",
      icon: Receipt,
    },
    {
      title: "Treasury Transactions",
      description: "General ledger of all verified debit and credit entries with double-entry audit trail",
      href: "/admin/finance/transaction",
      icon: TrendingUp,
    },
    {
      title: "Fund Transfers",
      description: "Process electronic wire transfers between federal ministries, departments, and agencies",
      href: "/admin/finance/transfer",
      icon: ArrowDownLeft,
    },
  ]

  return (
    <div className="space-y-6">
      <AnalyticsHeader
        moduleName="Finance & Treasury Affairs"
        description="Monitor TSA consolidated revenue, personnel expenditure, capital outlays, vendor disbursements, and bank reconciliations."
        badgeText="Treasury Operations"
      />

      <AnalyticsKpiGrid items={kpis} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsChartCard
          title="Consolidated Cash Flow Trend"
          subtitle="Revenue Inflows vs Expenditures vs Net Fiscal Position (in Billions NGN)"
          className="lg:col-span-2"
          badge="Cash Flow"
        >
          {mounted ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyCashFlowData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₦${v}B`} />
                  <Tooltip
                    formatter={(val: any) => [`₦${val}B`, ""]}
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Bar dataKey="revenue" name="Inflows / Deposits" fill="#008751" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenditures" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="net" name="Net Surplus" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] bg-slate-50 animate-pulse rounded-lg" />
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Expenditure Allocation"
          subtitle="October budget disbursement by cost classification"
          badge="Outlays"
        >
          {mounted ? (
            <div className="h-[280px] w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie
                    data={expenseDistribution}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {expenseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`₦${val}M`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 w-full text-[11px] pt-2 border-t border-slate-100">
                {expenseDistribution.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate text-slate-600 font-medium">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[280px] bg-slate-50 animate-pulse rounded-lg" />
          )}
        </AnalyticsChartCard>
      </div>

      {/* Recent Transactions Table */}
      <AnalyticsChartCard
        title="Live Treasury Ledger & Reconciliations"
        subtitle="Recent high-value government vouchers, remittances, and electronic fund transfers"
        badge="General Ledger"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2 font-semibold">Transaction Ref</th>
                <th className="py-2 font-semibold">Description</th>
                <th className="py-2 font-semibold">Classification</th>
                <th className="py-2 font-semibold">Account / Ledger</th>
                <th className="py-2 font-semibold">Amount</th>
                <th className="py-2 font-semibold">Posting Date</th>
                <th className="py-2 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTransactions.map((tx, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 font-mono font-bold text-slate-800">{tx.ref}</td>
                  <td className="py-2.5 font-medium text-slate-800 max-w-xs truncate">{tx.description}</td>
                  <td className="py-2.5">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        tx.type === "Deposit"
                          ? "bg-emerald-100 text-emerald-800"
                          : tx.type === "Expense"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-600 font-mono text-[11px]">{tx.account}</td>
                  <td className="py-2.5 font-bold text-slate-900 font-mono">{tx.amount}</td>
                  <td className="py-2.5 text-slate-500">{tx.date}</td>
                  <td className="py-2.5 text-right">
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px] gap-1 font-semibold">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      {tx.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnalyticsChartCard>

      {/* Quick Navigation Links */}
      <QuickNavGrid links={quickLinks} title="Finance & Treasury Sub-Modules" />
    </div>
  )
}
