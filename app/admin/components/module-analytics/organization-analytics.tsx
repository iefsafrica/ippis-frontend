"use client"

import React, { useState, useEffect } from "react"
import {
  Building2,
  Building,
  MapPin,
  Briefcase,
  Megaphone,
  FileText,
  Users,
  Compass,
  CheckCircle2,
  ShieldCheck,
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

const mdaStaffingDistribution = [
  { mda: "Accountant-General (OAGF)", headcount: 3420, capacity: 3600 },
  { mda: "Ministry of Finance", headcount: 2180, capacity: 2400 },
  { mda: "Ministry of Health", headcount: 4890, capacity: 5200 },
  { mda: "Ministry of Education", headcount: 5640, capacity: 6000 },
  { mda: "Works & Housing", headcount: 1950, capacity: 2200 },
  { mda: "Ministry of Interior", headcount: 3820, capacity: 4000 },
]

const geoDistribution = [
  { name: "Federal Capital Territory (Abuja)", value: 8450, color: "#008751" },
  { name: "South West (Lagos, Ibadan...)", value: 4120, color: "#3b82f6" },
  { name: "North West (Kano, Kaduna...)", value: 3680, color: "#f59e0b" },
  { name: "South South (Port Harcourt...)", value: 2940, color: "#10b981" },
  { name: "North Central / North East", value: 2710, color: "#8b5cf6" },
]

const recentAnnouncements = [
  {
    ref: "ANN-2026-031",
    title: "Mandatory IPPIS Biometric Re-Verification for Federal Pensioners",
    department: "Pension Commission / OAGF",
    audience: "All Ministries, Departments & Agencies",
    published: "12 Oct 2026",
    priority: "High",
  },
  {
    ref: "ANN-2026-030",
    title: "Public Service Rules (PSR 2026 Revised Edition) Gazette Notification",
    department: "Office of the Head of the Civil Service",
    audience: "Federal Civil Servants GL 01-17",
    published: "08 Oct 2026",
    priority: "Medium",
  },
  {
    ref: "ANN-2026-029",
    title: "Deployment of Unified Single-Sign-On (SSO) Portal for IPPIS Self-Service",
    department: "ICT Directorate",
    audience: "Entire Civil Service Workforce",
    published: "03 Oct 2026",
    priority: "Medium",
  },
]

export function OrganizationAnalytics() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const kpis: KpiItem[] = [
    {
      title: "Federal MDAs & Agencies",
      value: "18",
      change: "+2 onboarded",
      trend: "up",
      comparison: "Centralized IPPIS payroll",
      icon: Building,
      theme: "emerald",
    },
    {
      title: "Active Departments",
      value: "94",
      change: "Fully staffed",
      trend: "neutral",
      comparison: "Across all ministries",
      icon: Building2,
      theme: "blue",
    },
    {
      title: "Designated Cadres",
      value: "186",
      change: "Public Service Rules",
      trend: "neutral",
      comparison: "Administrative & Professional",
      icon: Briefcase,
      theme: "purple",
    },
    {
      title: "Federal Duty Stations",
      value: "37 States & FCT",
      change: "Nationwide presence",
      trend: "up",
      comparison: "100% state coverage",
      icon: MapPin,
      theme: "amber",
    },
  ]

  const quickLinks = [
    {
      title: "Companies & MDAs",
      description: "Manage ministry profiles, federal statutory charters, and entity governance records",
      href: "/admin/organization/company",
      icon: Building,
      badge: "Entities",
    },
    {
      title: "Departments & Directorates",
      description: "Create and maintain internal directorates, reporting divisions, and organograms",
      href: "/admin/organization/department",
      icon: Building2,
      badge: "Divisions",
    },
    {
      title: "Duty Locations & Stations",
      description: "Manage state secretariats, zonal headquarters, and regional branch duty posts",
      href: "/admin/organization/location",
      icon: MapPin,
      badge: "Stations",
    },
    {
      title: "Cadres & Designations",
      description: "Configure civil service ranks, job titles, and career progression schemas",
      href: "/admin/organization/designation",
      icon: Briefcase,
      badge: "Cadres",
    },
    {
      title: "Internal Announcements",
      description: "Publish service-wide circulars, official gazettes, and ministerial notifications",
      href: "/admin/organization/announcements",
      icon: Megaphone,
      badge: "Circulars",
    },
    {
      title: "Company & Service Policies",
      description: "Maintain official civil service policy documents, versions, and compliance guides",
      href: "/admin/organization/company-policy",
      icon: FileText,
      badge: "Compliance",
    },
  ]

  return (
    <div className="space-y-6">
      <AnalyticsHeader
        moduleName="Organization & Institutional Structure"
        description="Audit federal ministerial structures, organograms, geographical station distribution, active cadres, and official circular compliance."
        badgeText="Institutional Governance"
      />

      <AnalyticsKpiGrid items={kpis} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsChartCard
          title="Workforce Capacity by Federal MDA"
          subtitle="Actual enrolled civil servants vs statutory establishment capacity"
          className="lg:col-span-2"
          badge="Capacity"
        >
          {mounted ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mdaStaffingDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="mda" stroke="#94a3b8" fontSize={10} interval={0} angle={-10} textAnchor="end" height={40} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 5 }} />
                  <Bar dataKey="headcount" name="Enrolled Staff" fill="#008751" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="capacity" name="Establishment Cap" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] bg-slate-50 animate-pulse rounded-lg" />
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Geographical Staff Spread"
          subtitle="Distribution of federal personnel across geopolitical zones"
          badge="Geographic"
        >
          {mounted ? (
            <div className="h-[280px] w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie
                    data={geoDistribution}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {geoDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-1 gap-1 w-full text-[10px] pt-2 border-t border-slate-100">
                {geoDistribution.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate text-slate-600 font-medium">{item.name}</span>
                    </div>
                    <span className="font-mono text-slate-700 font-bold">{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[280px] bg-slate-50 animate-pulse rounded-lg" />
          )}
        </AnalyticsChartCard>
      </div>

      {/* Recent Circulars Table */}
      <AnalyticsChartCard
        title="Active Service Circulars & Announcements"
        subtitle="Current federal directives and administrative notices published on the IPPIS intranet"
        badge="Directives"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2 font-semibold">Notice ID</th>
                <th className="py-2 font-semibold">Circular Subject</th>
                <th className="py-2 font-semibold">Issuing Authority</th>
                <th className="py-2 font-semibold">Target Audience</th>
                <th className="py-2 font-semibold">Date Published</th>
                <th className="py-2 font-semibold text-right">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAnnouncements.map((ann, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 font-mono font-bold text-slate-800">{ann.ref}</td>
                  <td className="py-2.5 font-bold text-slate-900 max-w-sm truncate">{ann.title}</td>
                  <td className="py-2.5 text-slate-600">{ann.department}</td>
                  <td className="py-2.5 text-slate-600">{ann.audience}</td>
                  <td className="py-2.5 text-slate-500">{ann.published}</td>
                  <td className="py-2.5 text-right">
                    <Badge
                      className={`text-[10px] font-semibold ${
                        ann.priority === "High"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {ann.priority} Priority
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnalyticsChartCard>

      {/* Quick Navigation Links */}
      <QuickNavGrid links={quickLinks} title="Organization Sub-Modules & Operations" />
    </div>
  )
}
