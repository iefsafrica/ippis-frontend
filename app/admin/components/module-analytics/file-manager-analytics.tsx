"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  FolderOpen,
  FileText,
  HardDrive,
  ShieldCheck,
  FileCheck2,
  Lock,
  RefreshCw,
  AlertCircle,
  Building2,
  Filter,
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
import { useFileManagerAnalytics } from "@/services/hooks/file-manager/analytics"

export function FileManagerAnalytics() {
  const [mounted, setMounted] = useState(false)
  const [classificationFilter, setClassificationFilter] = useState<string>("all")

  const { data, isLoading, isError, error, refetch, isFetching } = useFileManagerAnalytics({
    classification: classificationFilter === "all" ? undefined : classificationFilter,
  })

  useEffect(() => {
    setMounted(false)
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  const kpis: KpiItem[] = useMemo(() => {
    const rawKpis = data?.kpis

    const storage = rawKpis?.active_cloud_storage
    const docs = rawKpis?.total_indexed_documents
    const gazettes = rawKpis?.official_gazettes_circulars
    const encryption = rawKpis?.data_encryption_security

    return [
      {
        title: "Active Cloud Storage",
        value: storage?.value || (isLoading ? "..." : "0 MB"),
        change: storage?.change || "10TB baseline quota",
        trend: (storage?.trend as "up" | "down" | "neutral") || "neutral",
        comparison: storage?.comparison || "secure enterprise bucket",
        icon: HardDrive,
        theme: "emerald",
      },
      {
        title: "Total Indexed Documents",
        value: docs?.formatted || (docs?.value != null ? Number(docs.value).toLocaleString() : (isLoading ? "..." : "0")),
        change: docs?.change || "live files",
        trend: (docs?.trend as "up" | "down" | "neutral") || "up",
        comparison: docs?.comparison || "across Federal MDAs",
        icon: FileText,
        theme: "blue",
      },
      {
        title: "Official Gazettes & Circulars",
        value: gazettes?.formatted || (gazettes?.value != null ? Number(gazettes.value).toLocaleString() : (isLoading ? "..." : "0")),
        change: gazettes?.change || "official repository",
        trend: (gazettes?.trend as "up" | "down" | "neutral") || "up",
        comparison: gazettes?.comparison || "statutory circulars & gazettes",
        icon: FileCheck2,
        theme: "purple",
      },
      {
        title: "Data Encryption & Security",
        value: encryption?.value || (isLoading ? "..." : "100%"),
        change: encryption?.change || "AES-256",
        trend: (encryption?.trend as "up" | "down" | "neutral") || "up",
        comparison: encryption?.comparison || "full cryptographic compliance",
        icon: Lock,
        theme: "amber",
      },
    ]
  }, [data, isLoading])

  const storageByMda = useMemo(() => {
    return data?.storage_by_mda || []
  }, [data])

  const fileFormatBreakdown = useMemo(() => {
    return data?.format_breakdown || []
  }, [data])

  const recentOfficialDocs = useMemo(() => {
    return data?.recent_official_docs || []
  }, [data])

  const scope = data?.scope

  const quickLinks = useMemo(() => {
    const totalDocs = data?.kpis?.total_indexed_documents?.formatted || data?.kpis?.total_indexed_documents?.value
    const totalStorage = data?.kpis?.active_cloud_storage?.value

    return [
      {
        title: "File Manager Workspace",
        description: "Folder directory, cloud buckets, file uploads and permissions",
        href: "/admin/file-manager/dashboard",
        icon: FolderOpen,
        badge: totalStorage ? `${totalStorage} Used` : "Main Storage",
      },
      {
        title: "Official Documents",
        description: "Archived circulars, gazettes, warrants and executive memos",
        href: "/admin/file-manager/official-documents",
        icon: FileText,
        badge: totalDocs ? `${totalDocs} Docs` : "Document Vault",
      },
      {
        title: "Storage Configuration",
        description: "Bucket quota policies, file extensions, encryption keys",
        href: "/admin/file-manager/configuration",
        icon: HardDrive,
        badge: "Settings",
      },
    ]
  }, [data])

  const getClassificationBadge = (classification: string) => {
    const lower = classification.toLowerCase()
    if (lower.includes("secret")) {
      return "bg-rose-100 text-rose-800 border-rose-200"
    }
    if (lower.includes("confidential")) {
      return "bg-amber-100 text-amber-800 border-amber-200"
    }
    if (lower.includes("restricted")) {
      return "bg-purple-100 text-purple-800 border-purple-200"
    }
    return "bg-emerald-100 text-emerald-800 border-emerald-200"
  }

  return (
    <div className="space-y-6">
      <AnalyticsHeader
        moduleName="File Manager & Document Archive"
        description="Monitor electronic records management, cloud document quotas, official gazettes, and classified civil service circulars."
        onRefresh={() => refetch()}
      />

      {/* Scope and Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-700">
          <Building2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold text-slate-900">Current Scope:</span>
          <span className="text-slate-600">
            {scope?.mda_name || "All MDAs (Federal Document Vault)"}
          </span>
          {scope?.mda_id && (
            <Badge variant="secondary" className="text-[10px]">
              MDA #{scope.mda_id}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Classification:</span>
          </div>
          <Select
            value={classificationFilter}
            onValueChange={setClassificationFilter}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs bg-slate-50 border-slate-200">
              <SelectValue placeholder="Classification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Secret">Secret</SelectItem>
              <SelectItem value="Confidential">Confidential</SelectItem>
              <SelectItem value="Restricted">Restricted</SelectItem>
              <SelectItem value="Public">Public Official</SelectItem>
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
              <p className="font-semibold text-sm">Failed to load file manager analytics</p>
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

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsChartCard
          title="Storage Consumption by Primary Ministry (Gigabytes)"
          subtitle="Cloud capacity allocation and indexing throughput across key ministries"
          className="lg:col-span-2"
        >
          {isLoading ? (
            <div className="h-72 flex items-center justify-center text-sm text-gray-400">
              <RefreshCw className="w-5 h-5 animate-spin mr-2 text-emerald-600" />
              Loading storage data...
            </div>
          ) : mounted && storageByMda.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={storageByMda}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mda" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(val: any, _name: any, item: any) => [
                      `${val} GB (${item?.payload?.filesCount || 0} Files)`,
                      "Storage Used",
                    ]}
                  />
                  <Legend wrapperStyle={{ paddingTop: "12px" }} />
                  <Bar dataKey="storageGB" name="Used Space (GB)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-sm text-gray-400">
              <p>No storage usage by MDA recorded yet</p>
            </div>
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Document Format Classification"
          subtitle="Percentage distribution by file type and security metadata"
        >
          {isLoading ? (
            <div className="h-72 flex items-center justify-center text-sm text-gray-400">
              <RefreshCw className="w-5 h-5 animate-spin mr-2 text-emerald-600" />
              Loading document breakdown...
            </div>
          ) : mounted && fileFormatBreakdown.length > 0 ? (
            <div className="h-72 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={fileFormatBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {fileFormatBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, _name: any, item: any) => [
                      `${val}% (${item?.payload?.count || 0} files)`,
                      "Share",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 text-xs text-gray-600 mt-2 w-full px-2 max-h-32 overflow-y-auto">
                {fileFormatBreakdown.map((item) => (
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
                      <span className="text-[10px] text-gray-400 font-normal ml-1">
                        ({item.count})
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-sm text-gray-400">
              <p>No document format data available</p>
            </div>
          )}
        </AnalyticsChartCard>
      </div>

      {/* Official Gazettes & Classified Circulars Feed */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Official Gazettes & Classified Circulars</h3>
            <p className="text-xs text-gray-500">Live feed of catalogued government instruments and legal notices</p>
          </div>
          <Badge variant="outline" className="text-xs text-blue-700 bg-blue-50 border-blue-200">
            Audit Vault Protected
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b">
              <tr>
                <th className="px-5 py-3">Document Code</th>
                <th className="px-4 py-3">Title / Subject</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Authorizing Custodian</th>
                <th className="px-4 py-3">File Size</th>
                <th className="px-4 py-3">Upload Date</th>
                <th className="px-5 py-3 text-center">Security Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                      <span>Loading catalogued documents...</span>
                    </div>
                  </td>
                </tr>
              ) : recentOfficialDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-500">
                    No documents found matching the selected filter.
                  </td>
                </tr>
              ) : (
                recentOfficialDocs.map((doc, i) => (
                  <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-blue-600">{doc.docNo}</td>
                    <td className="px-4 py-3.5 font-medium text-gray-900 max-w-xs truncate" title={doc.title}>
                      {doc.title}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 text-xs">{doc.category}</td>
                    <td className="px-4 py-3.5 text-gray-600">{doc.uploadedBy}</td>
                    <td className="px-4 py-3.5 text-gray-600 text-xs font-mono">{doc.fileSize}</td>
                    <td className="px-4 py-3.5 text-gray-600 text-xs font-mono">{doc.uploadedAt}</td>
                    <td className="px-5 py-3.5 text-center">
                      <Badge variant="outline" className={`text-xs ${getClassificationBadge(doc.classification)}`}>
                        {doc.classification}
                      </Badge>
                    </td>
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
