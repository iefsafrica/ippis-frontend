"use client"

import React, { useState, useEffect } from "react"
import {
  TrendingUp,
  Target,
  Award,
  LineChart as LineChartIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  Users,
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

const departmentScores = [
  { dept: "Finance & Accounts", score: 92.4, target: 85 },
  { dept: "Human Resources", score: 89.1, target: 85 },
  { dept: "ICT & Digital", score: 94.6, target: 90 },
  { dept: "Planning & Policy", score: 86.8, target: 80 },
  { dept: "Internal Audit", score: 88.2, target: 85 },
  { dept: "Legal & Treaties", score: 84.5, target: 80 },
]

const appraisalDistribution = [
  { name: "Outstanding (A)", value: 410, color: "#008751" },
  { name: "Exceeds Expectations (B)", value: 820, color: "#10b981" },
  { name: "Meets Standards (C)", value: 540, color: "#3b82f6" },
  { name: "Needs Improvement (D)", value: 95, color: "#f59e0b" },
  { name: "Unsatisfactory (E)", value: 25, color: "#ef4444" },
]

const recentAppraisals = [
  {
    ref: "APR-2026-091",
    officer: "Dr. Ngozi Okonjo",
    designation: "Assistant Director (GL 15)",
    department: "Policy & Strategy",
    score: "96.5% (A)",
    status: "Validated",
    reviewedDate: "11 Oct 2026",
  },
  {
    ref: "APR-2026-090",
    officer: "Musa Garba",
    designation: "Senior Administrative Officer (GL 10)",
    department: "Human Resources",
    score: "89.0% (B)",
    status: "Validated",
    reviewedDate: "10 Oct 2026",
  },
  {
    ref: "APR-2026-089",
    officer: "Chidinma Eze",
    designation: "Principal Systems Analyst (GL 12)",
    department: "Information Technology",
    score: "94.2% (A)",
    status: "Validated",
    reviewedDate: "08 Oct 2026",
  },
  {
    ref: "APR-2026-088",
    officer: "Babatunde Adeleke",
    designation: "Accountant I (GL 09)",
    department: "Finance & Accounts",
    score: "86.4% (B)",
    status: "Under Review",
    reviewedDate: "05 Oct 2026",
  },
]

export function PerformanceAnalytics() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const kpis: KpiItem[] = [
    {
      title: "Average Civil Service KPI Score",
      value: "89.3%",
      change: "+3.4%",
      trend: "up",
      comparison: "Civil Service benchmark: 80%",
      icon: Target,
      theme: "emerald",
    },
    {
      title: "Active Institutional Goals",
      value: "512",
      change: "89.2% on-track",
      trend: "up",
      comparison: "2026 Performance Framework",
      icon: TrendingUp,
      theme: "blue",
    },
    {
      title: "Completed Appraisals",
      value: "1,890",
      change: "+280 this week",
      trend: "up",
      comparison: "Annual review cycle",
      icon: Award,
      theme: "purple",
    },
    {
      title: "Top Performing Unit",
      value: "ICT & Digital",
      change: "94.6% rating",
      trend: "up",
      comparison: "Leaderboard leader",
      icon: Sparkles,
      theme: "amber",
    },
  ]

  const quickLinks = [
    {
      title: "Goal Types",
      description: "Define strategic institutional objectives, ministerial milestones, and KPI categories",
      href: "/admin/performance/goal-type",
      icon: Target,
      badge: "Framework",
    },
    {
      title: "Goal Tracking",
      description: "Track real-time completion velocity of departmental deliverables and quarterly goals",
      href: "/admin/performance/goal-tracking",
      icon: TrendingUp,
      badge: "Tracking",
    },
    {
      title: "Performance Indicators (KPIs)",
      description: "Manage quantitative key performance indicators, targets, and scoring weighting",
      href: "/admin/performance/indicator",
      icon: LineChartIcon,
      badge: "Metrics",
    },
    {
      title: "Appraisals & Reviews",
      description: "Conduct bi-annual and annual staff appraisal scoring, 360 feedback, and sign-offs",
      href: "/admin/performance/appraisal",
      icon: Award,
      badge: "Evaluation",
    },
  ]

  return (
    <div className="space-y-6">
      <AnalyticsHeader
        moduleName="Performance & Appraisal Management"
        description="Assess departmental deliverable velocity, civil service appraisal distribution, strategic KPI attainment, and leadership scorecards."
        badgeText="Performance Management"
      />

      <AnalyticsKpiGrid items={kpis} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsChartCard
          title="Departmental KPI Benchmark Attainment"
          subtitle="Department performance score vs national civil service benchmark target (%)"
          className="lg:col-span-2"
          badge="Scorecard"
        >
          {mounted ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentScores} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="dept" stroke="#94a3b8" fontSize={10} interval={0} angle={-10} textAnchor="end" height={35} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[70, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 5 }} />
                  <Bar dataKey="score" name="Attained Score (%)" fill="#008751" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" name="Target Benchmark (%)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] bg-slate-50 animate-pulse rounded-lg" />
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Appraisal Rating Distribution"
          subtitle="Annual civil service appraisal grading breakdown"
          badge="Ratings"
        >
          {mounted ? (
            <div className="h-[280px] w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie
                    data={appraisalDistribution}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {appraisalDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1.5 w-full text-[10px] pt-2 border-t border-slate-100">
                {appraisalDistribution.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 truncate">
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

      {/* Recent Appraisals Table */}
      <AnalyticsChartCard
        title="Recently Concluded Appraisals"
        subtitle="Gazetted annual evaluations validated by ministerial performance evaluation boards"
        badge="Evaluations"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2 font-semibold">Appraisal Ref</th>
                <th className="py-2 font-semibold">Officer Name</th>
                <th className="py-2 font-semibold">Cadre & Grade Level</th>
                <th className="py-2 font-semibold">Department</th>
                <th className="py-2 font-semibold">Final Rating</th>
                <th className="py-2 font-semibold">Review Date</th>
                <th className="py-2 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAppraisals.map((apr, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 font-mono font-bold text-slate-800">{apr.ref}</td>
                  <td className="py-2.5 font-bold text-slate-900">{apr.officer}</td>
                  <td className="py-2.5 text-slate-600">{apr.designation}</td>
                  <td className="py-2.5 text-slate-600">{apr.department}</td>
                  <td className="py-2.5 font-bold text-emerald-800 font-mono">{apr.score}</td>
                  <td className="py-2.5 text-slate-500">{apr.reviewedDate}</td>
                  <td className="py-2.5 text-right">
                    <Badge
                      className={`text-[10px] font-semibold ${
                        apr.status === "Validated"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {apr.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnalyticsChartCard>

      {/* Quick Navigation Links */}
      <QuickNavGrid links={quickLinks} title="Performance Sub-Modules & Operations" />
    </div>
  )
}
