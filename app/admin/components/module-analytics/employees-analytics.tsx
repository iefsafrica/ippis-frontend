"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  Users,
  UserCheck,
  Clock3,
  ShieldCheck,
  Award,
  Upload,
  FileText,
  BadgeCheck,
  RefreshCw,
  AlertCircle,
  Building2,
  Calendar,
  Fingerprint,
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
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEmployeeAnalytics } from "@/services/hooks/employees/useEmployees"
import type { ZonalDistributionItem } from "@/types/employees/analytics"

const ZONAL_COLOR_MAP: Record<string, string> = {
  "North Central": "#10b981",
  "North West": "#3b82f6",
  "South West": "#8b5cf6",
  "South South": "#f59e0b",
  "North East": "#06b6d4",
  "South East": "#ec4899",
}

const FALLBACK_PALETTE = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#06b6d4", "#ec4899"]

export function EmployeesAnalytics() {
  const [mounted, setMounted] = useState(false)
  const [retirementMonths, setRetirementMonths] = useState<number>(12)

  const { data, isLoading, isError, error, refetch, isFetching } = useEmployeeAnalytics({
    retirement_months: retirementMonths,
  })

  useEffect(() => {
    setMounted(false)
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  const kpis: KpiItem[] = useMemo(() => {
    const rawKpis = data?.kpis

    const verifiedPersonnel = rawKpis?.total_verified_personnel
    const biometricIntegrity = rawKpis?.biometric_nin_integrity
    const pendingAudit = rawKpis?.pending_enrolment_audit
    const retirements = rawKpis?.upcoming_statutory_retirements

    return [
      {
        title: "Total Verified Personnel",
        value:
          verifiedPersonnel?.value != null
            ? Number(verifiedPersonnel.value).toLocaleString()
            : isLoading
              ? "..."
              : "0",
        change:
          verifiedPersonnel?.change_percentage != null
            ? `${verifiedPersonnel.change_percentage > 0 ? "+" : ""}${verifiedPersonnel.change_percentage}%`
            : undefined,
        trend: (verifiedPersonnel?.trend as "up" | "down" | "neutral") || "neutral",
        comparison: verifiedPersonnel?.description || "active on nominal roll",
        icon: Users,
        theme: "emerald",
      },
      {
        title: "Biometric & NIN Integrity",
        value:
          biometricIntegrity?.value != null
            ? `${biometricIntegrity.value}%`
            : isLoading
              ? "..."
              : "0%",
        change:
          biometricIntegrity?.change_percentage != null
            ? `${biometricIntegrity.change_percentage > 0 ? "+" : ""}${biometricIntegrity.change_percentage}%`
            : undefined,
        trend: (biometricIntegrity?.trend as "up" | "down" | "neutral") || "neutral",
        comparison: biometricIntegrity?.description || "NIMC dual-match verified",
        icon: ShieldCheck,
        theme: "blue",
      },
      {
        title: "Pending Enrolment Audit",
        value:
          pendingAudit?.value != null
            ? Number(pendingAudit.value).toLocaleString()
            : isLoading
              ? "..."
              : "0",
        change:
          pendingAudit?.change_percentage != null
            ? `${pendingAudit.change_percentage > 0 ? "+" : ""}${pendingAudit.change_percentage}%`
            : undefined,
        trend: (pendingAudit?.trend as "up" | "down" | "neutral") || "neutral",
        comparison: pendingAudit?.description || "awaiting physical review",
        icon: Clock3,
        theme: "purple",
      },
      {
        title: "Upcoming Statutory Retirements",
        value:
          retirements?.value != null
            ? Number(retirements.value).toLocaleString()
            : isLoading
              ? "..."
              : "0",
        change: retirements?.timeframe || `Next ${retirementMonths} mo`,
        trend: "neutral",
        comparison: retirements?.description || "60 yrs age or 35 yrs service",
        icon: Award,
        theme: "amber",
      },
    ]
  }, [data, isLoading, retirementMonths])

  const gradeLevelDistribution = useMemo(() => {
    return data?.grade_distribution || []
  }, [data])

  const zonalDistribution = useMemo<ZonalDistributionItem[]>(() => {
    const raw = data?.zonal_distribution || []
    return raw.map((item, index) => ({
      ...item,
      color:
        item.color ||
        ZONAL_COLOR_MAP[item.name] ||
        FALLBACK_PALETTE[index % FALLBACK_PALETTE.length],
    }))
  }, [data])

  const recentEnrolments = useMemo(() => {
    return data?.recent_verified || []
  }, [data])

  const verificationStats = data?.verification_stats
  const retirementsData = data?.retirements
  const scope = data?.scope

  const quickLinks = useMemo(() => {
    const totalCount = data?.kpis?.total_verified_personnel?.value
    const pendingCount = data?.kpis?.pending_enrolment_audit?.value

    return [
      {
        title: "Active Employee Nominal Roll",
        description: "Search, filter and inspect verified civil service personnel",
        href: "/admin/employees?tab=employee",
        icon: UserCheck,
        badge: totalCount != null ? `${Number(totalCount).toLocaleString()} Active` : "Nominal Roll",
      },
      {
        title: "Pending Employees Queue",
        description: "Review unapproved registrants, NIN checks and approval workflow",
        href: "/admin/employees?tab=pending",
        icon: Clock3,
        badge: pendingCount != null ? `${Number(pendingCount).toLocaleString()} Pending` : "Pending Queue",
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
  }, [data])

  return (
    <div className="space-y-6">
      <AnalyticsHeader
        moduleName="Employees & Nominal Roll"
        description="Monitor national civil service workforce demographics, biometric & identity verification integrity, grade distributions, and retirement schedules."
        onRefresh={() => refetch()}
      />

      {/* Scope and Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-700">
          <Building2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold text-slate-900">Current Scope:</span>
          <span className="text-slate-600">
            {scope?.mda_name || "All MDAs (Federal Nominal Roll)"}
          </span>
          {scope?.department_id && (
            <Badge variant="secondary" className="text-[10px]">
              Dept #{scope.department_id}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Retirement Window:</span>
          </div>
          <Select
            value={String(retirementMonths)}
            onValueChange={(val) => setRetirementMonths(Number(val))}
          >
            <SelectTrigger className="w-[125px] h-8 text-xs bg-slate-50 border-slate-200">
              <SelectValue placeholder="Window" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">Next 6 Months</SelectItem>
              <SelectItem value="12">Next 12 Months</SelectItem>
              <SelectItem value="24">Next 24 Months</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8 text-xs border-slate-200 gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {isError && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 flex items-start justify-between gap-3 text-rose-800">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Failed to load workforce analytics data</p>
              <p className="text-xs text-rose-700 mt-0.5">
                {error?.message || "An unexpected error occurred while communicating with the analytics service."}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            className="border-rose-300 text-rose-800 hover:bg-rose-100 h-8 text-xs flex-shrink-0"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Primary KPI Grid */}
      <AnalyticsKpiGrid kpis={kpis} />

      {/* Verification Pipeline Metrics (if provided by API) */}
      {verificationStats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>NIN Verified</span>
            </div>
            <div className="text-lg font-bold text-slate-900">
              {Number(verificationStats.nin_verified || 0).toLocaleString()}
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <Fingerprint className="w-3.5 h-3.5 text-blue-600" />
              <span>BVN Linked</span>
            </div>
            <div className="text-lg font-bold text-slate-900">
              {Number(verificationStats.bvn_verified || 0).toLocaleString()}
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Dual Verified</span>
            </div>
            <div className="text-lg font-bold text-slate-900">
              {Number(verificationStats.dual_verified || 0).toLocaleString()}
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <Clock3 className="w-3.5 h-3.5 text-amber-600" />
              <span>Pending Review</span>
            </div>
            <div className="text-lg font-bold text-slate-900">
              {Number(verificationStats.pending_verification || 0).toLocaleString()}
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Unlinked Records</span>
            </div>
            <div className="text-lg font-bold text-slate-900">
              {Number(verificationStats.unlinked_records || 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsChartCard
          title="Workforce Grade Level Distribution"
          subtitle="Civil service staff strength categorized by civil service grade cadres"
          className="lg:col-span-2"
        >
          {isLoading ? (
            <div className="h-72 flex items-center justify-center text-sm text-gray-400">
              <RefreshCw className="w-5 h-5 animate-spin mr-2 text-emerald-600" />
              Loading grade distributions...
            </div>
          ) : mounted && gradeLevelDistribution.length > 0 ? (
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
                    formatter={(val: any, _name: any, item: any) => {
                      const pct = item?.payload?.percentage
                      return [
                        `${Number(val).toLocaleString()} Officers${pct != null ? ` (${pct}%)` : ""}`,
                        "Staff Strength",
                      ]
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "12px" }} />
                  <Bar dataKey="count" name="Verified Personnel" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-sm text-gray-400">
              <p>No grade level distribution data available</p>
            </div>
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Geopolitical Zone Distribution"
          subtitle="Percentage origin & deployment representation across the 6 zones"
        >
          {isLoading ? (
            <div className="h-72 flex items-center justify-center text-sm text-gray-400">
              <RefreshCw className="w-5 h-5 animate-spin mr-2 text-emerald-600" />
              Loading zonal spread...
            </div>
          ) : mounted && zonalDistribution.length > 0 ? (
            <div className="h-72 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
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
                  <Tooltip
                    formatter={(val: any, _name: any, item: any) => {
                      const count = item?.payload?.count
                      return [
                        `${val}%${count ? ` (${Number(count).toLocaleString()} personnel)` : ""}`,
                        "Share",
                      ]
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 text-xs text-gray-600 mt-2 w-full px-2 max-h-32 overflow-y-auto">
                {zonalDistribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800">
                      {item.value}%
                      {item.count ? (
                        <span className="text-[10px] text-gray-400 font-normal ml-1">
                          ({Number(item.count).toLocaleString()})
                        </span>
                      ) : null}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-sm text-gray-400">
              <p>No geopolitical distribution data available</p>
            </div>
          )}
        </AnalyticsChartCard>
      </div>

      {/* Upcoming Statutory Retirements Summary Card (PSR Rule 020810) */}
      {retirementsData && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-gray-900">
                  Statutory Retirement Projections (PSR Rule 020810)
                </h3>
                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                  Window: {retirementsData.projected_window_months || retirementMonths} Months
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Projections based on 60 years of age or 35 years of pensionable service threshold.
              </p>
            </div>
            <div className="text-sm font-semibold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 self-start sm:self-auto">
              Total Due: {Number(retirementsData.total_due || 0).toLocaleString()} Officers
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">By Age Limit (60 Years)</div>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {Number(retirementsData.breakdown?.by_age_60 || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Reached maximum statutory age</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">By Length of Service (35 Years)</div>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {Number(retirementsData.breakdown?.by_service_35 || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Completed 35 years pensionable service</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Both Criteria Met</div>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {Number(retirementsData.breakdown?.by_both || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Concurrently fulfilled both conditions</p>
            </div>
          </div>

          {retirementsData.upcoming_sample && retirementsData.upcoming_sample.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Sample Upcoming Retirees (Next in Queue)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                    <tr>
                      <th className="px-3 py-2">IPPIS No</th>
                      <th className="px-3 py-2">Officer Name</th>
                      <th className="px-3 py-2">MDA</th>
                      <th className="px-3 py-2">Cadre</th>
                      <th className="px-3 py-2">Projected Date</th>
                      <th className="px-3 py-2">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {retirementsData.upcoming_sample.map((sample, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="px-3 py-2 font-mono font-semibold text-emerald-700">{sample.ippis_no}</td>
                        <td className="px-3 py-2 font-medium text-slate-900">{sample.name}</td>
                        <td className="px-3 py-2 text-slate-600">{sample.mda}</td>
                        <td className="px-3 py-2 text-slate-600">{sample.grade_level}</td>
                        <td className="px-3 py-2 font-mono text-slate-700 font-medium">{sample.projected_retirement_date}</td>
                        <td className="px-3 py-2">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            {sample.reason}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Live Biometrically Verified Personnel Table */}
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
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                      <span>Loading recent verification entries...</span>
                    </div>
                  </td>
                </tr>
              ) : recentEnrolments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-500">
                    No recent biometrically verified personnel records available.
                  </td>
                </tr>
              ) : (
                recentEnrolments.map((item, i) => (
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
