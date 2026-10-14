"use client"

import React, { useState, useEffect } from "react"
import {
  FolderKanban,
  CheckSquare,
  Users,
  CreditCard,
  Percent,
  Clock,
  TrendingUp,
  AlertCircle,
  FileText,
  DollarSign,
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
import {
  AnalyticsHeader,
  AnalyticsKpiGrid,
  AnalyticsChartCard,
  QuickNavGrid,
  KpiItem,
} from "./analytics-ui"

const projectStatusData = [
  { name: "In Progress", value: 16, color: "#3b82f6" },
  { name: "Completed", value: 8, color: "#008751" },
  { name: "Under Review / QA", value: 3, color: "#f59e0b" },
  { name: "Delayed / At Risk", value: 1, color: "#ef4444" },
]

const taskVelocityData = [
  { week: "Wk 37", completed: 42, created: 38 },
  { week: "Wk 38", completed: 51, created: 45 },
  { week: "Wk 39", completed: 48, created: 40 },
  { week: "Wk 40", completed: 62, created: 50 },
  { week: "Wk 41", completed: 58, created: 48 },
]

const majorProjects = [
  {
    code: "PRJ-NG-01",
    title: "IPPIS Biometric Capture Modernization & Hardware Upgrade",
    lead: "ICT Directorate",
    budget: "₦420,000,000",
    spent: "₦310,000,000",
    progress: 74,
    status: "On Track",
  },
  {
    code: "PRJ-NG-02",
    title: "Unified National Civil Service e-Appraisal System Integration",
    lead: "Policy & Strategy Division",
    budget: "₦180,000,000",
    spent: "₦165,000,000",
    progress: 92,
    status: "Final Review",
  },
  {
    code: "PRJ-NG-03",
    title: "Federal Payroll Automated Bank Switching Redundancy",
    lead: "OAGF Treasury IT",
    budget: "₦650,000,000",
    spent: "₦410,000,000",
    progress: 63,
    status: "On Track",
  },
  {
    code: "PRJ-NG-04",
    title: "Disaster Recovery Data Center Replication (Enugu Site)",
    lead: "Infrastructure Operations",
    budget: "₦890,000,000",
    spent: "₦720,000,000",
    progress: 81,
    status: "On Track",
  },
]

export function ProjectManagementAnalytics() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const kpis: KpiItem[] = [
    {
      title: "Active Strategic Projects",
      value: "28",
      change: "85.7% on-schedule",
      trend: "up",
      comparison: "Government projects",
      icon: FolderKanban,
      theme: "emerald",
    },
    {
      title: "Total Capital Budget Allocated",
      value: "₦3.42B",
      change: "68% utilized",
      trend: "neutral",
      comparison: "Federal appropriations",
      icon: DollarSign,
      theme: "blue",
    },
    {
      title: "Active Deliverable Tasks",
      value: "480",
      change: "+45 this week",
      trend: "up",
      comparison: "92% completion velocity",
      icon: CheckSquare,
      theme: "purple",
    },
    {
      title: "Approved Partner Contractors",
      value: "16",
      change: "BPP Cleared",
      trend: "neutral",
      comparison: "Verified institutional partners",
      icon: Users,
      theme: "amber",
    },
  ]

  const quickLinks = [
    {
      title: "Projects",
      description: "Manage capital programs, work breakdown schedules, deliverables, and milestones",
      href: "/admin/project-management/projects",
      icon: FolderKanban,
      badge: "Programs",
    },
    {
      title: "Tasks & Deliverables",
      description: "Assign sprint tasks, track issue completion velocity, and review blockers",
      href: "/admin/project-management/tasks",
      icon: CheckSquare,
      badge: "Tasks",
    },
    {
      title: "Institutional Clients",
      description: "Manage external stakeholder ministries, parastatals, and technical partners",
      href: "/admin/project-management/client",
      icon: Users,
    },
    {
      title: "Contractor Invoices",
      description: "Track procurement milestone billings, tax withholdings, and payment certificates",
      href: "/admin/project-management/invoice",
      icon: CreditCard,
    },
    {
      title: "Tax Withholdings (WHT)",
      description: "Configure statutory withholding tax rates, VAT exemptions, and fiscal codes",
      href: "/admin/project-management/tax-type",
      icon: Percent,
    },
  ]

  return (
    <div className="space-y-6">
      <AnalyticsHeader
        moduleName="Project Management & Delivery"
        description="Monitor federal capital execution programs, contractor deliverable velocity, milestone achievements, and budget disbursements."
        badgeText="Project Delivery"
      />

      <AnalyticsKpiGrid items={kpis} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsChartCard
          title="Weekly Task Velocity"
          subtitle="New deliverable tasks created vs successfully completed & verified"
          className="lg:col-span-2"
          badge="Throughput"
        >
          {mounted ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskVelocityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Bar dataKey="completed" name="Completed Tasks" fill="#008751" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="created" name="New Tasks Added" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] bg-slate-50 animate-pulse rounded-lg" />
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Project Health & Status"
          subtitle="Distribution across 28 active capital implementations"
          badge="Health"
        >
          {mounted ? (
            <div className="h-[280px] w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1.5 w-full text-[10px] pt-2 border-t border-slate-100">
                {projectStatusData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 truncate">
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

      {/* Major Projects Status Table */}
      <AnalyticsChartCard
        title="High-Priority Capital Project Portfolio"
        subtitle="Tracking major strategic software, infrastructure, and automation initiatives"
        badge="Strategic Portfolio"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2 font-semibold">Project Code</th>
                <th className="py-2 font-semibold">Initiative Title</th>
                <th className="py-2 font-semibold">Lead Directorate</th>
                <th className="py-2 font-semibold">Approved Budget</th>
                <th className="py-2 font-semibold">Progress</th>
                <th className="py-2 font-semibold text-right">Delivery Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {majorProjects.map((prj, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 font-mono font-bold text-slate-800">{prj.code}</td>
                  <td className="py-2.5 font-bold text-slate-900 max-w-sm truncate">{prj.title}</td>
                  <td className="py-2.5 text-slate-600">{prj.lead}</td>
                  <td className="py-2.5 font-mono text-emerald-800 font-bold">{prj.budget}</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2 rounded-full"
                          style={{ width: `${prj.progress}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-bold text-slate-700">
                        {prj.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 text-right">
                    <Badge
                      className={`text-[10px] font-semibold ${
                        prj.status === "On Track"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {prj.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnalyticsChartCard>

      {/* Quick Navigation Links */}
      <QuickNavGrid links={quickLinks} title="Project Management Sub-Modules" />
    </div>
  )
}
