"use client"

import React, { useState, useEffect } from "react"
import {
  Users,
  UserCheck,
  UserX,
  Clock3,
  ShieldCheck,
  Award,
  Upload,
  FileText,
  BadgeCheck,
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

const gradeLevelDistribution = [
  { level: "GL 01-06 (Junior)", count: 38200 },
  { level: "GL 07-10 (Officer)", count: 44100 },
  { level: "GL 12-14 (Senior)", count: 28400 },
  { level: "GL 15-17 (Directorate)", count: 14800 },
  { level: "Special / Perm Sec", count: 2900 },
]

const zonalDistribution = [
  { name: "North Central", value: 22, color: "#10b981" },
  { name: "North West", value: 20, color: "#3b82f6" },
  { name: "South West", value: 19, color: "#8b5cf6" },
  { name: "South South", value: 16, color: "#f59e0b" },
  { name: "North East", value: 13, color: "#06b6d4" },
  { name: "South East", value: 10, color: "#ec4899" },
]

const recentEnrolments = [
  {
    ippisNo: "IPPIS-2026-0814",
    name: "Dr. Abubakar Mohammed Bello",
    mda: "National Centre for Disease Control (NCDC)",
    cadre: "Chief Epidemiologist (GL 14)",
    ninStatus: "NIN Verified",
    bvnStatus: "BVN Linked",
    biometrics: "Enrolled",
    date: "Today, 14:20",
  },
  {
    ippisNo: "IPPIS-2026-0813",
    name: "Engr. Nkechi Joy Okonkwo",
    mda: "Federal Ministry of Water Resources",
    cadre: "Principal Hydrologist (GL 12)",
    ninStatus: "NIN Verified",
    bvnStatus: "BVN Linked",
    biometrics: "Enrolled",
    date: "Today, 12:45",
  },
  {
    ippisNo: "IPPIS-2026-0812",
    name: "Ahmadu Sanusi Danladi",
    mda: "Office of the Auditor-General (OAuGF)",
    cadre: "Senior Auditor II (GL 10)",
    ninStatus: "NIN Verified",
    bvnStatus: "BVN Linked",
    biometrics: "Enrolled",
    date: "Yesterday",
  },
  {
    ippisNo: "IPPIS-2026-0809",
    name: "Mrs. Folashade Adeleke",
    mda: "Ministry of Budget and Economic Planning",
    cadre: "Assistant Director (GL 15)",
    ninStatus: "NIN Verified",
    bvnStatus: "BVN Linked",
    biometrics: "Enrolled",
    date: "Yesterday",
  },
]

export function EmployeesAnalytics() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(false)
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  const kpis: KpiItem[] = [
    {
      title: "Total Verified Personnel",
      value: "128,400",
      change: "+2.4%",
      trend: "up",
      comparison: "active on nominal roll",
      icon: Users,
      theme: "emerald",
    },
    {
      title: "Biometric & NIN Integrity",
      value: "96.7%",
      change: "+0.8%",
      trend: "up",
      comparison: "NIMC dual-match verified",
      icon: ShieldCheck,
      theme: "blue",
    },
    {
      title: "Pending Enrolment Audit",
      value: "4,180",
      change: "-14.2%",
      trend: "up",
      comparison: "awaiting physical review",
      icon: Clock3,
      theme: "purple",
    },
    {
      title: "Upcoming Statutory Retirements",
      value: "3,420",
      change: "Next 12 mo",
      trend: "neutral",
      comparison: "60 yrs age or 35 yrs service",
      icon: Award,
      theme: "amber",
    },
  ]

  const quickLinks = [
    {
      title: "Active Employee Nominal Roll",
      description: "Search, filter and inspect verified civil service personnel",
      href: "/admin/employees?tab=employee",
      icon: UserCheck,
      badge: "128,400 Active",
    },
    {
      title: "Pending Employees Queue",
      description: "Review unapproved registrants, NIN checks and approval workflow",
      href: "/admin/employees?tab=pending",
      icon: Clock3,
      badge: "4,180 Pending",
    },
    {
      title: "Bulk Data Import",
      description: "Upload MDA spreadsheets, batch enrollments and CSV nominal rolls",
      href: "/admin/employees?tab=import",
      icon: Upload,
      badge: "Batch Import",
    },
    {
      title: "Personnel Documents Vault",
      description: "First appointment letters, confirmation gazettes and credentials",
      href: "/admin/documents",
      icon: FileText,
      badge: "Document Vault",
    },
  ]

  return (
    <div className="space-y-6">
      <AnalyticsHeader
        moduleName="Employees & Nominal Roll Intelligence"
        description="Monitor national civil service workforce demographics, biometric & identity verification integrity, grade distributions, and retirement schedules."
      />

      <AnalyticsKpiGrid kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsChartCard
          title="Workforce Grade Level Distribution"
          subtitle="Civil service staff strength categorized by civil service grade cadres"
          className="lg:col-span-2"
        >
          {mounted ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeLevelDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="level" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(val: any) => [val.toLocaleString(), "Officers"]}
                  />
                  <Legend wrapperStyle={{ paddingTop: "12px" }} />
                  <Bar dataKey="count" name="Verified Personnel" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-sm text-gray-400">
              Loading grade distributions...
            </div>
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Geopolitical Zone Distribution"
          subtitle="Percentage origin & deployment representation across the 6 zones"
        >
          {mounted ? (
            <div className="h-72 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={zonalDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {zonalDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 text-xs text-gray-600 mt-2 w-full px-2">
                {zonalDistribution.map((item) => (
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
              Loading zonal spread...
            </div>
          )}
        </AnalyticsChartCard>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Recent Biometrically Verified Personnel</h3>
            <p className="text-xs text-gray-500">Live feed of officers validated against NIMC, BVN and Federal IPPIS credentials</p>
          </div>
          <Badge variant="outline" className="text-xs text-emerald-700 bg-emerald-50 border-emerald-200">
            Dual Biometric Pass
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b">
              <tr>
                <th className="px-5 py-3">IPPIS Number</th>
                <th className="px-4 py-3">Officer Full Name</th>
                <th className="px-4 py-3">MDA / Agency</th>
                <th className="px-4 py-3">Cadre & Grade Level</th>
                <th className="px-4 py-3">NIN Validation</th>
                <th className="px-4 py-3">BVN Audit</th>
                <th className="px-4 py-3">Biometrics</th>
                <th className="px-5 py-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentEnrolments.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-emerald-700">{item.ippisNo}</td>
                  <td className="px-4 py-3.5 font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs">{item.mda}</td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs">{item.cadre}</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                      <BadgeCheck className="w-3 h-3 mr-1" /> {item.ninStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                      {item.bvnStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">
                      {item.biometrics}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-gray-500 text-xs font-mono">{item.date}</td>
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
