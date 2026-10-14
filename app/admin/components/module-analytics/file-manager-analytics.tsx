"use client"

import React, { useState, useEffect } from "react"
import {
  FolderOpen,
  FileText,
  HardDrive,
  ShieldCheck,
  UploadCloud,
  FileCheck2,
  FileCode,
  FileSpreadsheet,
  Lock,
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

const storageByMda = [
  { mda: "OHCSF", storageGB: 920, filesCount: 34100 },
  { mda: "Finance & OAGF", storageGB: 1240, filesCount: 42800 },
  { mda: "Health & Clinics", storageGB: 680, filesCount: 22100 },
  { mda: "Works & Infra", storageGB: 510, filesCount: 16900 },
  { mda: "Foreign Affairs", storageGB: 440, filesCount: 14200 },
  { mda: "Defence & Police", storageGB: 810, filesCount: 28820 },
]

const fileFormatBreakdown = [
  { name: "Official PDFs & Gazettes", value: 48, color: "#10b981" },
  { name: "Scanned Biometrics & Signatures", value: 24, color: "#3b82f6" },
  { name: "Spreadsheets & Payroll Datasets", value: 16, color: "#8b5cf6" },
  { name: "Encrypted Backups & Archives", value: 8, color: "#f59e0b" },
  { name: "Word Docs & Letters", value: 4, color: "#06b6d4" },
]

const recentOfficialDocs = [
  {
    docNo: "CIRC-2026-FGN-048",
    title: "Harmonization of Civil Service Grade Level 13-17 Consolidated Allowances",
    category: "Federal Circular",
    uploadedBy: "Permanent Secretary, OHCSF",
    fileSize: "4.8 MB",
    uploadedAt: "Oct 12, 2026",
    classification: "Official / Secret",
  },
  {
    docNo: "WARR-2026-Q4-012",
    title: "Federal Personnel Cost Warrant Release - 4th Quarter 2026",
    category: "Financial Warrant",
    uploadedBy: "Director of Funds, OAGF",
    fileSize: "12.2 MB",
    uploadedAt: "Oct 08, 2026",
    classification: "Confidential",
  },
  {
    docNo: "AUD-2026-NIMC-SYNC",
    title: "Tripartite Biometric Verification Audit Certificate (NIMC / IPPIS / PenCom)",
    category: "Audit Certificate",
    uploadedBy: "Technical Systems Lead",
    fileSize: "8.1 MB",
    uploadedAt: "Oct 01, 2026",
    classification: "Restricted",
  },
  {
    docNo: "POL-2026-DISC-003",
    title: "Revised Public Service Rules (PSR 2026) Chapter 3 Discipline Guidelines",
    category: "Policy Document",
    uploadedBy: "Legal & Regulatory Unit",
    fileSize: "18.5 MB",
    uploadedAt: "Sep 28, 2026",
    classification: "Public Official",
  },
]

export function FileManagerAnalytics() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(false)
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  const kpis: KpiItem[] = [
    {
      title: "Active Cloud Storage",
      value: "4.6 TB",
      change: "46% of 10TB",
      trend: "neutral",
      comparison: "secure enterprise bucket",
      icon: HardDrive,
      theme: "emerald",
    },
    {
      title: "Total Indexed Documents",
      value: "158,920",
      change: "+12.4%",
      trend: "up",
      comparison: "across 42 Federal MDAs",
      icon: FileText,
      theme: "blue",
    },
    {
      title: "Official Gazettes & Circulars",
      value: "3,410",
      change: "+48 this mo",
      trend: "up",
      comparison: "statutory circulars",
      icon: FileCheck2,
      theme: "purple",
    },
    {
      title: "Data Encryption & Security",
      value: "100%",
      change: "AES-256",
      trend: "up",
      comparison: "full cryptographic compliance",
      icon: Lock,
      theme: "amber",
    },
  ]

  const quickLinks = [
    {
      title: "File Manager Workspace",
      description: "Folder directory, cloud buckets, file uploads and permissions",
      href: "/admin/file-manager/dashboard",
      icon: FolderOpen,
      badge: "Main Storage",
    },
    {
      title: "Official Documents",
      description: "Archived circulars, gazettes, warrants and executive memos",
      href: "/admin/file-manager/official-documents",
      icon: FileText,
      badge: "3,410 Docs",
    },
    {
      title: "Storage Configuration",
      description: "Bucket quota policies, file extensions, encryption keys",
      href: "/admin/file-manager/configuration",
      icon: HardDrive,
      badge: "Settings",
    },
  ]

  return (
    <div className="space-y-6">
      <AnalyticsHeader
        moduleName="File Manager & Document Archive"
        description="Monitor electronic records management, cloud document quotas, official gazettes, and classified civil service circulars."
      />

      <AnalyticsKpiGrid kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsChartCard
          title="Storage Consumption by Primary Ministry (Gigabytes)"
          subtitle="Cloud capacity allocation and indexing throughput across key ministries"
          className="lg:col-span-2"
        >
          {mounted ? (
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
                    formatter={(val: any) => [`${val} GB`, "Storage Used"]}
                  />
                  <Legend wrapperStyle={{ paddingTop: "12px" }} />
                  <Bar dataKey="storageGB" name="Used Space (GB)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-sm text-gray-400">
              Loading storage data...
            </div>
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Document Format Classification"
          subtitle="Percentage distribution by file type and security metadata"
        >
          {mounted ? (
            <div className="h-72 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={210}>
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 text-xs text-gray-600 mt-2 w-full px-2">
                {fileFormatBreakdown.map((item) => (
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
              Loading document breakdown...
            </div>
          )}
        </AnalyticsChartCard>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Official Gazettes & Classified Circulars</h3>
            <p className="text-xs text-gray-500">Recently catalogued government instruments and legal notices</p>
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
              {recentOfficialDocs.map((doc, i) => (
                <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-blue-600">{doc.docNo}</td>
                  <td className="px-4 py-3.5 font-medium text-gray-900 max-w-xs">{doc.title}</td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs">{doc.category}</td>
                  <td className="px-4 py-3.5 text-gray-600">{doc.uploadedBy}</td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs font-mono">{doc.fileSize}</td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs font-mono">{doc.uploadedAt}</td>
                  <td className="px-5 py-3.5 text-center">
                    <Badge
                      className={
                        doc.classification.includes("Secret")
                          ? "bg-rose-100 text-rose-800 border-none"
                          : doc.classification.includes("Confidential")
                          ? "bg-amber-100 text-amber-800 border-none"
                          : "bg-emerald-100 text-emerald-800 border-none"
                      }
                    >
                      {doc.classification}
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
