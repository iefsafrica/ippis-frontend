"use client"

import React, { useMemo, useState, useEffect } from "react"
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Users,
  BadgeDollarSign,
  ClipboardList,
  FileText,
  CheckCircle2,
  Upload,
} from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
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
import { DeductionsCsvUploadDialog } from "@/app/admin/payroll/components/deductions-csv-upload-dialog"
import { useGetPayrollRuns } from "@/services/hooks/payroll/usePayrollRuns"
import { usePayslips } from "@/services/hooks/payroll/usePayslips"
import { useGetPayments } from "@/services/hooks/payroll"
import { useEmployeesList } from "@/services/hooks/employees/useEmployees"

function formatNairaCompact(amount: number): string {
  if (!amount || Number.isNaN(amount)) return "₦0.00"
  if (amount >= 1_000_000_000) return `₦${(amount / 1_000_000_000).toFixed(2)}B`
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(2)}M`
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(1)}K`
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatNairaExact(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0))
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function PayrollAnalytics() {
  const [mounted, setMounted] = useState(false)
  const [showDeductionsUpload, setShowDeductionsUpload] = useState(false)
  useEffect(() => setMounted(true), [])

  const { data: runsRes, refetch: refetchRuns } = useGetPayrollRuns()
  const { data: payslipsRes, refetch: refetchPayslips } = usePayslips({ limit: 200 })
  const { data: paymentsRes, refetch: refetchPayments } = useGetPayments()
  const { data: employeesRes } = useEmployeesList(1)

  const handleRefreshAll = () => {
    void refetchRuns()
    void refetchPayslips()
    void refetchPayments()
  }

  const runs = useMemo(() => {
    const raw = (runsRes as any)?.data?.runs || (runsRes as any)?.data || (runsRes as any)?.runs || []
    return Array.isArray(raw) ? raw : []
  }, [runsRes])

  const payslips = useMemo(() => {
    const raw =
      (payslipsRes as any)?.data?.payslips ||
      (payslipsRes as any)?.payslips ||
      (payslipsRes as any)?.data ||
      []
    return Array.isArray(raw) ? raw : []
  }, [payslipsRes])

  const payments = useMemo(() => {
    const raw =
      (paymentsRes as any)?.data?.payments ||
      (paymentsRes as any)?.payments ||
      (paymentsRes as any)?.data ||
      []
    return Array.isArray(raw) ? raw : []
  }, [paymentsRes])

  const activeEmployeesCount = useMemo(() => {
    const list = employeesRes?.employees || []
    const active = list.filter((e) => String(e.status || "").toLowerCase() === "active")
    return active.length || list.length
  }, [employeesRes?.employees])

  // Source records: prefer payslips, fall back to payments
  const sourceRecords = useMemo(() => {
    return payslips.length > 0 ? payslips : payments
  }, [payslips, payments])

  const totals = useMemo(() => {
    let gross = 0
    let net = 0
    let deductions = 0

    sourceRecords.forEach((rec: any) => {
      const g = Number(rec.gross_pay ?? rec.total_earnings ?? rec.amount ?? 0)
      const d = Number(rec.total_deductions ?? rec.deductions ?? rec.deduction_amount ?? 0)
      const n = Number(rec.net_pay ?? rec.netPay ?? Math.max(0, g - d))
      gross += g
      deductions += d
      net += n
    })

    if (gross === 0 && runs.length > 0) {
      runs.forEach((run: any) => {
        const g = Number(run.total_gross ?? run.gross_amount ?? run.total_amount ?? 0)
        const d = Number(run.total_deductions ?? 0)
        const n = Number(run.total_net ?? Math.max(0, g - d))
        gross += g
        deductions += d
        net += n
      })
    }

    return { gross, net, deductions }
  }, [sourceRecords, runs])

  const monthlyTrendData = useMemo(() => {
    const map = new Map<string, { month: string; gross: number; net: number; deductions: number; sortKey: string }>()

    sourceRecords.forEach((rec: any) => {
      const rawDate = rec.payment_date || rec.created_at || rec.generated_date
      let label = rec.period || ""
      let sortKey = label

      if (rec.month && rec.year) {
        const mIdx = Number(rec.month) - 1
        label = `${MONTH_NAMES[mIdx] || rec.month} ${rec.year}`
        sortKey = `${rec.year}-${String(rec.month).padStart(2, "0")}`
      } else if (rawDate) {
        const d = new Date(rawDate)
        if (!Number.isNaN(d.getTime())) {
          label = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
          sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
        }
      }
      if (!label) label = "Current"

      const existing = map.get(sortKey) || { month: label, gross: 0, net: 0, deductions: 0, sortKey }
      const g = Number(rec.gross_pay ?? rec.total_earnings ?? rec.amount ?? 0)
      const d = Number(rec.total_deductions ?? rec.deductions ?? rec.deduction_amount ?? 0)
      const n = Number(rec.net_pay ?? rec.netPay ?? Math.max(0, g - d))
      existing.gross += g
      existing.deductions += d
      existing.net += n
      map.set(sortKey, existing)
    })

    return Array.from(map.values())
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-6)
  }, [sourceRecords])

  const deductionBreakdown = useMemo(() => {
    let paye = 0
    let pension = 0
    let nhis = 0
    let loans = 0

    sourceRecords.forEach((rec: any) => {
      paye += Number(rec.paye_tax ?? rec.income_tax ?? rec.incomeTax ?? 0)
      pension += Number(rec.pension ?? rec.pension_contribution ?? 0)
      nhis += Number(rec.nhis ?? rec.nhf ?? 0)
      loans += Number(rec.loan_deduction ?? rec.loanDeduction ?? rec.other_deductions ?? 0)
    })

    const items = [
      { name: "PAYE Tax", value: paye, color: "#0B4628" },
      { name: "Pension RSA", value: pension, color: "#10B981" },
      { name: "NHIS / Housing", value: nhis, color: "#3B82F6" },
      { name: "Loans & Other", value: loans, color: "#8B5CF6" },
    ].filter((item) => item.value > 0)

    if (items.length === 0 && totals.deductions > 0) {
      return [{ name: "Total Deductions", value: totals.deductions, color: "#0B4628" }]
    }
    return items
  }, [sourceRecords, totals.deductions])

  const gradeLevelData = useMemo(() => {
    const bands = new Map<string, { level: string; amount: number; count: number }>()

    sourceRecords.forEach((rec: any) => {
      const grade = rec.grade_level || rec.grade || rec.cadre || "Unassigned"
      const current = bands.get(String(grade)) || { level: String(grade), amount: 0, count: 0 }
      const g = Number(rec.gross_pay ?? rec.total_earnings ?? rec.amount ?? 0)
      current.amount += g
      current.count += 1
      bands.set(String(grade), current)
    })

    return Array.from(bands.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6)
  }, [sourceRecords])

  const recentPayrollBatches = useMemo(() => {
    return runs.slice(0, 6).map((run: any) => {
      const period = run.period || (run.month && run.year ? `${MONTH_NAMES[Number(run.month) - 1] || run.month} ${run.year}` : "Payroll Run")
      const totalAmt = Number(run.total_net ?? run.total_gross ?? run.total_amount ?? 0)
      const dateStr = run.approved_at || run.payment_date || run.created_at
      return {
        batchId: run.reference || run.run_code || `RUN-${run.id}`,
        description: run.description || run.title || `${period} Payroll Cycle`,
        payees: Number(run.employee_count ?? run.payees_count ?? run.total_employees ?? 0),
        amount: formatNairaExact(totalAmt),
        status: run.status || "Prepared",
        date: dateStr && !Number.isNaN(new Date(dateStr).getTime()) ? new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—",
      }
    })
  }, [runs])

  const kpis: KpiItem[] = [
    {
      title: "Gross Payroll Volume",
      value: formatNairaCompact(totals.gross),
      change: `${sourceRecords.length} records`,
      trend: "up",
      comparison: "Live computed total",
      icon: DollarSign,
      theme: "emerald",
    },
    {
      title: "Net Disbursed Payouts",
      value: formatNairaCompact(totals.net),
      change: totals.gross > 0 ? `${Math.round((totals.net / totals.gross) * 100)}% of gross` : "0%",
      trend: "up",
      comparison: "After statutory deductions",
      icon: CreditCard,
      theme: "blue",
    },
    {
      title: "Total Statutory Deductions",
      value: formatNairaCompact(totals.deductions),
      change: totals.gross > 0 ? `${Math.round((totals.deductions / totals.gross) * 100)}% rate` : "0%",
      trend: "neutral",
      comparison: "PAYE, Pension, NHIS, Loans",
      icon: TrendingUp,
      theme: "purple",
    },
    {
      title: "Enrolled Active Payees",
      value: activeEmployeesCount.toLocaleString(),
      change: `${runs.length} runs`,
      trend: "up",
      comparison: "Verified civil servants",
      icon: Users,
      theme: "amber",
    },
  ]

  const quickLinks = [
    {
      title: "Payroll Runs",
      description: "Prepare, review, and approve monthly institutional payroll cycles",
      href: "/admin/payroll/runs",
      icon: ClipboardList,
      badge: "Cycles",
    },
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
      badge: "Payslips",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <AnalyticsHeader
            moduleName="Payroll & Compensation"
            description="Live federal payroll disbursements, statutory deductions, payslips, and payroll cycle runs."
            badgeText="Live Payroll Data"
            onRefresh={handleRefreshAll}
          />
        </div>
        <Button
          onClick={() => setShowDeductionsUpload(true)}
          className="rounded-full bg-[#0B4628] hover:bg-[#08351E] text-white shadow-sm shrink-0"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Deductions CSV
        </Button>
      </div>

      <AnalyticsKpiGrid items={kpis} />

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsChartCard
          title="Payroll Disbursement Trend"
          subtitle="Live Gross payroll vs Net disbursements vs Deductions (NGN)"
          className="lg:col-span-2"
          badge="Live Trend"
        >
          {!mounted ? (
            <div className="h-[280px] bg-slate-50 animate-pulse rounded-lg" />
          ) : monthlyTrendData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-sm text-slate-400">
              No payslip or payment records found yet.
            </div>
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => formatNairaCompact(Number(v))} />
                  <Tooltip
                    formatter={(val: any) => [formatNairaExact(Number(val)), ""]}
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Bar dataKey="gross" name="Gross Payroll" fill="#0B4628" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="net" name="Net Disbursed" fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="deductions" name="Total Deductions" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Deductions & Statutory Taxes"
          subtitle={`Total deductions: ${formatNairaCompact(totals.deductions)}`}
          badge="Deductions"
        >
          {!mounted ? (
            <div className="h-[280px] bg-slate-50 animate-pulse rounded-lg" />
          ) : deductionBreakdown.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-sm text-slate-400 text-center px-4">
              No deduction records found yet. Upload a deductions CSV or generate payslips.
            </div>
          ) : (
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
                  <Tooltip formatter={(val: any) => [formatNairaExact(Number(val)), ""]} />
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
          )}
        </AnalyticsChartCard>
      </div>

      {/* Grade Level & Recent Batches Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsChartCard
          title="Disbursement by Grade Level"
          subtitle="Live payroll volume across recorded grade levels"
          className="lg:col-span-1"
          badge="Grade Distribution"
        >
          {!mounted ? (
            <div className="h-[260px] bg-slate-50 animate-pulse rounded-lg" />
          ) : gradeLevelData.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-sm text-slate-400">
              No grade-level disbursement data yet.
            </div>
          ) : (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeLevelData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickFormatter={(v) => formatNairaCompact(Number(v))} />
                  <YAxis type="category" dataKey="level" stroke="#64748b" fontSize={11} width={75} />
                  <Tooltip formatter={(val: any) => [formatNairaExact(Number(val)), "Total Payout"]} />
                  <Bar dataKey="amount" name="Payout" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </AnalyticsChartCard>

        {/* Recent Payroll Batches Table */}
        <AnalyticsChartCard
          title="Recent Payroll Runs"
          subtitle="Live log of payroll cycles from /api/payroll/runs"
          className="lg:col-span-2"
          badge="Execution Log"
        >
          {recentPayrollBatches.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No payroll runs recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-2 font-semibold">Batch ID</th>
                    <th className="py-2 font-semibold">Description</th>
                    <th className="py-2 font-semibold">Payees</th>
                    <th className="py-2 font-semibold">Total Payout</th>
                    <th className="py-2 font-semibold">Date</th>
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
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px] gap-1 font-semibold capitalize">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          {batch.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AnalyticsChartCard>
      </div>

      {/* Quick Navigation Links */}
      <QuickNavGrid links={quickLinks} title="Payroll Operations & Sub-Modules" />

      <DeductionsCsvUploadDialog
        open={showDeductionsUpload}
        onOpenChange={setShowDeductionsUpload}
        onSuccess={handleRefreshAll}
      />
    </div>
  )
}
