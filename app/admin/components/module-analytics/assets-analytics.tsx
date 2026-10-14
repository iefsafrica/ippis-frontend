"use client"

import React, { useState, useEffect } from "react"
import {
  Package,
  Layers3,
  Warehouse,
  Wrench,
  ShieldCheck,
  Tag,
  Truck,
  Monitor,
  CheckCircle2,
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

const assetValuationData = [
  { category: "ICT & Data Infrastructure", value: 1450, count: 4820 },
  { category: "Fleet & Transport", value: 980, count: 420 },
  { category: "Office Equipment & Plant", value: 620, count: 3200 },
  { category: "Facility & Fixtures", value: 780, count: 2100 },
  { category: "Security & Biometric Kits", value: 450, count: 4280 },
]

const assetStatusBreakdown = [
  { name: "In Active Use", value: 68, color: "#10b981" },
  { name: "Assigned to MDA", value: 18, color: "#3b82f6" },
  { name: "Available in Store", value: 8, color: "#8b5cf6" },
  { name: "Under Maintenance", value: 4, color: "#f59e0b" },
  { name: "Scheduled for Disposal", value: 2, color: "#ef4444" },
]

const recentCapitalAllocations = [
  {
    assetTag: "IPPIS-AST-00891",
    name: "Enterprise Core Biometric Server Cluster (Dell PowerEdge R760)",
    category: "ICT Infrastructure",
    assignedTo: "National Data Centre, Abuja",
    acquisitionCost: "₦45,000,000",
    dateAllocated: "Oct 04, 2026",
    status: "In Use",
  },
  {
    assetTag: "IPPIS-AST-00842",
    name: "Field Verification Mobile Biometric Kits (Batch 4 - 50 Units)",
    category: "Biometric Hardware",
    assignedTo: "Zone B Zonal Audit Taskforce",
    acquisitionCost: "₦28,500,000",
    dateAllocated: "Sep 22, 2026",
    status: "Assigned",
  },
  {
    assetTag: "IPPIS-AST-00780",
    name: "500kVA Heavy Duty Standby Generator (Perkins Engine)",
    category: "Facility & Plant",
    assignedTo: "Federal Secretariat Phase II",
    acquisitionCost: "₦62,000,000",
    dateAllocated: "Aug 15, 2026",
    status: "In Use",
  },
  {
    assetTag: "IPPIS-AST-00712",
    name: "Operational Escort & Inspection Vehicles (Toyota Hilux 4x4)",
    category: "Fleet & Transport",
    assignedTo: "Directorate Monitoring & Compliance",
    acquisitionCost: "₦54,000,000",
    dateAllocated: "Jul 30, 2026",
    status: "In Use",
  },
]

export function AssetsAnalytics() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(false)
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  const kpis: KpiItem[] = [
    {
      title: "Total Asset Valuation",
      value: "₦4.28 Billion",
      change: "+8.4%",
      trend: "up",
      comparison: "audited balance sheet",
      icon: Package,
      theme: "emerald",
    },
    {
      title: "Total Registered Asset Units",
      value: "14,820",
      change: "+320 new",
      trend: "up",
      comparison: "across all 6 geopolitical zones",
      icon: Tag,
      theme: "blue",
    },
    {
      title: "Operational Service Rate",
      value: "92.4%",
      change: "+1.2%",
      trend: "up",
      comparison: "in active production duty",
      icon: ShieldCheck,
      theme: "purple",
    },
    {
      title: "Maintenance & Workshop Load",
      value: "4.2%",
      change: "-0.8%",
      trend: "up",
      comparison: "within scheduled SLA threshold",
      icon: Wrench,
      theme: "amber",
    },
  ]

  const quickLinks = [
    {
      title: "Asset Categories",
      description: "Classify assets, depreciation profiles and life-cycle bands",
      href: "/admin/assets/category",
      icon: Layers3,
      badge: "Taxonomy",
    },
    {
      title: "Full Asset Catalog",
      description: "Search, filter and inspect asset tags, serials and custodians",
      href: "/admin/assets/list",
      icon: Warehouse,
      badge: "14,820 Assets",
    },
    {
      title: "Live Operations & Registry",
      description: "Process new allocations, transfer assets, record maintenance",
      href: "/admin/assets",
      icon: Package,
      badge: "CRUD Operations",
    },
  ]

  return (
    <div className="space-y-6">
      <AnalyticsHeader
        moduleName="Assets & Capital Inventory"
        description="Monitor fixed asset portfolios, tracking valuation, custodial deployments, depreciation schedules, and maintenance cycles across Federal MDAs."
      />

      <AnalyticsKpiGrid kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsChartCard
          title="Asset Valuation by Capital Category (Millions ₦)"
          subtitle="Fixed asset book valuation and registered equipment units"
          className="lg:col-span-2"
        >
          {mounted ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assetValuationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: any) => [`₦${value}M`, "Book Valuation"]}
                  />
                  <Legend wrapperStyle={{ paddingTop: "12px" }} />
                  <Bar dataKey="value" name="Valuation (₦ Millions)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-sm text-gray-400">
              Loading asset values...
            </div>
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Lifecycle & Operational Status"
          subtitle="Percentage distribution of registered assets by current condition"
        >
          {mounted ? (
            <div className="h-72 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={assetStatusBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {assetStatusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 text-xs text-gray-600 mt-2 w-full px-2">
                {assetStatusBreakdown.map((item) => (
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
              Loading asset status...
            </div>
          )}
        </AnalyticsChartCard>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">High-Value Capital Asset Deployments</h3>
            <p className="text-xs text-gray-500">Major infrastructure and equipment assigned to federal operational commands</p>
          </div>
          <Badge variant="outline" className="text-xs text-emerald-700 bg-emerald-50 border-emerald-200">
            Fixed Asset Register
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b">
              <tr>
                <th className="px-5 py-3">Asset Tag ID</th>
                <th className="px-4 py-3">Description / Model</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Custodian MDA / Site</th>
                <th className="px-4 py-3 text-right">Acquisition Cost</th>
                <th className="px-4 py-3">Allocated Date</th>
                <th className="px-5 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentCapitalAllocations.map((ast, i) => (
                <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-emerald-700">{ast.assetTag}</td>
                  <td className="px-4 py-3.5 font-medium text-gray-900 max-w-xs">{ast.name}</td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs">{ast.category}</td>
                  <td className="px-4 py-3.5 text-gray-600">{ast.assignedTo}</td>
                  <td className="px-4 py-3.5 text-right font-semibold text-gray-900 font-mono">{ast.acquisitionCost}</td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs font-mono">{ast.dateAllocated}</td>
                  <td className="px-5 py-3.5 text-center">
                    <Badge
                      className={
                        ast.status === "In Use"
                          ? "bg-emerald-100 text-emerald-800 border-none"
                          : "bg-blue-100 text-blue-800 border-none"
                      }
                    >
                      {ast.status}
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
