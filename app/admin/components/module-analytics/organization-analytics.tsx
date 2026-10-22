"use client"

import React, { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import {
  Building2,
  Building,
  MapPin,
  Briefcase,
  Megaphone,
  FileText,
  Plus,
  Loader2,
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
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  AnalyticsHeader,
  AnalyticsKpiGrid,
  AnalyticsChartCard,
  QuickNavGrid,
  KpiItem,
} from "./analytics-ui"
import { useGetCompanies } from "@/services/hooks/organizations/company/useCompany"
import { useGetDepartments } from "@/services/hooks/organizations/department/useDepartment"
import { useGetLocations } from "@/services/hooks/organizations/location/useLocation"
import { useGetDesignations } from "@/services/hooks/organizations/designation/useDesignation"
import { useGetAnnouncements } from "@/services/hooks/organizations/announcement/useAnnouncement"
import { useGetCompanyPolicies } from "@/services/hooks/organizations/company-policy/useCompanyPolicy"

export function OrganizationAnalytics() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const {
    data: companiesData,
    isLoading: isLoadingCompanies,
    refetch: refetchCompanies,
  } = useGetCompanies()

  const {
    data: departmentsData,
    isLoading: isLoadingDepartments,
    refetch: refetchDepartments,
  } = useGetDepartments()

  const {
    data: locationsData,
    isLoading: isLoadingLocations,
    refetch: refetchLocations,
  } = useGetLocations()

  const {
    data: designationsData,
    isLoading: isLoadingDesignations,
    refetch: refetchDesignations,
  } = useGetDesignations()

  const {
    data: announcementsData,
    isLoading: isLoadingAnnouncements,
    refetch: refetchAnnouncements,
  } = useGetAnnouncements()

  const {
    data: policiesData,
    isLoading: isLoadingPolicies,
    refetch: refetchPolicies,
  } = useGetCompanyPolicies()

  const companies = useMemo(() => companiesData?.data || [], [companiesData])
  const departments = useMemo(() => departmentsData?.data || [], [departmentsData])
  const locations = useMemo(() => locationsData?.data || [], [locationsData])
  const designations = useMemo(() => designationsData?.data || [], [designationsData])
  const announcements = useMemo(() => announcementsData?.data || [], [announcementsData])
  const policies = useMemo(() => policiesData?.data || [], [policiesData])

  const activeCompanies = useMemo(
    () => companies.filter((c) => (c.status || "active").toLowerCase() === "active").length,
    [companies]
  )

  const activeDepartments = useMemo(
    () => departments.filter((d) => (d.status || "active").toLowerCase() === "active").length,
    [departments]
  )

  const activeDesignations = useMemo(
    () => designations.filter((d) => (d.status || "active").toLowerCase() === "active").length,
    [designations]
  )

  const activeLocations = useMemo(
    () => locations.filter((l) => (l.status || "active").toLowerCase() === "active").length,
    [locations]
  )

  const uniqueStates = useMemo(() => {
    const states = new Set(
      locations
        .map((l) => l.state?.trim())
        .filter((s): s is string => Boolean(s && s.length > 0))
    )
    return Array.from(states)
  }, [locations])

  const handleRefresh = async () => {
    try {
      await Promise.allSettled([
        refetchCompanies(),
        refetchDepartments(),
        refetchLocations(),
        refetchDesignations(),
        refetchAnnouncements(),
        refetchPolicies(),
      ])
      toast.success("Organization metrics updated from live APIs")
    } catch {
      toast.error("Failed to refresh organization records")
    }
  }

  const kpis: KpiItem[] = [
    {
      title: "Federal MDAs & Agencies",
      value: isLoadingCompanies ? "..." : companies.length.toString(),
      change: `${activeCompanies} Active`,
      trend: "up",
      comparison:
        companies.length === 1 ? "1 entity configured" : `${companies.length} entities registered`,
      icon: Building,
      theme: "emerald",
    },
    {
      title: "Directorates & Departments",
      value: isLoadingDepartments ? "..." : departments.length.toString(),
      change: `${activeDepartments} Active`,
      trend: "neutral",
      comparison: `Across institutional divisions`,
      icon: Building2,
      theme: "blue",
    },
    {
      title: "Designated Cadres",
      value: isLoadingDesignations ? "..." : designations.length.toString(),
      change: `${activeDesignations} Active`,
      trend: "neutral",
      comparison: "Public Service Schema",
      icon: Briefcase,
      theme: "purple",
    },
    {
      title: "Federal Duty Stations",
      value: isLoadingLocations ? "..." : locations.length.toString(),
      change: `${activeLocations} Active`,
      trend: "up",
      comparison:
        uniqueStates.length > 0
          ? `${uniqueStates.length} State${uniqueStates.length === 1 ? "" : "s"} Covered`
          : "Nationwide footprint",
      icon: MapPin,
      theme: "amber",
    },
  ]

  const mdaDepartmentDistribution = useMemo(() => {
    if (!companies.length) return []
    const compMap = new Map<string, { mda: string; departments: number; active: number }>()

    companies.forEach((comp) => {
      compMap.set(String(comp.id), {
        mda: comp.name || `MDA #${comp.id}`,
        departments: 0,
        active: 0,
      })
    })

    departments.forEach((dept) => {
      const key = String(dept.company_id)
      const existing = compMap.get(key)
      if (existing) {
        existing.departments += 1
        if ((dept.status || "active").toLowerCase() === "active") {
          existing.active += 1
        }
      } else {
        compMap.set(key, {
          mda: `MDA ${key}`,
          departments: 1,
          active: (dept.status || "active").toLowerCase() === "active" ? 1 : 0,
        })
      }
    })

    const list = Array.from(compMap.values())
    list.sort((a, b) => b.departments - a.departments)
    return list.slice(0, 6)
  }, [companies, departments])

  const geoDistribution = useMemo(() => {
    if (!locations.length) return []
    const stateCounts: Record<string, number> = {}

    locations.forEach((loc) => {
      const key = loc.state?.trim() || loc.city?.trim() || "Unspecified Region"
      stateCounts[key] = (stateCounts[key] || 0) + 1
    })

    const palette = ["#008751", "#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4"]

    return Object.entries(stateCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], idx) => ({
        name,
        value,
        color: palette[idx % palette.length],
      }))
  }, [locations])

  const quickLinks = [
    {
      title: "Companies & MDAs",
      description: "Manage ministry profiles, federal statutory charters, and entity governance records",
      href: "/admin/organization/company",
      icon: Building,
      badge: `${companies.length} MDAs`,
    },
    {
      title: "Departments & Directorates",
      description: "Create and maintain internal directorates, reporting divisions, and organograms",
      href: "/admin/organization/department",
      icon: Building2,
      badge: `${departments.length} Directorates`,
    },
    {
      title: "Duty Locations & Stations",
      description: "Manage state secretariats, zonal headquarters, and regional branch duty posts",
      href: "/admin/organization/location",
      icon: MapPin,
      badge: `${locations.length} Stations`,
    },
    {
      title: "Cadres & Designations",
      description: "Configure civil service ranks, job titles, and career progression schemas",
      href: "/admin/organization/designation",
      icon: Briefcase,
      badge: `${designations.length} Cadres`,
    },
    {
      title: "Internal Announcements",
      description: "Publish service-wide circulars, official gazettes, and ministerial notifications",
      href: "/admin/organization/announcements",
      icon: Megaphone,
      badge: `${announcements.length} Circulars`,
    },
    {
      title: "Company & Service Policies",
      description: "Maintain official civil service policy documents, versions, and compliance guides",
      href: "/admin/organization/company-policy",
      icon: FileText,
      badge: `${policies.length} Policies`,
    },
  ]

  const isInitialLoading =
    isLoadingCompanies || isLoadingDepartments || isLoadingLocations || isLoadingDesignations

  return (
    <div className="space-y-6">
      <AnalyticsHeader
        moduleName="Organization & Institutional Structure"
        description="Audit federal ministerial structures, organograms, geographical station distribution, active cadres, and official circular compliance."
        badgeText="Institutional Governance"
        onRefresh={handleRefresh}
      />

      <AnalyticsKpiGrid items={kpis} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsChartCard
          title="Directorates per Federal MDA"
          subtitle="Distribution of administrative departments and divisions by agency"
          className="lg:col-span-2"
          badge="Structure"
        >
          {!mounted || isInitialLoading ? (
            <div className="h-[280px] bg-slate-50 flex items-center justify-center animate-pulse rounded-lg">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : mdaDepartmentDistribution.length === 0 ? (
            <div className="h-[280px] flex flex-col items-center justify-center text-center p-4">
              <Building2 className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-600">No MDA structure data available</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Add ministry and directorate records to view institutional distribution charts.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-4">
                <Link href="/admin/organization/company">Add MDA</Link>
              </Button>
            </div>
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mdaDepartmentDistribution}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="mda"
                    stroke="#94a3b8"
                    fontSize={10}
                    interval={0}
                    angle={-10}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
                    formatter={(value: any, name: any) => [
                      value,
                      name === "departments" ? "Total Departments" : "Active Departments",
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 5 }} />
                  <Bar
                    dataKey="departments"
                    name="Total Departments"
                    fill="#008751"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="active"
                    name="Active Departments"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Duty Station Geographical Spread"
          subtitle="Regional distribution of federal duty posts and state stations"
          badge="Stations"
        >
          {!mounted || isInitialLoading ? (
            <div className="h-[280px] bg-slate-50 flex items-center justify-center animate-pulse rounded-lg">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : geoDistribution.length === 0 ? (
            <div className="h-[280px] flex flex-col items-center justify-center text-center p-4">
              <MapPin className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-600">No duty stations registered</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Configure state branch offices and zonal secretariats to see regional spread.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-4">
                <Link href="/admin/organization/location">Add Location</Link>
              </Button>
            </div>
          ) : (
            <div className="h-[280px] w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={geoDistribution}
                    innerRadius={46}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {geoDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [
                      `${val} station${val === 1 ? "" : "s"}`,
                      "Count",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-1 gap-1 w-full text-[10px] pt-2 border-t border-slate-100 max-h-[90px] overflow-y-auto">
                {geoDistribution.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate text-slate-600 font-medium">{item.name}</span>
                    </div>
                    <span className="font-mono text-slate-700 font-bold">
                      {item.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </AnalyticsChartCard>
      </div>

      {/* Recent Circulars Table */}
      <AnalyticsChartCard
        title="Active Service Circulars & Announcements"
        subtitle="Current federal directives and administrative notices published on the IPPIS intranet"
        badge="Directives"
        action={
          <Button asChild size="sm" variant="outline" className="h-7 text-xs">
            <Link href="/admin/organization/announcements">
              <Plus className="h-3 w-3 mr-1" /> New Circular
            </Link>
          </Button>
        }
      >
        {isLoadingAnnouncements ? (
          <div className="py-12 flex items-center justify-center text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-xs">Loading live circulars...</span>
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-10 text-center flex flex-col items-center justify-center">
            <div className="p-3 bg-slate-100 rounded-full text-slate-400 mb-2">
              <Megaphone className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-semibold text-slate-700">No Service Circulars Published</h4>
            <p className="text-[11px] text-slate-500 max-w-sm mt-1">
              Directives and service gazettes published under Organization Announcements will appear here in real-time.
            </p>
            <Button asChild size="sm" className="mt-3 bg-[#008751] hover:bg-[#007043] text-white text-xs h-7">
              <Link href="/admin/organization/announcements">
                <Plus className="h-3 w-3 mr-1" /> Publish First Circular
              </Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2 font-semibold">Notice ID</th>
                  <th className="py-2 font-semibold">Circular Subject</th>
                  <th className="py-2 font-semibold">Issuing Authority</th>
                  <th className="py-2 font-semibold">Target Audience</th>
                  <th className="py-2 font-semibold">Date Published</th>
                  <th className="py-2 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {announcements.map((ann, idx) => (
                  <tr key={ann.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 font-mono font-bold text-slate-800">
                      {ann.company_code
                        ? `${ann.company_code}-${ann.id}`
                        : `ANN-${String(ann.id).padStart(3, "0")}`}
                    </td>
                    <td className="py-2.5 font-bold text-slate-900 max-w-sm truncate">
                      {ann.title}
                    </td>
                    <td className="py-2.5 text-slate-600">
                      {ann.company_code || "Federal IPPIS"}
                    </td>
                    <td className="py-2.5 text-slate-600">
                      {ann.audience || "Service-wide"}
                    </td>
                    <td className="py-2.5 text-slate-500">
                      {ann.publish_date || ann.created_at
                        ? new Date(
                            (ann.publish_date || ann.created_at) as string
                          ).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "Draft"}
                    </td>
                    <td className="py-2.5 text-right">
                      <Badge
                        className={`text-[10px] font-semibold ${
                          (ann.status || "").toLowerCase() === "published"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {ann.status || "Draft"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AnalyticsChartCard>

      {/* Quick Navigation Links */}
      <QuickNavGrid links={quickLinks} title="Organization Sub-Modules & Operations" />
    </div>
  )
}
