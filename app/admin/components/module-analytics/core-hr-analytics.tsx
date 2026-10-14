"use client"

import React, { useState, useEffect } from "react"
import {
  Users,
  Award,
  Plane,
  ArrowRightLeft,
  UserMinus,
  MessageSquareWarning,
  AlertTriangle,
  UserX,
  TrendingUp,
  CheckCircle2,
  Clock,
  Shield,
  Briefcase,
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

const monthlyActionTrends = [
  { month: "May", promotions: 24, transfers: 12, grievances: 5, awards: 18 },
  { month: "Jun", promotions: 32, transfers: 18, grievances: 4, awards: 22 },
  { month: "Jul", promotions: 28, transfers: 15, grievances: 6, awards: 20 },
  { month: "Aug", promotions: 45, transfers: 22, grievances: 3, awards: 35 },
  { month: "Sep", promotions: 52, transfers: 26, grievances: 5, awards: 28 },
  { month: "Oct", promotions: 68, transfers: 31, grievances: 4, awards: 42 },
]

const actionsDistribution = [
  { name: "Promotions", value: 68, color: "#008751" },
  { name: "Awards", value: 42, color: "#f59e0b" },
  { name: "Transfers", value: 31, color: "#3b82f6" },
  { name: "Travel Orders", value: 42, color: "#8b5cf6" },
  { name: "Resignations", value: 18, color: "#64748b" },
  { name: "Disciplinary / Warnings", value: 14, color: "#ef4444" },
]

const recentPersonnelActions = [
  {
    id: "ACT-8921",
    type: "Promotion",
    employee: "Dr. Aliyu Mohammed",
    ministry: "Federal Ministry of Health",
    detail: "Elevated from GL 12 (Senior Medical Officer) to GL 13 (Principal)",
    status: "Approved",
    date: "12 Oct 2026",
  },
  {
    id: "ACT-8920",
    type: "Transfer",
    employee: "Engr. Fatima Bello",
    ministry: "Works & Housing -> Power",
    detail: "Inter-Ministry redeployment to Federal Ministry of Power HQ Abuja",
    status: "Processed",
    date: "11 Oct 2026",
  },
  {
    id: "ACT-8919",
    type: "Award",
    employee: "Sunday Okafor",
    ministry: "Office of the Head of Service",
    detail: "Conferred National Civil Service Merit Award for Innovation",
    status: "Honored",
    date: "09 Oct 2026",
  },
  {
    id: "ACT-8918",
    type: "Travel Order",
    employee: "Ngozi Chukwu",
    ministry: "Foreign Affairs",
    detail: "Official bilateral diplomatic delegate mission to Geneva",
    status: "Approved",
    date: "08 Oct 2026",
  },
  {
    id: "ACT-8917",
    type: "Disciplinary Warning",
    employee: "Ibrahim Sani",
    ministry: "Ministry of Interior",
    detail: "Official administrative query for unexcused duty absence",
    status: "Issued",
    date: "05 Oct 2026",
  },
]

export function CoreHRAnalytics() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const kpis: KpiItem[] = [
    {
      title: "Promotions Processed",
      value: "68",
      change: "+16.2%",
      trend: "up",
      comparison: "2026 Annual Review",
      icon: TrendingUp,
      theme: "emerald",
    },
    {
      title: "Merit Awards Conferred",
      value: "42",
      change: "+8.5%",
      trend: "up",
      comparison: "Civil Service Honours",
      icon: Award,
      theme: "amber",
    },
    {
      title: "Inter-MDA Transfers",
      value: "31",
      change: "+5",
      trend: "up",
      comparison: "Active deployments",
      icon: ArrowRightLeft,
      theme: "blue",
    },
    {
      title: "Active Grievances / Queries",
      value: "7",
      change: "-3",
      trend: "down",
      comparison: "88% resolution rate",
      icon: MessageSquareWarning,
      theme: "rose",
    },
  ]

  const quickLinks = [
    {
      title: "Promotions",
      description: "Manage civil service promotions, grade level step advances, and elevation boards",
      href: "/admin/core-hr/promotions",
      icon: TrendingUp,
      badge: "Cadre Review",
    },
    {
      title: "Merit Awards",
      description: "Recognize outstanding federal officers with excellence awards and commendations",
      href: "/admin/core-hr/award",
      icon: Award,
    },
    {
      title: "Official Travel",
      description: "Issue and audit duty travel orders, allowances, and international delegations",
      href: "/admin/core-hr/travel",
      icon: Plane,
    },
    {
      title: "Transfers & Postings",
      description: "Process inter-ministry transfers, state office postings, and redeployments",
      href: "/admin/core-hr/transfer",
      icon: ArrowRightLeft,
    },
    {
      title: "Resignations",
      description: "Manage voluntary resignations, exit clearance, and pension handovers",
      href: "/admin/core-hr/resignations",
      icon: UserMinus,
    },
    {
      title: "Complaints & Grievances",
      description: "Track staff complaints, dispute resolutions, and workplace harmony cases",
      href: "/admin/core-hr/complaints",
      icon: MessageSquareWarning,
    },
    {
      title: "Official Warnings",
      description: "Document administrative queries, disciplinary actions, and probationary notices",
      href: "/admin/core-hr/warnings",
      icon: AlertTriangle,
    },
    {
      title: "Terminations",
      description: "Process statutory dismissals, compulsorily retired personnel, and service terminations",
      href: "/admin/core-hr/terminations",
      icon: UserX,
    },
  ]

  return (
    <div className="space-y-6">
      <AnalyticsHeader
        moduleName="Core HR & Personnel Affairs"
        description="Oversee civil service elevations, merit awards, inter-ministerial transfers, grievances, and administrative disciplinary records."
        badgeText="Core HR Intelligence"
      />

      <AnalyticsKpiGrid items={kpis} />

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsChartCard
          title="Personnel Actions Velocity"
          subtitle="Monthly promotions, transfers, awards and grievances across federal MDAs"
          className="lg:col-span-2"
          badge="Actions Timeline"
        >
          {mounted ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyActionTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Bar dataKey="promotions" name="Promotions" fill="#008751" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="awards" name="Awards" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="transfers" name="Transfers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="grievances" name="Grievances" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] bg-slate-50 animate-pulse rounded-lg" />
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="HR Actions Distribution"
          subtitle="Breakdown by administrative personnel category"
          badge="Category Share"
        >
          {mounted ? (
            <div className="h-[280px] w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie
                    data={actionsDistribution}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {actionsDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 w-full text-[11px] pt-2 border-t border-slate-100">
                {actionsDistribution.map((item, idx) => (
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

      {/* Recent Personnel Actions Table */}
      <AnalyticsChartCard
        title="Recent Personnel Action Board Records"
        subtitle="Live feed of gazetted promotions, transfers, awards, and disciplinary resolutions"
        badge="Live Actions"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2 font-semibold">Action Ref</th>
                <th className="py-2 font-semibold">Type</th>
                <th className="py-2 font-semibold">Employee</th>
                <th className="py-2 font-semibold">MDA / Ministry</th>
                <th className="py-2 font-semibold">Action Summary</th>
                <th className="py-2 font-semibold">Date</th>
                <th className="py-2 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPersonnelActions.map((action, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 font-mono font-bold text-slate-800">{action.id}</td>
                  <td className="py-2.5 font-semibold text-slate-900">{action.type}</td>
                  <td className="py-2.5 font-medium text-emerald-900">{action.employee}</td>
                  <td className="py-2.5 text-slate-600">{action.ministry}</td>
                  <td className="py-2.5 text-slate-700 max-w-xs truncate">{action.detail}</td>
                  <td className="py-2.5 text-slate-500">{action.date}</td>
                  <td className="py-2.5 text-right">
                    <Badge
                      className={`text-[10px] font-semibold ${
                        action.status === "Approved" || action.status === "Honored"
                          ? "bg-emerald-100 text-emerald-800"
                          : action.status === "Processed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {action.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnalyticsChartCard>

      {/* Quick Navigation Links */}
      <QuickNavGrid links={quickLinks} title="Core HR Sub-Modules & Operations" />
    </div>
  )
}
