"use client"

import React, { useState, useEffect } from "react"
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Users,
  BadgeDollarSign,
  ClipboardList,
  FileText,
  Building,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
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
import { Button } from "@/components/ui/button"
import {
  AnalyticsHeader,
  AnalyticsKpiGrid,
  AnalyticsChartCard,
  QuickNavGrid,
  KpiItem,
} from "./analytics-ui"

const monthlyTrendData = [
  { month: "May", gross: 4.12, net: 3.52, deductions: 0.60 },
  { month: "Jun", gross: 4.25, net: 3.61, deductions: 0.64 },
  { month: "Jul", gross: 4.30, net: 3.65, deductions: 0.65 },
  { month: "Aug", gross: 4.45, net: 3.78, deductions: 0.67 },
  { month: "Sep", gross: 4.60, net: 3.91, deductions: 0.69 },
  { month: "Oct", gross: 4.85, net: 4.12, deductions: 0.73 },
]

const gradeLevelData = [
  { level: "GL 01-05", amount: 0.85, count: 4850 },
  { level: "GL 06-09", amount: 1.42, count: 5200 },
  { level: "GL 10-13", amount: 1.28, count: 2640 },
  { level: "GL 14-16", amount: 0.92, count: 1220 },
  { level: "GL 17 / Dir", amount: 0.38, count: 380 },
]

const deductionBreakdown = [
  { name: "PAYE Tax", value: 380, color: "#008751" },
  { name: "Pension RSA (8%)", value: 240, color: "#10b981" },
  { name: "National Housing (NHF)", value: 65, color: "#3b82f6" },
  { name: "Union Dues & Misc", value: 45, color: "#8b5cf6" },
]

const recentPayrollBatches = [
  {
    batchId: "PAY-2026-10-OCT",
    description: "Federal Civil Service October 2026 Main Run",
    payees: 14290,
    amount: "₦4,124,560,000",
    status: "Completed",
    date: "25 Oct 2026",
  },
  {
    batchId: "PAY-2026-09-SEP",
    description: "Federal Civil Service September 2026 Main Run",
    payees: 14210,
    amount: "₦3,912,400,000",
    status: "Completed",
    date: "24 Sep 2026",
  },
  {
    batchId: "PAY-2026-08-AUG",
    description: "Federal Civil Service August 2026 Main Run",
    payees: 14150,
    amount: "₦3,780,200,000",
    status: "Completed",
    date: "25 Aug 2026",
  },
  {
    batchId: "BON-2026-Q3-PRO",
    description: "Q3 Civil Service Performance Bonus Run",
    payees: 1840,
    amount: "₦142,800,000",
    status: "Completed",
    date: "15 Aug 2026",
  },
]

export function PayrollAnalytics() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const kpis: KpiItem[] = [
    {
      title: "Gross Monthly Payroll",
      value: "₦4.85B",
      change: "+5.4%",
      trend: "up",
      comparison: "vs last month",
      icon: DollarSign,
      theme: "emerald",
    },
    {
      title: "Net Disbursed",
      value: "₦4.12B",
      change: "+5.3%",
      trend: "up",
      comparison: "98.9% success rate",
      icon: CreditCard,
      theme: "blue",
    },
    {
      title: "Total Deductions & Tax",
      value: "₦730M",
      change: "+2.8%",
      trend: "neutral",
      comparison: "PAYE, RSA, NHF",
      icon: TrendingUp,
      theme: "purple",
    },
    {
      title: "Enrolled Active Payees",
      value: "14,290",
      change: "+120",
      trend: "up",
      comparison: "Verified civil servants",
      icon: Users,
      theme: "amber",
    },
  ]

  const quickLinks = [
    {
      title: "New Payment",
      description: "Process new salary payments, promotions, or bonus disbursements",
      href: "/admin/payroll/new-payment",
      icon: BadgeDollarSign,
      badge: "Action",
    },
    {
      title: "Payment History",
      description: "Audit completed payroll batches, payment status, and bank logs",
      href: "/admin/payroll/payment-history",
      icon: ClipboardList,
      badge: "Archives",
    },
    {
      title: "Payslip Management",
      description: "Generate and distribute monthly digital payslips with deductions",
      href: "/admin/payroll/payslip",
      icon: FileText,
      badge: "Self-Service",
    },
  ]

  return (
    <div className="space-y-6">
      <AnalyticsHeader
        moduleName="Payroll & Compensation"
        description="Monitor federal payroll disbursements, statutory deductions, bank verifications, and salary trends across ministries."
        badgeText="Payroll Intelligence"
      />

      <AnalyticsKpiGrid items={kpis} />

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsChartCard
          title="6-Month Payroll Disbursement Trend"
          subtitle="Gross payroll vs Net disbursements vs Statutory deductions (in Billions NGN)"
          className="lg:col-span-2"
          badge="Monthly Trend"
        >
          {mounted ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₦${v}B`} />
                  <Tooltip
                    formatter={(val: any) => [`₦${val}B`, ""]}
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Bar dataKey="gross" name="Gross Payroll" fill="#008751" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="net" name="Net Disbursed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="deductions" name="Total Deductions" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] bg-slate-50 animate-pulse rounded-lg" />
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Deductions & Statutory Taxes"
          subtitle="Breakdown of October deductions (Total ₦730M)"
          badge="Deductions"
        >
          {mounted ? (
            <div className="h-[280px] w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie
                    data={deductionBreakdown}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {deductionBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`₦${val}M`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 w-full text-[11px] pt-2 border-t border-slate-100">
                {deductionBreakdown.map((item, idx) => (
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

      {/* Grade Level & Recent Batches Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsChartCard
          title="Disbursement by Grade Level Cadre"
          subtitle="Payroll volume & employee count across salary bands"
          className="lg:col-span-1"
          badge="Cadre Distribution"
        >
          {mounted ? (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeLevelData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `₦${v}B`} />
                  <YAxis type="category" dataKey="level" stroke="#64748b" fontSize={11} width={75} />
                  <Tooltip formatter={(val: any) => [`₦${val}B`, "Total Payout"]} />
                  <Bar dataKey="amount" name="Payout (₦B)" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[260px] bg-slate-50 animate-pulse rounded-lg" />
          )}
        </AnalyticsChartCard>

        {/* Recent Payroll Batches Table */}
        <AnalyticsChartCard
          title="Recent Executed Payroll Runs"
          subtitle="Audit log of official automated salary batches"
          className="lg:col-span-2"
          badge="Execution Log"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2 font-semibold">Batch ID</th>
                  <th className="py-2 font-semibold">Description</th>
                  <th className="py-2 font-semibold">Payees</th>
                  <th className="py-2 font-semibold">Total Payout</th>
                  <th className="py-2 font-semibold">Disbursed Date</th>
                  <th className="py-2 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPayrollBatches.map((batch, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 font-mono font-bold text-slate-800">{batch.batchId}</td>
                    <td className="py-2.5 text-slate-700 font-medium">{batch.description}</td>
                    <td className="py-2.5 text-slate-600 font-mono">{batch.payees.toLocaleString()}</td>
                    <td className="py-2.5 font-bold text-emerald-800 font-mono">{batch.amount}</td>
                    <td className="py-2.5 text-slate-500">{batch.date}</td>
                    <td className="py-2.5 text-right">
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px] gap-1 font-semibold">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        {batch.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnalyticsChartCard>
      </div>

      {/* Quick Navigation Links */}
      <QuickNavGrid links={quickLinks} title="Payroll Operations & Sub-Modules" />
    </div>
  )
}
