"use client"

import React, { useState, useEffect } from "react"
import {
  FileBarChart,
  Calendar,
  Briefcase,
  ClipboardList,
  CheckSquare,
  Users,
  CreditCard,
  DollarSign,
  PiggyBank,
  RefreshCw,
  Heart,
  DownloadCloud,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  AnalyticsHeader,
  AnalyticsKpiGrid,
  AnalyticsChartCard,
  QuickNavGrid,
  KpiItem,
} from "./analytics-ui"
import { Badge } from "@/components/ui/badge"

const reportGenerationData = [
  { category: "Attendance", generated: 480, scheduled: 32 },
  { category: "Employees", generated: 620, scheduled: 48 },
  { category: "Payroll/Acct", generated: 840, scheduled: 64 },
  { category: "Expense/Deposit", generated: 390, scheduled: 24 },
  { category: "Pension", generated: 510, scheduled: 40 },
  { category: "Project/Task", generated: 310, scheduled: 16 },
]

const reportTypeBreakdown = [
  { name: "Financial & Accounts", value: 38, color: "#10b981" },
  { name: "Staff & Workforce", value: 29, color: "#3b82f6" },
  { name: "Statutory Pension", value: 18, color: "#8b5cf6" },
  { name: "Operational Attendance", value: 15, color: "#f59e0b" },
]

const statutoryCatalog = [
  {
    reportName: "Federal Consolidated Nominal Roll",
    domain: "Workforce",
    frequency: "Monthly / Real-Time",
    lastRun: "Oct 12, 2026",
    format: "Excel / PDF / CSV",
    recipient: "OHCSF & Budget Office",
    status: "Audited",
  },
  {
    reportName: "PenCom Consolidated Remittance Schedule",
    domain: "Pension",
    frequency: "Monthly",
    lastRun: "Sep 30, 2026",
    format: "PenCom EDI XML",
    recipient: "National Pension Commission",
    status: "Compliant",
  },
  {
    reportName: "MDA Biometric Attendance & Lateness Audit",
    domain: "Timesheets",
    frequency: "Weekly",
    lastRun: "Oct 10, 2026",
    format: "Excel / Dashboard",
    recipient: "Permanent Secretaries",
    status: "Automated",
  },
  {
    reportName: "Treasury Single Account (TSA) Payroll Reconciliation",
    domain: "Financial",
    frequency: "Monthly",
    lastRun: "Oct 01, 2026",
    format: "Central Bank Wire CSV",
    recipient: "Accountant-General (OAGF)",
    status: "Reconciled",
  },
]

