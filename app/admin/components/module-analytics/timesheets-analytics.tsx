"use client"

import React, { useState, useEffect } from "react"
import {
  Clock,
  UserCheck,
  CalendarDays,
  Calendar,
  AlertCircle,
  FileCheck,
  Users,
  Briefcase,
  Layers,
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

const attendanceTrends = [
  { day: "Mon", present: 940, late: 42, leave: 38 },
  { day: "Tue", present: 962, late: 35, leave: 33 },
  { day: "Wed", present: 955, late: 48, leave: 37 },
  { day: "Thu", present: 948, late: 39, leave: 43 },
  { day: "Fri", present: 920, late: 61, leave: 49 },
]

const leaveBreakdown = [
  { name: "Annual Leave", value: 45, color: "#10b981" },
  { name: "Casual Leave", value: 22, color: "#3b82f6" },
  { name: "Sick / Medical", value: 16, color: "#f59e0b" },
  { name: "Maternity / Paternity", value: 11, color: "#8b5cf6" },
  { name: "Study / Training", value: 6, color: "#06b6d4" },
]

const mdaAttendanceSummary = [
  {
    mda: "Office of the Head of Civil Service (OHCSF)",
    totalStaff: 480,
    presentToday: 462,
    rate: "96.3%",
    lateArrivals: 11,
    onLeave: 18,
    status: "Excellent",
  },
  {
    mda: "Federal Ministry of Finance",
    totalStaff: 620,
    presentToday: 590,
    rate: "95.2%",
    lateArrivals: 19,
    onLeave: 30,
    status: "Good",
  },
  {
    mda: "Federal Ministry of Works & Housing",
    totalStaff: 540,
    presentToday: 508,
    rate: "94.1%",
    lateArrivals: 22,
    onLeave: 32,
    status: "Good",
  },
  {
    mda: "National Health Care Development Agency",
    totalStaff: 390,
    presentToday: 368,
    rate: "94.4%",
    lateArrivals: 14,
    onLeave: 22,
    status: "Good",
  },
  {
    mda: "Ministry of Foreign Affairs",
    totalStaff: 410,
    presentToday: 382,
    rate: "93.2%",
    lateArrivals: 18,
    onLeave: 28,
    status: "Normal",
  },
]

export function TimesheetsAnalytics() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(false)
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  const kpis: KpiItem[] = [
    {
      title: "Today's Attendance Rate",
      value: "95.1%",
      change: "+1.4%",
      trend: "up",
      comparison: "vs last week avg",
      icon: UserCheck,
      theme: "emerald",
    },
    {
      title: "Punctuality Compliance",
      value: "92.8%",
      change: "+0.9%",
      trend: "up",
      comparison: "arrival prior to 08:30 AM",
      icon: Clock,
      theme: "blue",
    },
    {
      title: "Pending Leave Requests",
      value: "34",
      change: "-6",
      trend: "up",
      comparison: "awaiting DG/Director sign-off",
      icon: CalendarDays,
      theme: "purple",
    },
    {
      title: "Active Duty Shifts",
      value: "8",
      change: "100%",
      trend: "neutral",
      comparison: "standard & rotational shifts",
      icon: Layers,
      theme: "amber",
    },
  ]

  const quickLinks = [
    {
      title: "Daily Attendance Records",
      description: "Biometric clock-in and daily verification logs",
      href: "/admin/timesheets/attendances",
      icon: UserCheck,
      badge: "Real-time",
    },
    {
      title: "Date-Wise Attendances",
      description: "Historical attendance filter by specific calendar dates",
      href: "/admin/timesheets/date-wise-attendances",
      icon: Calendar,
      badge: "Historical",
    },
    {
      title: "Monthly Attendances",
      description: "Aggregate monthly timesheet reconciliation reports",
      href: "/admin/timesheets/monthly-attendances",
      icon: FileCheck,
      badge: "Reconciliation",
    },
    {
      title: "Shift Management",
      description: "Define office rosters, rotational duties and timing slots",
      href: "/admin/timesheets/office-shift",
      icon: Clock,
      badge: "8 Shifts",
    },
    {
      title: "Manage Public Holidays",
      description: "Gazetted federal public holidays & non-working dates",
      href: "/admin/timesheets/manage-holiday",
      icon: CalendarDays,
      badge: "Federal Gazetted",
    },
    {
      title: "Manage Employee Leaves",
      description: "Annual, casual, sick and maternity leave approvals",
      href: "/admin/timesheets/manage-leaves",
      icon: Briefcase,
      badge: "34 Pending",
    },
  ]

  return (
    <div className="space-y-6">
      <AnalyticsHeader
        moduleName="Timesheets & Attendance"
        description="Monitor federal workforce biometric attendance, punctuality trends, leave accruals, and departmental duty rosters."
      />

      <AnalyticsKpiGrid kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsChartCard
          title="Daily Presence & Punctuality Velocity"
          subtitle="Biometric clock-in compliance vs late arrival & authorized absence (Sample MDA Staff)"
          className="lg:col-span-2"
        >
          {mounted ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
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
                  <Bar dataKey="present" name="Present (On Time)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="late" name="Late Arrivals" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="leave" name="Approved Leave" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-sm text-gray-400">
              Loading attendance data...
            </div>
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Active Leave Categorization"
          subtitle="Breakdown of personnel on approved leave categories"
        >
          {mounted ? (
            <div className="h-72 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={leaveBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {leaveBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 text-xs text-gray-600 mt-2 w-full px-2">
                {leaveBreakdown.map((item) => (
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
              Loading leave metrics...
            </div>
          )}
        </AnalyticsChartCard>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">MDA Real-Time Attendance Performance</h3>
            <p className="text-xs text-gray-500">Punctuality and attendance metrics across major federal departments</p>
          </div>
          <Badge variant="outline" className="text-xs text-emerald-700 bg-emerald-50 border-emerald-200">
            Biometric Synchronized
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b">
              <tr>
                <th className="px-5 py-3">Ministry / Extra-Ministerial Agency</th>
                <th className="px-4 py-3 text-right">Cadre Strength</th>
                <th className="px-4 py-3 text-right">Present Today</th>
                <th className="px-4 py-3 text-center">Attendance %</th>
                <th className="px-4 py-3 text-right">Late Logins</th>
                <th className="px-4 py-3 text-right">On Leave</th>
                <th className="px-5 py-3 text-center">Audit Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mdaAttendanceSummary.map((mda, i) => (
                <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{mda.mda}</td>
                  <td className="px-4 py-3.5 text-right text-gray-600 font-mono">{mda.totalStaff.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-right font-medium text-gray-900 font-mono">{mda.presentToday.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-center font-bold text-emerald-600">{mda.rate}</td>
                  <td className="px-4 py-3.5 text-right text-amber-600 font-medium">{mda.lateArrivals}</td>
                  <td className="px-4 py-3.5 text-right text-blue-600 font-medium">{mda.onLeave}</td>
                  <td className="px-5 py-3.5 text-center">
                    <Badge
                      className={
                        mda.status === "Excellent"
                          ? "bg-emerald-100 text-emerald-800 border-none"
                          : "bg-blue-100 text-blue-800 border-none"
                      }
                    >
                      {mda.status}
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
