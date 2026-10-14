"use client"

import React, { useState, useEffect } from "react"
import {
  GraduationCap,
  BookOpen,
  Users,
  Award,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  Sparkles,
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

const monthlyTrainingHours = [
  { month: "May", hours: 1840, trainees: 210 },
  { month: "Jun", hours: 2200, trainees: 260 },
  { month: "Jul", hours: 2050, trainees: 240 },
  { month: "Aug", hours: 2600, trainees: 310 },
  { month: "Sep", hours: 2900, trainees: 340 },
  { month: "Oct", hours: 3400, trainees: 410 },
]

const trainingCategories = [
  { name: "Public Financial Management (IPSAS)", value: 480, color: "#008751" },
  { name: "Digital Transformation & Cyber", value: 360, color: "#3b82f6" },
  { name: "Public Service Leadership", value: 240, color: "#f59e0b" },
  { name: "HR Ethics & Procurement (BPP)", value: 170, color: "#8b5cf6" },
]

const upcomingTrainings = [
  {
    id: "TRN-2026-042",
    title: "Executive IPPIS Enterprise Administration & Audit",
    trainer: "Administrative Staff College of Nigeria (ASCON)",
    enrolled: 48,
    capacity: 50,
    startDate: "18 Oct 2026",
    status: "Confirmed",
  },
  {
    id: "TRN-2026-043",
    title: "International Public Sector Accounting Standards (IPSAS)",
    trainer: "Institute of Chartered Accountants of Nigeria (ICAN)",
    enrolled: 120,
    capacity: 150,
    startDate: "24 Oct 2026",
    status: "Enrolling",
  },
  {
    id: "TRN-2026-044",
    title: "Cybersecurity & Data Privacy in Federal Portals",
    trainer: "National Information Technology Dev Agency (NITDA)",
    enrolled: 85,
    capacity: 100,
    startDate: "02 Nov 2026",
    status: "Scheduled",
  },
]

export function TrainingAnalytics() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const kpis: KpiItem[] = [
    {
      title: "Active Training Programs",
      value: "18",
      change: "+3 this quarter",
      trend: "up",
      comparison: "Accredited federal modules",
      icon: BookOpen,
      theme: "emerald",
    },
    {
      title: "Enrolled Civil Servants",
      value: "1,250",
      change: "+18.2%",
      trend: "up",
      comparison: "Active officer cohorts",
      icon: Users,
      theme: "blue",
    },
    {
      title: "Program Completion Rate",
      value: "88.4%",
      change: "+4.1%",
      trend: "up",
      comparison: "Post-course certifications",
      icon: Award,
      theme: "purple",
    },
    {
      title: "Training Budget Utilized",
      value: "₦54.8M",
      change: "73% of budget",
      trend: "neutral",
      comparison: "Total allocation: ₦75M",
      icon: GraduationCap,
      theme: "amber",
    },
  ]

  const quickLinks = [
    {
      title: "Training Programs",
      description: "Manage ongoing courses, officer enrollment, schedules, and materials",
      href: "/admin/training/list",
      icon: BookOpen,
      badge: "Programs",
    },
    {
      title: "Training Types",
      description: "Configure mandatory induction, specialized technical, and executive leadership tracks",
      href: "/admin/training/type",
      icon: Layers,
      badge: "Curriculum",
    },
    {
      title: "Certified Trainers",
      description: "Maintain institutional trainers, certified institutes (ASCON, ICAN, NITDA), and faculty",
      href: "/admin/training/trainers",
      icon: Users,
      badge: "Faculty",
    },
  ]

  return (
    <div className="space-y-6">
      <AnalyticsHeader
        moduleName="Training & Capacity Building"
        description="Monitor staff development curriculums, certified professional training programs, institutional faculty, and civil service capacity metrics."
        badgeText="Capacity Development"
      />

      <AnalyticsKpiGrid items={kpis} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsChartCard
          title="Monthly Officer Training Hours"
          subtitle="Cumulative instructional hours delivered across federal MDAs"
          className="lg:col-span-2"
          badge="Training Volume"
        >
          {mounted ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrainingHours} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Bar dataKey="hours" name="Total Hours" fill="#008751" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="trainees" name="Officers Certified" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] bg-slate-50 animate-pulse rounded-lg" />
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Training Focus Areas"
          subtitle="Distribution of training enrollments by competency domain"
          badge="Disciplines"
        >
          {mounted ? (
            <div className="h-[280px] w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie
                    data={trainingCategories}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {trainingCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 w-full text-[11px] pt-2 border-t border-slate-100">
                {trainingCategories.map((item, idx) => (
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

      {/* Upcoming Training Sessions Table */}
      <AnalyticsChartCard
        title="Upcoming Accredited Training Sessions"
        subtitle="Confirmed workshops and leadership cohorts commencing this quarter"
        badge="Schedule"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2 font-semibold">Course Code</th>
                <th className="py-2 font-semibold">Curriculum Title</th>
                <th className="py-2 font-semibold">Training Institution</th>
                <th className="py-2 font-semibold">Enrolled / Cap</th>
                <th className="py-2 font-semibold">Start Date</th>
                <th className="py-2 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {upcomingTrainings.map((trn, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 font-mono font-bold text-slate-800">{trn.id}</td>
                  <td className="py-2.5 font-bold text-slate-900">{trn.title}</td>
                  <td className="py-2.5 text-slate-600">{trn.trainer}</td>
                  <td className="py-2.5 font-mono text-emerald-800 font-bold">
                    {trn.enrolled} / {trn.capacity}
                  </td>
                  <td className="py-2.5 text-slate-500">{trn.startDate}</td>
                  <td className="py-2.5 text-right">
                    <Badge
                      className={`text-[10px] font-semibold ${
                        trn.status === "Confirmed"
                          ? "bg-emerald-100 text-emerald-800"
                          : trn.status === "Enrolling"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {trn.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnalyticsChartCard>

      {/* Quick Navigation Links */}
      <QuickNavGrid links={quickLinks} title="Training Sub-Modules & Operations" />
    </div>
  )
}
