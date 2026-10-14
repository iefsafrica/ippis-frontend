"use client"

import React, { useState, useEffect } from "react"
import {
  LifeBuoy,
  Clock,
  CheckCircle,
  AlertTriangle,
  Flame,
  MessageSquare,
  ShieldAlert,
  BookOpen,
  FileText,
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

const ticketTrends = [
  { week: "Wk 38", received: 142, resolved: 138 },
  { week: "Wk 39", received: 168, resolved: 155 },
  { week: "Wk 40", received: 195, resolved: 189 },
  { week: "Wk 41", received: 184, resolved: 178 },
  { week: "Wk 42", received: 210, resolved: 204 },
  { week: "Wk 43", received: 176, resolved: 182 },
]

const categoryBreakdown = [
  { name: "Payroll Discrepancy", value: 38, color: "#ef4444" },
  { name: "NIN / Biometric Sync", value: 27, color: "#3b82f6" },
  { name: "Transfer / Posting", value: 16, color: "#8b5cf6" },
  { name: "Pension & Gratuity", value: 12, color: "#10b981" },
  { name: "Portal Access & Auth", value: 7, color: "#f59e0b" },
]

const criticalEscalations = [
  {
    ticketId: "TKT-2026-9041",
    subject: "Gross Salary Variance following Grade Level 12 Step 4 Promotion",
    employee: "Engr. Fatima Bello",
    mda: "Federal Ministry of Works",
    priority: "Urgent",
    status: "In Progress",
    assignedTo: "Payroll Lead Ops",
    created: "2 hrs ago",
    slaRemaining: "1 hr 45 min",
  },
  {
    ticketId: "TKT-2026-9038",
    subject: "Biometric Data Mismatch with NIMC National Identification Service",
    employee: "Dr. Chinedu Eze",
    mda: "National Hospital Abuja",
    priority: "High",
    status: "Under Review",
    assignedTo: "NIN Integration Desk",
    created: "3 hrs ago",
    slaRemaining: "4 hrs 10 min",
  },
  {
    ticketId: "TKT-2026-9029",
    subject: "NHF & Pension Deductions Recalibration Request",
    employee: "Mrs. Halima Aliyu",
    mda: "Ministry of Foreign Affairs",
    priority: "Medium",
    status: "Open",
    assignedTo: "Deductions Audit Team",
    created: "5 hrs ago",
    slaRemaining: "18 hrs",
  },
  {
    ticketId: "TKT-2026-9015",
    subject: "Retired Officer Last Pay Certificate (LPC) Transmission to PenCom",
    employee: "Col. (Rtd) James Danjuma",
    mda: "Ministry of Defence",
    priority: "High",
    status: "In Progress",
    assignedTo: "Pension Liaison Unit",
    created: "7 hrs ago",
    slaRemaining: "8 hrs 20 min",
  },
]

export function SupportTicketsAnalytics() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(false)
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  const kpis: KpiItem[] = [
    {
      title: "Total Support Requests",
      value: "2,418",
      change: "+8.2%",
      trend: "up",
      comparison: "last 30 days",
      icon: LifeBuoy,
      theme: "emerald",
    },
    {
      title: "Resolution SLA Compliance",
      value: "96.4%",
      change: "+1.8%",
      trend: "up",
      comparison: "target: >95.0%",
      icon: CheckCircle,
      theme: "blue",
    },
    {
      title: "Mean Time to Resolve (MTTR)",
      value: "3.8 hrs",
      change: "-24.1%",
      trend: "up",
      comparison: "faster resolution",
      icon: Clock,
      theme: "purple",
    },
    {
      title: "Active Urgent Escalations",
      value: "9",
      change: "-3",
      trend: "up",
      comparison: "immediate priority",
      icon: Flame,
      theme: "rose",
    },
  ]

  const quickLinks = [
    {
      title: "All Support Tickets",
      description: "Manage global queue, filter by MDA, and triage requests",
      href: "/admin/support-tickets",
      icon: LifeBuoy,
      badge: "Global Queue",
    },
    {
      title: "My Assigned Tickets",
      description: "View and resolve tickets assigned to your admin desk",
      href: "/admin/support-tickets/my-tickets",
      icon: MessageSquare,
      badge: "Direct Assignment",
    },
    {
      title: "Knowledge Base",
      description: "Standard operating procedures, FAQs, and self-service guides",
      href: "/admin/support-tickets/knowledge-base",
      icon: BookOpen,
      badge: "Knowledge Repos",
    },
    {
      title: "SLA & Resolution Reports",
      description: "Audit agent performance, category volume & response audits",
      href: "/admin/support-tickets/reports",
      icon: FileText,
      badge: "Audit Ready",
    },
  ]

  return (
    <div className="space-y-6">
      <AnalyticsHeader
        moduleName="Support Tickets"
        description="Monitor civil servant service desk throughput, triage critical payroll & verification inquiries, and maintain high SLA compliance."
      />

      <AnalyticsKpiGrid kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsChartCard
          title="Ticket Inflow vs Resolution Throughput"
          subtitle="Weekly comparison of new support submissions vs successfully resolved cases"
          className="lg:col-span-2"
        >
          {mounted ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ticketTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
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
                  <Bar dataKey="received" name="Tickets Logged" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resolved" name="Tickets Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-sm text-gray-400">
              Loading throughput trends...
            </div>
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Inquiry Subject Taxonomy"
          subtitle="Classification of employee requests across operational domains"
        >
          {mounted ? (
            <div className="h-72 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 text-xs text-gray-600 mt-2 w-full px-2">
                {categoryBreakdown.map((item) => (
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
              Loading category breakdown...
            </div>
          )}
        </AnalyticsChartCard>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Priority Triage & Escalation Desk</h3>
            <p className="text-xs text-gray-500">Urgent inquiries requiring immediate administrative attention and SLA adherence</p>
          </div>
          <Badge variant="outline" className="text-xs text-rose-700 bg-rose-50 border-rose-200">
            Escalation Active
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b">
              <tr>
                <th className="px-5 py-3">Ticket ID</th>
                <th className="px-4 py-3">Subject / Issue Summary</th>
                <th className="px-4 py-3">Officer Name</th>
                <th className="px-4 py-3">MDA / Facility</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Assigned Desk</th>
                <th className="px-4 py-3">SLA Status</th>
                <th className="px-5 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {criticalEscalations.map((tkt, i) => (
                <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-blue-600">{tkt.ticketId}</td>
                  <td className="px-4 py-3.5 font-medium text-gray-900 max-w-xs truncate">{tkt.subject}</td>
                  <td className="px-4 py-3.5 text-gray-600">{tkt.employee}</td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs">{tkt.mda}</td>
                  <td className="px-4 py-3.5">
                    <Badge
                      className={
                        tkt.priority === "Urgent"
                          ? "bg-rose-100 text-rose-800 border-none"
                          : tkt.priority === "High"
                          ? "bg-amber-100 text-amber-800 border-none"
                          : "bg-blue-100 text-blue-800 border-none"
                      }
                    >
                      {tkt.priority}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs">{tkt.assignedTo}</td>
                  <td className="px-4 py-3.5 text-xs font-medium text-emerald-700">{tkt.slaRemaining}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {tkt.status}
                    </span>
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
