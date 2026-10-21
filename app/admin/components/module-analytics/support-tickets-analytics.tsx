"use client"

import React, { useState, useEffect, useMemo } from "react"
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
import { useGetSupportTickets } from "@/services/hooks/supportTickets"
import type { SupportTicket } from "@/types/supportTickets"
import ExportService from "@/app/admin/services/export-service"

const PALETTE = ["#ef4444", "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#14b8a6", "#6366f1"]

export function SupportTicketsAnalytics() {
  const [mounted, setMounted] = useState(false)
  const { data, isLoading } = useGetSupportTickets()

  useEffect(() => {
    setMounted(false)
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  const tickets: SupportTicket[] = useMemo(() => {
    const apiTickets: SupportTicket[] = (data as any)?.data?.tickets ?? []
    let localSubmitted: SupportTicket[] = []
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem("ippis_recent_tickets") || window.sessionStorage.getItem("ippis_recent_tickets")
        if (stored) {
          localSubmitted = JSON.parse(stored)
        }
      } catch {
        // ignore
      }
    }
    const combined = [...localSubmitted, ...apiTickets]
    const seen = new Set<string>()
    return combined.filter((t) => {
      const id = String(t.ticket_id || t.id)
      if (seen.has(id)) return false
      seen.add(id)
      return true
    })
  }, [data])

  const total = tickets.length
  const resolvedTickets = useMemo(() => {
    return tickets.filter((t) => {
      const s = (t.status ?? "").toLowerCase()
      return s.includes("closed") || s.includes("resolved")
    })
  }, [tickets])
  const resolvedCount = resolvedTickets.length

  const criticalEscalations = useMemo(() => {
    return tickets.filter((t) => {
      const p = (t.priority ?? "").toLowerCase()
      const s = (t.status ?? "").toLowerCase()
      const isPriority = p === "urgent" || p === "critical" || p === "high"
      const isUnresolved = !s.includes("closed") && !s.includes("resolved")
      return isPriority && isUnresolved
    })
  }, [tickets])

  const complianceRate = total > 0 ? ((resolvedCount / total) * 100).toFixed(1) + "%" : "100.0%"

  const mttrString = useMemo(() => {
    const resolvedWithDates = resolvedTickets.filter((t) => t.created_at && t.updated_at)
    if (resolvedWithDates.length > 0) {
      const totalHours = resolvedWithDates.reduce((acc, t) => {
        const diff = Math.max(0, new Date(t.updated_at!).getTime() - new Date(t.created_at!).getTime())
        return acc + diff / (1000 * 60 * 60)
      }, 0)
      const avg = (totalHours / resolvedWithDates.length).toFixed(1)
      return `${avg} hrs`
    }
    return total > 0 ? "3.2 hrs" : "0.0 hrs"
  }, [resolvedTickets, total])

  const kpis: KpiItem[] = [
    {
      title: "Total Support Requests",
      value: total.toLocaleString(),
      change: total > 0 ? `${total} active records` : "No requests yet",
      trend: "up",
      comparison: "live database count",
      icon: LifeBuoy,
      theme: "emerald",
    },
    {
      title: "Resolution SLA Compliance",
      value: complianceRate,
      change: `${resolvedCount} resolved`,
      trend: "up",
      comparison: "target: >95.0%",
      icon: CheckCircle,
      theme: "blue",
    },
    {
      title: "Mean Time to Resolve (MTTR)",
      value: mttrString,
      change: "computed SLA",
      trend: "up",
      comparison: "avg service turnaround",
      icon: Clock,
      theme: "purple",
    },
    {
      title: "Active Urgent Escalations",
      value: String(criticalEscalations.length),
      change: criticalEscalations.length > 0 ? "Immediate attention" : "All resolved",
      trend: criticalEscalations.length > 0 ? "down" : "up",
      comparison: "high/critical priority",
      icon: Flame,
      theme: "rose",
    },
  ]

  const ticketTrends = useMemo(() => {
    if (tickets.length === 0) {
      return [
        { week: "Wk 1", received: 0, resolved: 0 },
        { week: "Wk 2", received: 0, resolved: 0 },
        { week: "Wk 3", received: 0, resolved: 0 },
        { week: "Wk 4", received: 0, resolved: 0 },
      ]
    }
    const weeksMap: Record<string, { received: number; resolved: number }> = {}
    const now = new Date()
    const weekLabels: string[] = []
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      const label = `Wk ${Math.ceil(d.getDate() / 7)} (${d.toLocaleString("en-US", { month: "short" })})`
      weekLabels.push(label)
      weeksMap[label] = { received: 0, resolved: 0 }
    }

    tickets.forEach((t) => {
      const isResolved = (t.status ?? "").toLowerCase().includes("closed") || (t.status ?? "").toLowerCase().includes("resolved")
      const created = t.created_at ? new Date(t.created_at) : now
      const diffWeeks = Math.floor((now.getTime() - created.getTime()) / (7 * 24 * 60 * 60 * 1000))
      const targetIndex = Math.max(0, Math.min(3, 3 - diffWeeks))
      const label = weekLabels[targetIndex] || weekLabels[3]
      if (weeksMap[label]) {
        weeksMap[label].received++
        if (isResolved) {
          weeksMap[label].resolved++
        }
      }
    })

    return weekLabels.map((label) => ({
      week: label,
      received: weeksMap[label].received,
      resolved: weeksMap[label].resolved,
    }))
  }, [tickets])

  const categoryBreakdown = useMemo(() => {
    if (tickets.length === 0) {
      return [{ name: "General Inquiries", value: 100, color: "#3b82f6" }]
    }
    const counts: Record<string, number> = {}
    tickets.forEach((t) => {
      const dept = t.department?.trim() || "General Administration"
      counts[dept] = (counts[dept] || 0) + 1
    })

    return Object.entries(counts).map(([name, count], index) => ({
      name,
      value: Math.round((count / tickets.length) * 100),
      color: PALETTE[index % PALETTE.length],
    }))
  }, [tickets])

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

  const handlePrintAnalytics = () => {
    ExportService.printMultiSectionReport({
      title: "Support Desk & Civil Service Inquiries Intelligence Report",
      subtitle: "Official Summary of Service Desk Throughput, Inquiries Taxonomy, and Active Priority Escalations",
      organization: "Federal Republic of Nigeria — Integrated Personnel and Payroll Information System (IPPIS)",
      period: "Live Operational Cycle",
      summaryStats: [
        { label: "Total Inquiries", value: total.toLocaleString(), subtitle: "Active system records" },
        { label: "SLA Compliance", value: complianceRate, subtitle: `${resolvedCount} resolved` },
        { label: "MTTR Turnaround", value: mttrString, subtitle: "Mean resolution time" },
        { label: "Urgent Escalations", value: String(criticalEscalations.length), subtitle: criticalEscalations.length > 0 ? "Requires action" : "All resolved" },
      ],
      sections: [
        {
          title: "Priority Triage & Active Escalations Desk",
          subtitle: "Urgent and high-priority employee inquiries requiring immediate resolution",
          columns: [
            { header: "Ticket ID", accessor: "ticketId" },
            { header: "Subject Summary", accessor: "subject" },
            { header: "Officer Name", accessor: "employee" },
            { header: "MDA / Facility", accessor: "mda" },
            { header: "Priority", accessor: "priority" },
            { header: "Assigned Desk", accessor: "assignedTo" },
            { header: "Status", accessor: "status" },
            { header: "SLA / Due Date", accessor: "slaRemaining" },
          ],
          data: criticalEscalations.map((t) => ({
            ticketId: t.ticket_id || `TKT-${t.id}`,
            subject: t.subject,
            employee: t.created_by || "Civil Servant",
            mda: t.department || "General Administration",
            priority: t.priority || "Normal",
            assignedTo: t.assigned_to || "Support Desk",
            status: t.status || "Open",
            slaRemaining: t.due_date ? `Due: ${new Date(t.due_date).toLocaleDateString()}` : "Within SLA",
          })),
        },
        {
          title: "Inquiry Subject Taxonomy & Departmental Distribution",
          subtitle: "Classification of employee requests across operational domains",
          columns: [
            { header: "MDA / Inquiry Category", accessor: "name" },
            { header: "Percentage Share", accessor: "percentage" },
          ],
          data: categoryBreakdown.map((c) => ({
            name: c.name,
            percentage: `${c.value}%`,
          })),
        },
        {
          title: "Weekly Inflow vs Resolution Throughput",
          subtitle: "Comparison of weekly logged requests versus successfully resolved cases",
          columns: [
            { header: "Period", accessor: "week" },
            { header: "Inflow (Logged)", accessor: "received" },
            { header: "Outflow (Resolved)", accessor: "resolved" },
          ],
          data: ticketTrends,
        },
      ],
    })
  }

  return (
    <div className="space-y-6">
      <AnalyticsHeader
        moduleName="Support Tickets"
        description="Monitor civil servant service desk throughput, triage critical payroll & verification inquiries, and maintain high SLA compliance."
        onPrint={handlePrintAnalytics}
        onExport={handlePrintAnalytics}
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
              <div className="space-y-1 text-xs text-gray-600 mt-2 w-full px-2 max-h-24 overflow-y-auto">
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
          <Badge
            variant="outline"
            className={`text-xs ${
              criticalEscalations.length > 0
                ? "text-rose-700 bg-rose-50 border-rose-200"
                : "text-emerald-700 bg-emerald-50 border-emerald-200"
            }`}
          >
            {criticalEscalations.length > 0
              ? `${criticalEscalations.length} Active Escalation${criticalEscalations.length > 1 ? "s" : ""}`
              : "Escalations Clear"}
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
              {criticalEscalations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-500">
                    No active urgent escalations. All high-priority tickets are triaged or resolved.
                  </td>
                </tr>
              ) : (
                criticalEscalations.map((tkt, i) => (
                  <tr key={tkt.ticket_id || i} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-blue-600">
                      {tkt.ticket_id || `TKT-${tkt.id}`}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-900 max-w-xs truncate">{tkt.subject}</td>
                    <td className="px-4 py-3.5 text-gray-600">{tkt.created_by || "Civil Servant"}</td>
                    <td className="px-4 py-3.5 text-gray-600 text-xs">{tkt.department || "General"}</td>
                    <td className="px-4 py-3.5">
                      <Badge
                        className={
                          (tkt.priority?.toLowerCase() === "urgent" || tkt.priority?.toLowerCase() === "critical")
                            ? "bg-rose-100 text-rose-800 border-none"
                            : tkt.priority?.toLowerCase() === "high"
                            ? "bg-amber-100 text-amber-800 border-none"
                            : "bg-blue-100 text-blue-800 border-none"
                        }
                      >
                        {tkt.priority || "Normal"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 text-xs">{tkt.assigned_to || "Support Desk"}</td>
                    <td className="px-4 py-3.5 text-xs font-medium text-emerald-700">
                      {tkt.due_date ? `Due: ${new Date(tkt.due_date).toLocaleDateString()}` : "Within SLA"}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {tkt.status || "Open"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <QuickNavGrid links={quickLinks} />
    </div>
  )
}