export function HRReportsAnalytics() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(false)
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  const kpis: KpiItem[] = [
    {
      title: "Total Report Streams",
      value: "10 Streams",
      change: "100%",
      trend: "neutral",
      comparison: "active statutory feeds",
      icon: FileBarChart,
      theme: "emerald",
    },
    {
      title: "Generated Reports (Q3/Q4)",
      value: "3,150",
      change: "+15.8%",
      trend: "up",
      comparison: "across 42 Federal MDAs",
      icon: DownloadCloud,
      theme: "blue",
    },
    {
      title: "Scheduled Automations",
      value: "48 Jobs",
      change: "+8 new",
      trend: "up",
      comparison: "cron / batch syncs",
      icon: RefreshCw,
      theme: "purple",
    },
    {
      title: "Auditor-General Compliance",
      value: "100%",
      change: "Passed",
      trend: "up",
      comparison: "full trail integrity",
      icon: CheckCircle2,
      theme: "amber",
    },
  ]

  const quickLinks = [
    {
      title: "Attendance Report",
      description: "Employee attendance statistics and punctuality logs",
      href: "/admin/hr-reports/attendance",
      icon: Calendar,
      badge: "Real-time",
    },
    {
      title: "Training Report",
      description: "Civil service capacity development & certifications",
      href: "/admin/hr-reports/training",
      icon: Briefcase,
      badge: "Courses",
    },
    {
      title: "Project Report",
      description: "Project timelines, capital budget & milestone delivery",
      href: "/admin/hr-reports/project",
      icon: ClipboardList,
      badge: "Strategic",
    },
    {
      title: "Task Report",
      description: "Productivity tracking and action item completion rates",
      href: "/admin/hr-reports/task",
      icon: CheckSquare,
      badge: "Productivity",
    },
    {
      title: "Employees Report",
      description: "Nominal roll, cadre profiles and grade distribution",
      href: "/admin/hr-reports/employees",
      icon: Users,
      badge: "Nominal Roll",
    },
    {
      title: "Account Report",
      description: "Financial account ledger statements & balances",
      href: "/admin/hr-reports/account",
      icon: CreditCard,
      badge: "Ledgers",
    },
    {
      title: "Expense Report",
      description: "Operational expenditure and overheads allocation",
      href: "/admin/hr-reports/expense",
      icon: DollarSign,
      badge: "Overheads",
    },
    {
      title: "Deposit Report",
      description: "Government receipts, warrant releases & allocations",
      href: "/admin/hr-reports/deposit",
      icon: PiggyBank,
      badge: "Inflows",
    },
    {
      title: "Transaction Report",
      description: "Audit trail of fiscal transactions and voucher releases",
      href: "/admin/hr-reports/transaction",
      icon: RefreshCw,
      badge: "Audit Trail",
    },
    {
      title: "Pension Report",
      description: "PenCom monthly remittances and retired officer schedules",
      href: "/admin/hr-reports/pension",
      icon: Heart,
      badge: "PenCom Feed",
    },
  ]

  return (
    <div className="space-y-6">
      <AnalyticsHeader
        moduleName="HR Reports & Intelligence"
        description="Comprehensive reporting hub providing executive insights, statutory compliance schedules, financial ledgers, and workforce metrics."
      />

      <AnalyticsKpiGrid kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsChartCard
          title="Report Generation Activity by Domain"
          subtitle="Monthly volume of generated ad-hoc reports vs recurring scheduled automated jobs"
          className="lg:col-span-2"
        >
          {mounted ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportGenerationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "12px" }} />
                  <Bar dataKey="generated" name="Ad-Hoc Generated" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="scheduled" name="Scheduled Automated" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-sm text-gray-400">
              Loading report volume...
            </div>
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Reporting Domain Distribution"
          subtitle="Breakdown of queries across statutory, workforce, and finance"
        >
          {mounted ? (
            <div className="h-72 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={reportTypeBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {reportTypeBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 text-xs text-gray-600 mt-2 w-full px-2">
                {reportTypeBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-sm text-gray-400">
              Loading domain breakdown...
            </div>
          )}
        </AnalyticsChartCard>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Key Statutory & Executive Reports Catalog</h3>
            <p className="text-xs text-gray-500">Official reporting instruments submitted to Federal oversight bodies</p>
          </div>
          <Badge variant="outline" className="text-xs text-emerald-700 bg-emerald-50 border-emerald-200">
            Compliance Ready
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b">
              <tr>
                <th className="px-5 py-3">Report Instrument</th>
                <th className="px-4 py-3">Domain</th>
                <th className="px-4 py-3">Frequency</th>
                <th className="px-4 py-3">Last Reconciled</th>
                <th className="px-4 py-3">Supported Formats</th>
                <th className="px-4 py-3">Receiving Authority</th>
                <th className="px-5 py-3 text-center">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {statutoryCatalog.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{item.reportName}</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                      {item.domain}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs">{item.frequency}</td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs font-mono">{item.lastRun}</td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs">{item.format}</td>
                  <td className="px-4 py-3.5 text-gray-600 font-medium">{item.recipient}</td>
                  <td className="px-5 py-3.5 text-center">
                    <Badge className="bg-emerald-100 text-emerald-800 border-none">
                      {item.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <QuickNavGrid links={quickLinks} />
    </div>
  )
}
