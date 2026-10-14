"use client"

import React, { useState, useEffect } from "react"
import {
  UserPlus,
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  Search,
  ExternalLink,
  Award,
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

const pipelineFunnelData = [
  { stage: "Applications", count: 3840, fill: "#3b82f6" },
  { stage: "Screened", count: 1820, fill: "#6366f1" },
  { stage: "Shortlisted", count: 680, fill: "#8b5cf6" },
  { stage: "Interviewed", count: 240, fill: "#f59e0b" },
  { stage: "Offered", count: 110, fill: "#10b981" },
  { stage: "Enrolled", count: 98, fill: "#008751" },
]

const sourcingChannels = [
  { name: "Federal Portal (IPPIS)", value: 2150, color: "#008751" },
  { name: "Civil Service Commission", value: 890, color: "#3b82f6" },
  { name: "NYSC Direct Absorb", value: 540, color: "#f59e0b" },
  { name: "Internal Progression", value: 260, color: "#8b5cf6" },
]

const activeJobPostings = [
  {
    id: "JOB-2026-081",
    title: "Senior Information Technology Officer (GL 10)",
    mda: "Office of the Accountant-General",
    applicants: 642,
    shortlisted: 45,
    deadline: "30 Oct 2026",
    status: "Active",
  },
  {
    id: "JOB-2026-080",
    title: "Principal Medical Officer (GL 13)",
    mda: "Federal Ministry of Health",
    applicants: 184,
    shortlisted: 28,
    deadline: "05 Nov 2026",
    status: "Interviewing",
  },
  {
    id: "JOB-2026-079",
    title: "Accountant II (GL 08)",
    mda: "Federal Ministry of Finance",
    applicants: 1420,
    shortlisted: 95,
    deadline: "20 Oct 2026",
    status: "Shortlisting",
  },
  {
    id: "JOB-2026-078",
    title: "Civil Engineer I (GL 09)",
    mda: "Federal Ministry of Works",
    applicants: 420,
    shortlisted: 32,
    deadline: "15 Oct 2026",
    status: "Final Review",
  },
]

export function RecruitmentAnalytics() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const kpis: KpiItem[] = [
    {
      title: "Active Open Vacancies",
      value: "24",
      change: "+4 this month",
      trend: "up",
      comparison: "Across 8 MDAs",
      icon: Briefcase,
      theme: "emerald",
    },
    {
      title: "Total Applications",
      value: "3,840",
      change: "+28.4%",
      trend: "up",
      comparison: "Verified submissions",
      icon: Users,
      theme: "blue",
    },
    {
      title: "Candidates in Interview",
      value: "240",
      change: "Phase 2",
      trend: "neutral",
      comparison: "Federal interview boards",
      icon: UserPlus,
      theme: "purple",
    },
    {
      title: "Offer Acceptance Rate",
      value: "91.2%",
      change: "+3.1%",
      trend: "up",
      comparison: "Avg 19 days time-to-hire",
      icon: CheckCircle2,
      theme: "amber",
    },
  ]

  const quickLinks = [
    {
      title: "Job Posts",
      description: "Create, publish, and manage official civil service job announcements",
      href: "/admin/recruitment/job-post",
      icon: Briefcase,
      badge: "Publish",
    },
    {
      title: "Job Candidates",
      description: "Review applicant resumes, NIN verification, and qualification credentials",
      href: "/admin/recruitment/job-candidates",
      icon: Users,
      badge: "Applicants",
    },
    {
      title: "Job Interviews",
      description: "Schedule federal board interview panels, scorecards, and candidate evaluations",
      href: "/admin/recruitment/job-interview",
      icon: Clock,
      badge: "Panels",
    },
    {
      title: "Recruitment CMS",
      description: "Configure career portal branding, eligibility guidelines, and FAQ content",
      href: "/admin/recruitment/cms",
      icon: FileText,
      badge: "Portal CMS",
    },
  ]

  return (
    <div className="space-y-6">
      <AnalyticsHeader
        moduleName="Recruitment & Talent Pipeline"
        description="Track federal employment openings, applicant screening pipelines, interview scorecards, and civil service on-boarding metrics."
        badgeText="Talent Acquisition"
      />

      <AnalyticsKpiGrid items={kpis} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsChartCard
          title="Candidate Pipeline Funnel"
          subtitle="Application progression from initial submission to IPPIS enrolment"
          className="lg:col-span-2"
          badge="Funnel Velocity"
        >
          {mounted ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineFunnelData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="stage" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="count" name="Candidates" fill="#008751" radius={[4, 4, 0, 0]}>
                    {pipelineFunnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] bg-slate-50 animate-pulse rounded-lg" />
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Candidate Sourcing Channels"
          subtitle="Where qualified civil service applicants are originating"
          badge="Channels"
        >
          {mounted ? (
            <div className="h-[280px] w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie
                    data={sourcingChannels}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {sourcingChannels.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 w-full text-[11px] pt-2 border-t border-slate-100">
                {sourcingChannels.map((item, idx) => (
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

      {/* Active Job Postings Table */}
      <AnalyticsChartCard
        title="Active Federal Job Announcements"
        subtitle="Current published civil service openings and candidate volumes"
        badge="Vacancies"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2 font-semibold">Job ID</th>
                <th className="py-2 font-semibold">Designation Title</th>
                <th className="py-2 font-semibold">MDA / Ministry</th>
                <th className="py-2 font-semibold">Total Applicants</th>
                <th className="py-2 font-semibold">Shortlisted</th>
                <th className="py-2 font-semibold">Closing Date</th>
                <th className="py-2 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeJobPostings.map((job, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 font-mono font-bold text-slate-800">{job.id}</td>
                  <td className="py-2.5 font-bold text-slate-900">{job.title}</td>
                  <td className="py-2.5 text-slate-600">{job.mda}</td>
                  <td className="py-2.5 font-mono text-slate-700">{job.applicants.toLocaleString()}</td>
                  <td className="py-2.5 font-mono text-emerald-800 font-bold">{job.shortlisted}</td>
                  <td className="py-2.5 text-slate-500">{job.deadline}</td>
                  <td className="py-2.5 text-right">
                    <Badge
                      className={`text-[10px] font-semibold ${
                        job.status === "Active"
                          ? "bg-emerald-100 text-emerald-800"
                          : job.status === "Interviewing"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {job.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnalyticsChartCard>

      {/* Quick Navigation Links */}
      <QuickNavGrid links={quickLinks} title="Recruitment Sub-Modules & Operations" />
    </div>
  )
}
