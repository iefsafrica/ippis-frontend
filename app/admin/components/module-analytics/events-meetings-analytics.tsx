"use client"

import React, { useState, useEffect } from "react"
import {
  CalendarDays,
  Video,
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  CalendarCheck,
  AlertCircle,
  Presentation,
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

const meetingTrends = [
  { month: "May", virtual: 34, physical: 18, hybrid: 12 },
  { month: "Jun", virtual: 42, physical: 22, hybrid: 15 },
  { month: "Jul", virtual: 38, physical: 19, hybrid: 14 },
  { month: "Aug", virtual: 48, physical: 25, hybrid: 18 },
  { month: "Sep", virtual: 55, physical: 28, hybrid: 22 },
  { month: "Oct", virtual: 62, physical: 31, hybrid: 26 },
]

const meetingTypes = [
  { name: "Board & Committee", value: 38, color: "#10b981" },
  { name: "MDA Bilateral", value: 45, color: "#3b82f6" },
  { name: "Management Review", value: 28, color: "#8b5cf6" },
  { name: "Townhall & Staff", value: 16, color: "#f59e0b" },
  { name: "Emergency / Special", value: 9, color: "#ef4444" },
]

const upcomingSessions = [
  {
    title: "Federal Payroll Harmonization Review",
    type: "Meeting",
    format: "Hybrid",
    organizer: "Directorate of IPPIS",
    date: "Oct 18, 2026 • 10:00 AM",
    venue: "Main Boardroom / Virtual Link",
    attendees: 34,
    status: "Confirmed",
  },
  {
    title: "Civil Service Pension Reform Stakeholders Workshop",
    type: "Event",
    format: "Physical",
    organizer: "Head of the Civil Service (OHCSF)",
    date: "Oct 22, 2026 • 09:00 AM",
    venue: "International Conference Centre, Abuja",
    attendees: 180,
    status: "Registration Open",
  },
  {
    title: "Q4 MDA Financial Clearance Alignment",
    type: "Meeting",
    format: "Virtual",
    organizer: "Office of the Accountant-General",
    date: "Oct 24, 2026 • 02:00 PM",
    venue: "Secure Webex Conference",
    attendees: 52,
    status: "Confirmed",
  },
  {
    title: "IPPIS Biometric Enrolment Compliance Debrief",
    type: "Event",
    format: "Hybrid",
    organizer: "Technical Ops & Verification",
    date: "Oct 28, 2026 • 11:30 AM",
    venue: "Auditorium A, Federal Secretariat",
    attendees: 95,
    status: "Scheduled",
  },
]

export function EventsMeetingsAnalytics() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(false)
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  const kpis: KpiItem[] = [
    {
      title: "Active Scheduled Events",
      value: "28",
      change: "+12.0%",
      trend: "up",
      comparison: "vs last month",
      icon: CalendarDays,
      theme: "emerald",
    },
    {
      title: "Total Meetings Held (Q3/Q4)",
      value: "136",
      change: "+18.4%",
      trend: "up",
      comparison: "98.2% quorum rate",
      icon: Presentation,
      theme: "blue",
    },
    {
      title: "Virtual / Hybrid Sessions",
      value: "88",
      change: "64.7%",
      trend: "neutral",
      comparison: "of total convene sessions",
      icon: Video,
      theme: "purple",
    },
    {
      title: "Total Participant Engagements",
      value: "4,920",
      change: "+24.5%",
      trend: "up",
      comparison: "across 42 MDAs",
      icon: Users,
      theme: "amber",
    },
  ]

  const quickLinks = [
    {
      title: "Events Management",
      description: "Schedule, coordinate conferences and public agency events",
      href: "/admin/events-meetings/events",
      icon: CalendarCheck,
      badge: "28 Active",
    },
    {
      title: "Meetings Management",
      description: "Convene committee hearings, record minutes & action items",
      href: "/admin/events-meetings/meetings",
      icon: Video,
      badge: "Live Calendar",
    },
  ]

  return (
    <div className="space-y-6">
      <AnalyticsHeader
        moduleName="Events & Meetings"
        description="Convene executive sessions, manage cross-MDA conferences, coordinate hybrid forums, and monitor attendee participation."
      />

      <AnalyticsKpiGrid kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsChartCard
          title="Meeting Velocity & Delivery Channels"
          subtitle="Convene frequency categorized by physical, virtual and hybrid sessions"
          className="lg:col-span-2"
        >
          {mounted ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={meetingTrends}>
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
                  <Bar dataKey="virtual" name="Virtual (Online)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="hybrid" name="Hybrid Session" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="physical" name="In-Person Boardroom" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-sm text-gray-400">
              Loading session data...
            </div>
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Session Classification"
          subtitle="Distribution of meetings by legislative and administrative scope"
        >
          {mounted ? (
            <div className="h-72 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={meetingTypes}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {meetingTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-gray-600 mt-2 w-full px-2">
                {meetingTypes.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-sm text-gray-400">
              Loading classifications...
            </div>
          )}
        </AnalyticsChartCard>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Upcoming High-Level Convenings</h3>
            <p className="text-xs text-gray-500">Scheduled strategic sessions, inter-agency meetings and conferences</p>
          </div>
          <Badge variant="outline" className="text-xs text-emerald-700 bg-emerald-50 border-emerald-200">
            Real-Time Calendar Sync
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b">
              <tr>
                <th className="px-5 py-3">Event / Session Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Delivery</th>
                <th className="px-4 py-3">Organizing MDA</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Location / Channel</th>
                <th className="px-4 py-3 text-right">Attendees</th>
                <th className="px-5 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {upcomingSessions.map((session, i) => (
                <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{session.title}</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {session.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs">{session.format}</td>
                  <td className="px-4 py-3.5 text-gray-600">{session.organizer}</td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs font-mono">{session.date}</td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs">{session.venue}</td>
                  <td className="px-4 py-3.5 text-right font-medium text-gray-900">{session.attendees}</td>
                  <td className="px-5 py-3.5 text-center">
                    <Badge
                      className={
                        session.status === "Confirmed"
                          ? "bg-emerald-100 text-emerald-800 border-none"
                          : session.status === "Registration Open"
                          ? "bg-blue-100 text-blue-800 border-none"
                          : "bg-amber-100 text-amber-800 border-none"
                      }
                    >
                      {session.status}
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
