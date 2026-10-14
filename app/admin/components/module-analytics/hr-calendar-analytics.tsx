"use client"

import React, { useState, useEffect } from "react"
import {
  Calendar,
  CalendarDays,
  CalendarCheck,
  Clock,
  Briefcase,
  AlertCircle,
  Users,
  Layers,
  Flag,
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

const monthlyCalendarDensity = [
  { month: "May", events: 14, leaves: 82, projects: 6 },
  { month: "Jun", events: 18, leaves: 95, projects: 8 },
  { month: "Jul", events: 12, leaves: 110, projects: 5 },
  { month: "Aug", events: 20, leaves: 124, projects: 9 },
  { month: "Sep", events: 24, leaves: 105, projects: 11 },
  { month: "Oct", events: 28, leaves: 128, projects: 14 },
]

const eventTypeBreakdown = [
  { name: "Staff Leaves", value: 45, color: "#10b981" },
  { name: "Federal Public Holidays", value: 20, color: "#3b82f6" },
  { name: "Executive & Board Sittings", value: 18, color: "#8b5cf6" },
  { name: "Capital Project Deadlines", value: 12, color: "#f59e0b" },
  { name: "National Training Cohorts", value: 5, color: "#06b6d4" },
]

const upcomingMilestones = [
  {
    title: "Eid-el-Maulud & National Public Observance",
    type: "Public Holiday",
    date: "Oct 19, 2026",
    scope: "Federation Wide",
    impact: "Statutory Office Closure",
    status: "Gazetted",
  },
  {
    title: "Civil Service Technical Promotions Examination (Senior Cadre)",
    type: "Examination / Event",
    date: "Oct 26 - Oct 28, 2026",
    scope: "6 Geopolitical Zones",
    impact: "4,200 Eligible Officers",
    status: "Scheduled",
  },
  {
    title: "2026 Q4 Payroll Audit & Nominal Roll Sign-Off",
    type: "Statutory Deadline",
    date: "Nov 05, 2026",
    scope: "All Federal MDAs",
    impact: "Mandatory Treasury Inflow",
    status: "Critical",
  },
  {
    title: "Annual Leave Resumption & Handover Window",
    type: "Staff Leaves",
    date: "Nov 15, 2026",
    scope: "Directorate & Senior Staff",
    impact: "128 Returning Officers",
    status: "Active",
  },
]

export function HRCalendarAnalytics() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(false)
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  const kpis: KpiItem[] = [
    {
      title: "Scheduled Events This Month",
      value: "46",
      change: "+12.4%",
      trend: "up",
      comparison: "across all MDA schedules",
      icon: CalendarCheck,
      theme: "emerald",
    },
    {
      title: "Public Holidays & Observances",
      value: "14 Days",
      change: "Gazetted",
      trend: "neutral",
      comparison: "statutory national holidays",
      icon: Flag,
      theme: "blue",
    },
    {
      title: "Active Staff Leaves Commencing",
      value: "128 Officers",
      change: "+8.2%",
      trend: "up",
      comparison: "approved handover rosters",
      icon: Users,
      theme: "purple",
    },
    {
      title: "Project Milestone Deadlines",
      value: "18",
      change: "On Track",
      trend: "up",
      comparison: "Q4 capital deliverables",
      icon: Briefcase,
      theme: "amber",
    },
  ]

  const quickLinks = [
    {
      title: "HR Calendar Grid View",
      description: "Interactive visual monthly, weekly and daily calendar view",
      href: "/admin/hr-calendar",
      icon: Calendar,
      badge: "Interactive Calendar",
    },
    {
      title: "Events Schedule Table",
      description: "Tabular ledger of conferences, hearings and official events",
      href: "/admin/hr-calendar/events",
      icon: CalendarDays,
      badge: "Events Table",
    },
    {
      title: "Leaves Schedule Table",
      description: "Annual leave calendars, relief officer coverage and dates",
      href: "/admin/hr-calendar/leaves",
      icon: Users,
      badge: "Leaves Table",
    },
    {
      title: "Projects Schedule Table",
      description: "Project phases, delivery dates, and committee milestones",
      href: "/admin/hr-calendar/projects",
      icon: Briefcase,
      badge: "Projects Table",
    },
  ]

  return (
    <div className="space-y-6">
      <AnalyticsHeader
        moduleName="HR Calendar & Scheduling Intelligence"
        description="Unified schedule intelligence tracking statutory holidays, inter-agency meetings, employee leave rosters, and capital project deadlines."
      />

      <AnalyticsKpiGrid kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsChartCard
          title="Calendar Scheduling Density by Month"
          subtitle="Volume of official events, staff leaves, and project milestones"
          className="lg:col-span-2"
        >
          {mounted ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyCalendarDensity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
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
                  <Bar dataKey="events" name="Official Events" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="leaves" name="Personnel on Leave" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="projects" name="Project Deadlines" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-sm text-gray-400">
              Loading calendar density...
            </div>
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Calendar Event Composition"
          subtitle="Proportion of calendar entries across statutory and operational categories"
        >
          {mounted ? (
            <div className="h-72 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={eventTypeBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {eventTypeBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 text-xs text-gray-600 mt-2 w-full px-2">
                {eventTypeBreakdown.map((item) => (
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
              Loading event composition...
            </div>
          )}
        </AnalyticsChartCard>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Critical Upcoming Federal Milestones</h3>
            <p className="text-xs text-gray-500">Scheduled statutory events, public holidays and inter-ministerial deadlines</p>
          </div>
          <Badge variant="outline" className="text-xs text-purple-700 bg-purple-50 border-purple-200">
            Civil Service Schedule
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b">
              <tr>
                <th className="px-5 py-3">Milestone / Event Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Target Date</th>
                <th className="px-4 py-3">Scope / MDAs</th>
                <th className="px-4 py-3">Operational Impact</th>
                <th className="px-5 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {upcomingMilestones.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{item.title}</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs font-mono font-medium">{item.date}</td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs">{item.scope}</td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs">{item.impact}</td>
                  <td className="px-5 py-3.5 text-center">
                    <Badge
                      className={
                        item.status === "Critical"
                          ? "bg-rose-100 text-rose-800 border-none"
                          : item.status === "Gazetted"
                          ? "bg-blue-100 text-blue-800 border-none"
                          : "bg-emerald-100 text-emerald-800 border-none"
                      }
                    >
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
