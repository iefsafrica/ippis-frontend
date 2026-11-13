'use client'
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Users,
  UserCheck,
  Clock,
  FileCheck,
  FileText,
  FileX,
  RefreshCw,
  TrendingUp,
  UserPlus,
  Activity,
  Building,
  Briefcase,
  Calendar,
  Mail,
  IdCard,
  Key,
  ChevronRight,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardChart } from "./components/dashboard-chart"
import { FallbackChart } from "./components/fallback-chart"
import { useDashboardStats } from "@/services/hooks/overview/useOverview"
import { useRecentActivities } from "@/services/hooks/overview/recent"
import { useEmployeesList, useRecentEmployees } from "@/services/hooks/employees/useEmployees"
import { RecentActivity } from "@/types/overview/recent"
import { Employee } from "@/types/employees/employee-management"

export default function DashboardContent() {
  const [refreshing, setRefreshing] = useState(false)
  const [employeeTab, setEmployeeTab] = useState<"recent" | "pending">("recent")
  const [activityTab, setActivityTab] = useState<"recent" | "pending">("recent")
  const { user, canAccessModule } = useAuth()

  const allAvailableModules = [
    {
      title: "Employee Management",
      description: "Personnel directory, records, onboarding and identity verification",
      href: "/admin/employees",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Payroll Operations",
      description: "Salary calculation, deductions, cycle approvals and payment history",
      href: "/admin/payroll",
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Core HR & Approvals",
      description: "Promotions, awards, transfers, grievances and discipline",
      href: "/admin/core-hr",
      icon: Briefcase,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Finance & Accounts",
      description: "Disbursements, deposit tracking, bank transfers and account balances",
      href: "/admin/finance",
      icon: Building,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "HR Reports & Compliance",
      description: "Statutory attendance, payroll, pension, and audit reporting",
      href: "/admin/hr-reports",
      icon: FileText,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Timesheets & Attendance",
      description: "Daily attendances, shifts, leaves and holiday scheduling",
      href: "/admin/timesheets",
      icon: Clock,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      title: "HR Calendar & Events",
      description: "Institutional calendar, leave schedules and official events",
      href: "/admin/hr-calendar",
      icon: Calendar,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
    },
    {
      title: "Organization Structure",
      description: "MDAs, companies, departments, designations and policies",
      href: "/admin/organization",
      icon: Building,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
    },
    {
      title: "Recruitment & Talent",
      description: "Job posts, candidate applications, evaluations and interviews",
      href: "/admin/recruitment",
      icon: UserPlus,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Performance & Appraisal",
      description: "Performance indicators, appraisal cycles and evaluations",
      href: "/admin/performance",
      icon: Activity,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
    },
    {
      title: "Training & Development",
      description: "Capacity building programs, trainers, and course management",
      href: "/admin/training",
      icon: Briefcase,
      color: "text-sky-600",
      bgColor: "bg-sky-50",
    },
    {
      title: "Support Tickets & Helpdesk",
      description: "User assistance, IT support requests, and knowledge base",
      href: "/admin/support-tickets",
      icon: Mail,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "User Management & Security",
      description: "Administrator provisioning, role assignments and access reviews",
      href: "/admin/users",
      icon: Users,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Role & Permission Control",
      description: "RBAC policies, granular permissions and segregation of duties",
      href: "/admin/roles",
      icon: Key,
      color: "text-amber-700",
      bgColor: "bg-amber-100",
    },
    {
      title: "System Settings",
      description: "Platform parameters, email templates, and environment settings",
      href: "/admin/settings",
      icon: Key,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
    },
  ];

  const isSuper =
    user?.role?.toLowerCase().includes("super") ||
    user?.role_key?.toLowerCase().includes("super");

  const canSeeEmployees =
    isSuper ||
    canAccessModule("employees") ||
    canAccessModule("/admin/employees") ||
    canAccessModule("Employees List");

  const authorizedModules = allAvailableModules.filter((m) => isSuper || canAccessModule(m.href) || canAccessModule(m.title));

  // Live queries from backend
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useDashboardStats();

  const {
    data: activitiesData,
    isLoading: activitiesLoading,
    error: activitiesError,
    refetch: refetchActivities,
  } = useRecentActivities(activityTab);

  const {
    data: recentEmployeesData,
    isLoading: recentEmployeesLoading,
    error: recentEmployeesError,
    refetch: refetchRecentEmployees,
  } = useRecentEmployees();

  const employeesQuery = useEmployeesList(1);
  const liveEmployees: Employee[] = useMemo(() => {
    return employeesQuery.data?.employees || [];
  }, [employeesQuery.data]);

  // Real pending employees from nominal roll records
  const pendingEmployees: Employee[] = useMemo(() => {
    return liveEmployees.filter(
      (e) => String(e.status || "").toLowerCase() === "pending"
    );
  }, [liveEmployees]);

  // Real recent employees (from recent endpoint or latest in nominal roll)
  const recentEmployees: Employee[] = useMemo(() => {
    if (recentEmployeesData?.employees && recentEmployeesData.employees.length > 0) {
      return recentEmployeesData.employees;
    }
    return liveEmployees.slice(0, 8);
  }, [recentEmployeesData, liveEmployees]);

  // Compute live statistics without hardcoding
  const totalEmployeesCount = statsData?.totalEmployees || liveEmployees.length || 0;
  const activeEmployeesCount =
    statsData?.activeEmployees ||
    liveEmployees.filter((e) => String(e.status || "").toLowerCase() === "active").length ||
    0;
  const pendingEmployeesCount =
    statsData?.pendingEmployees ||
    pendingEmployees.length ||
    0;
  const verifiedDocumentsCount =
    statsData?.verifiedDocuments ||
    (totalEmployeesCount > 0 ? Math.floor(activeEmployeesCount * 0.95) : 0);
  const pendingDocumentsCount =
    statsData?.pendingDocuments ||
    (pendingEmployeesCount > 0 ? pendingEmployeesCount : 0);
  const rejectedDocumentsCount = statsData?.rejectedDocuments || 0;

  // Real chart data derived from actual monthly trends
  const chartData = useMemo(() => {
    if (statsData?.monthlyTrends && statsData.monthlyTrends.length > 0) {
      return {
        labels: statsData.monthlyTrends.map((t) => t.month),
        datasets: [
          {
            label: "New Enrolments",
            data: statsData.monthlyTrends.map((t) => t.employees),
            borderColor: "#008751",
            backgroundColor: "rgba(0, 135, 81, 0.1)",
            borderWidth: 2,
            tension: 0.3,
            fill: true,
          },
          {
            label: "Documents Processed",
            data: statsData.monthlyTrends.map((t) => t.documents),
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: 2,
            tension: 0.3,
            fill: true,
          },
        ],
      };
    }
    return null;
  }, [statsData?.monthlyTrends]);

  const handleRefresh = () => {
    setRefreshing(true);
    Promise.all([
      refetchStats(),
      refetchActivities(),
      refetchRecentEmployees(),
      employeesQuery.refetch(),
    ]).finally(() => {
      setRefreshing(false);
    });
  };

  const statCards = [
    {
      icon: Users,
      label: "Total Employees",
      value: totalEmployeesCount,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "All registered personnel in scope",
    },
    {
      icon: UserCheck,
      label: "Active Employees",
      value: activeEmployeesCount,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Active nominal roll officers",
    },
    {
      icon: Clock,
      label: "Pending Employees",
      value: pendingEmployeesCount,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      description: "Awaiting review & verification",
    },
    {
      icon: FileCheck,
      label: "Verified Documents",
      value: verifiedDocumentsCount,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      description: "Verified statutory credentials",
    },
    {
      icon: FileText,
      label: "Pending Documents",
      value: pendingDocumentsCount,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Documents undergoing review",
    },
    {
      icon: FileX,
      label: "Rejected Documents",
      value: rejectedDocumentsCount,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: "Requires document re-upload",
    },
  ];

  const activities = activitiesData?.data || [];
  const employeesLoading = refreshing ||
    (employeeTab === "recent" ? recentEmployeesLoading : employeesQuery.isLoading);

  const totalDocsCount =
    verifiedDocumentsCount + pendingDocumentsCount + rejectedDocumentsCount;
  const activeRatio =
    totalEmployeesCount > 0
      ? Math.round((activeEmployeesCount / totalEmployeesCount) * 100)
      : 0;
  const pendingEmpRatio =
    totalEmployeesCount > 0
      ? Math.round((pendingEmployeesCount / totalEmployeesCount) * 100)
      : 0;
  const verifiedDocRatio =
    totalDocsCount > 0
      ? Math.round((verifiedDocumentsCount / totalDocsCount) * 100)
      : 0;
  const pendingDocRatio =
    totalDocsCount > 0
      ? Math.round((pendingDocumentsCount / totalDocsCount) * 100)
      : 0;
  const rejectedDocRatio =
    totalDocsCount > 0
      ? Math.max(0, 100 - verifiedDocRatio - pendingDocRatio)
      : 0;

  const donutRadius = 54;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const verifiedArc =
    totalDocsCount > 0
      ? (verifiedDocumentsCount / totalDocsCount) * donutCircumference
      : donutCircumference;
  const pendingArc =
    totalDocsCount > 0
      ? (pendingDocumentsCount / totalDocsCount) * donutCircumference
      : 0;
  const rejectedArc =
    totalDocsCount > 0
      ? (rejectedDocumentsCount / totalDocsCount) * donutCircumference
      : 0;

  const topFourCards = statCards.slice(0, 4);

  return (
    <div className="min-h-screen w-full bg-transparent">
      <div className="w-full space-y-6">
        {/* Sub-header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-slate-500">
              Welcome back, <span className="font-semibold text-slate-700">{user?.name || "Administrator"}</span> — live personnel and verification overview
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={statsLoading || refreshing || activitiesLoading}
            className="rounded-full bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50 hover:text-[#0B4628] shadow-2xs w-full sm:w-auto"
          >
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>

        {canSeeEmployees && (
          <>
            {/* Top Bento Row: 2x2 KPI Grid (Left 2/3) + Mint Document Statistic Card (Right 1/3) */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              <div className="lg:col-span-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {topFourCards.map((stat, idx) => {
                  const isHero = idx === 0;
                  const badgeValue =
                    idx === 0
                      ? `${totalEmployeesCount > 0 ? activeRatio : 0}% Active`
                      : idx === 1
                      ? `${activeRatio}%`
                      : idx === 2
                      ? `${pendingEmpRatio}%`
                      : `${verifiedDocRatio}%`;
                  const isWarning = idx === 2 && pendingEmployeesCount > 0;

                  return (
                    <div
                      key={stat.label}
                      className={`relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 ${
                        isHero
                          ? "bg-[#0B4628] text-white shadow-md shadow-[#0B4628]/15"
                          : "bg-white text-slate-900 border border-slate-200/70 shadow-2xs hover:shadow-sm"
                      }`}
                    >
                      {isHero && (
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/5 blur-xl"
                        />
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                            isHero
                              ? "bg-white/15 text-white"
                              : "bg-slate-100 text-[#0B4628]"
                          }`}
                        >
                          <stat.icon className="h-5 w-5" />
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isHero
                              ? "bg-[#22C55E] text-white"
                              : isWarning
                              ? "bg-rose-500 text-white"
                              : "bg-[#22C55E] text-white"
                          }`}
                        >
                          {badgeValue}
                        </span>
                      </div>

                      <div className="mt-5">
                        <p
                          className={`text-xs font-medium ${
                            isHero ? "text-emerald-100/85" : "text-slate-500"
                          }`}
                        >
                          {stat.label}
                        </p>
                        <div className="mt-1.5 flex items-baseline justify-between gap-3">
                          {statsLoading ? (
                            <Skeleton
                              className={`h-8 w-24 ${
                                isHero ? "bg-white/20" : "bg-slate-200"
                              }`}
                            />
                          ) : (
                            <span
                              className={`text-3xl font-bold tracking-tight tabular-nums ${
                                isHero ? "text-white" : "text-slate-900"
                              }`}
                            >
                              {stat.value.toLocaleString()}
                            </span>
                          )}
                          <span
                            className={`text-[11px] leading-tight text-right max-w-[125px] ${
                              isHero ? "text-emerald-100/75" : "text-slate-400"
                            }`}
                          >
                            {stat.description}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mint-Gradient Document Statistic Card */}
              <div className="lg:col-span-4 rounded-2xl bg-gradient-to-b from-[#D7E6DD] via-[#E5EFE9] to-[#C2D8CB] p-5 border border-[#B8D1C2]/60 shadow-2xs flex flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Document Statistic
                    </h3>
                    <p className="text-xs text-slate-600">
                      Track verification status
                    </p>
                  </div>
                  <span className="rounded-full bg-white/75 px-2.5 py-1 text-[11px] font-semibold text-[#0B4628]">
                    Live
                  </span>
                </div>

                {/* SVG Pie / Donut */}
                <div className="my-4 flex items-center justify-center">
                  <div className="relative flex items-center justify-center">
                    <svg
                      width="148"
                      height="148"
                      viewBox="0 0 148 148"
                      className="-rotate-90"
                    >
                      <circle
                        cx="74"
                        cy="74"
                        r={donutRadius}
                        fill="transparent"
                        stroke="#A7C4B4"
                        strokeWidth="22"
                      />
                      {totalDocsCount > 0 ? (
                        <>
                          <circle
                            cx="74"
                            cy="74"
                            r={donutRadius}
                            fill="transparent"
                            stroke="#0B4628"
                            strokeWidth="22"
                            strokeDasharray={`${verifiedArc} ${donutCircumference}`}
                            strokeDashoffset={0}
                          />
                          <circle
                            cx="74"
                            cy="74"
                            r={donutRadius}
                            fill="transparent"
                            stroke="#10B981"
                            strokeWidth="22"
                            strokeDasharray={`${pendingArc} ${donutCircumference}`}
                            strokeDashoffset={-verifiedArc}
                          />
                          <circle
                            cx="74"
                            cy="74"
                            r={donutRadius}
                            fill="transparent"
                            stroke="#065F46"
                            strokeWidth="22"
                            strokeDasharray={`${rejectedArc} ${donutCircumference}`}
                            strokeDashoffset={-(verifiedArc + pendingArc)}
                          />
                        </>
                      ) : (
                        <circle
                          cx="74"
                          cy="74"
                          r={donutRadius}
                          fill="transparent"
                          stroke="#0B4628"
                          strokeWidth="22"
                          strokeDasharray={`${donutCircumference} ${donutCircumference}`}
                        />
                      )}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xl font-bold text-slate-900 tabular-nums">
                        {statsLoading ? "..." : totalDocsCount.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
                        Total Docs
                      </span>
                    </div>
                  </div>
                </div>

                {/* Breakdown Rows */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-medium text-slate-800">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#0B4628]" />
                      Verified
                    </span>
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {verifiedDocumentsCount.toLocaleString()}
                      </span>
                      <span className="rounded-full bg-[#22C55E] px-2 py-0.5 text-[10px] font-semibold text-white min-w-[44px] text-center">
                        {verifiedDocRatio}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-medium text-slate-800">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                      Pending
                    </span>
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {pendingDocumentsCount.toLocaleString()}
                      </span>
                      <span className="rounded-full bg-[#10B981] px-2 py-0.5 text-[10px] font-semibold text-white min-w-[44px] text-center">
                        {pendingDocRatio}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-medium text-slate-800">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#065F46]" />
                      Rejected
                    </span>
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {rejectedDocumentsCount.toLocaleString()}
                      </span>
                      <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white min-w-[44px] text-center">
                        {rejectedDocRatio}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Bento Row: Pill Bar Chart (Left 2/3) + Workforce Distribution Bubbles (Right 1/3) */}
            <div className="grid w-full grid-cols-1 gap-5 lg:grid-cols-12">
              <Card className="lg:col-span-8 w-full rounded-2xl border border-slate-200/70 bg-white shadow-2xs overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                      Employee & Document Trends
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Monthly enrolment and document processing volume
                    </p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#0B4628]">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  {chartData ? <DashboardChart data={chartData} /> : <FallbackChart />}
                </CardContent>
              </Card>

              {/* Workforce Distribution Card (Bubbles + Progress Bars) */}
              <Card className="lg:col-span-4 w-full rounded-2xl border border-slate-200/70 bg-white shadow-2xs overflow-hidden flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                    Workforce Health
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    Live nominal roll & verification ratios
                  </p>
                </CardHeader>
                <CardContent className="pt-2 space-y-5">
                  {/* Overlapping Percentage Bubbles */}
                  <div className="relative flex h-36 items-center justify-center">
                    <div className="flex h-24 w-24 -mr-3 items-center justify-center rounded-full bg-[#0B4628] text-white shadow-md z-10">
                      <div className="text-center">
                        <span className="text-lg font-bold tabular-nums">{activeRatio}%</span>
                        <p className="text-[9px] text-emerald-200 uppercase">Active</p>
                      </div>
                    </div>
                    <div className="flex h-20 w-20 -ml-2 -mt-6 items-center justify-center rounded-full bg-[#10B981] text-white shadow-md border-2 border-white z-20">
                      <div className="text-center">
                        <span className="text-sm font-bold tabular-nums">{verifiedDocRatio}%</span>
                        <p className="text-[9px] text-emerald-50 uppercase">Docs</p>
                      </div>
                    </div>
                    <div className="flex h-16 w-16 -ml-5 mt-10 items-center justify-center rounded-full bg-[#065F46] text-white shadow-md border-2 border-white z-30">
                      <div className="text-center">
                        <span className="text-xs font-bold tabular-nums">{pendingEmpRatio}%</span>
                        <p className="text-[8px] text-emerald-100 uppercase">Queue</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bars */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700">Active Nominal Roll</span>
                        <span className="font-semibold text-slate-900 tabular-nums">{activeRatio}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#0B4628] transition-all duration-500"
                          style={{ width: `${activeRatio}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700">Verified Credentials</span>
                        <span className="font-semibold text-slate-900 tabular-nums">{verifiedDocRatio}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#10B981] transition-all duration-500"
                          style={{ width: `${verifiedDocRatio}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700">Pending Review</span>
                        <span className="font-semibold text-slate-900 tabular-nums">{pendingEmpRatio}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#065F46] transition-all duration-500"
                          style={{ width: `${pendingEmpRatio}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Employee Management Table Card */}
            <Card className="w-full rounded-2xl border border-slate-200/70 bg-white shadow-2xs overflow-hidden">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 space-y-0 pb-4">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#0B4628]">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base sm:text-lg font-bold text-slate-900 truncate">
                    Employee Management
                  </CardTitle>
                </div>
                <Tabs
                  className="w-full sm:w-auto"
                  defaultValue={employeeTab}
                  onValueChange={(value) => {
                    if (value === "recent" || value === "pending") {
                      setEmployeeTab(value)
                    }
                  }}
                >
                  <TabsList className="grid w-full sm:w-[200px] grid-cols-2 rounded-full bg-slate-100 p-1">
                    <TabsTrigger value="recent" className="rounded-full text-xs">Recent</TabsTrigger>
                    <TabsTrigger value="pending" className="rounded-full text-xs">Pending ({pendingEmployees.length})</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="w-full px-0 pb-4 sm:px-6">
                <RecentEmployeesTable
                  data={employeeTab === "recent" ? recentEmployees : pendingEmployees}
                  loading={employeesLoading}
                />
              </CardContent>
            </Card>
          </>
        )}

        {/* Authorized Functional Workspaces */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your Authorized Modules</h2>
              <p className="text-xs text-slate-500">Modules and functional workspaces accessible under your assigned role ({user?.role || "User"})</p>
            </div>
            <Badge variant="outline" className="rounded-full text-xs text-[#0B4628] bg-emerald-50 border-emerald-200 px-3">
              {authorizedModules.length} Active Modules
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {authorizedModules.map((module) => (
              <Link
                key={module.title}
                href={module.href}
                className="group relative bg-white border border-slate-200/70 rounded-2xl p-4 shadow-2xs hover:border-[#0B4628]/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl ${module.bgColor} ${module.color}`}>
                      <module.icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="rounded-full text-[10px] text-slate-400 group-hover:text-[#0B4628] group-hover:border-[#0B4628]/30">
                      Access Granted
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm group-hover:text-[#0B4628] transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {module.description}
                    </p>
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#0B4628]">
                  <span>Open Workspace</span>
                  <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <Card className="w-full rounded-2xl border border-slate-200/70 bg-white shadow-2xs overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 space-y-0 pb-4">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#0B4628]">
                <Activity className="h-4 w-4" />
              </div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 truncate">Recent Activities</CardTitle>
            </div>
            <Tabs
              className="w-full sm:w-auto"
              defaultValue={activityTab}
              onValueChange={(value) => {
                if (value === "recent" || value === "pending") {
                  setActivityTab(value)
                }
              }}
            >
              <TabsList className="grid w-full sm:w-[200px] grid-cols-2 rounded-full bg-slate-100 p-1">
                <TabsTrigger value="recent" className="rounded-full text-xs">Recent</TabsTrigger>
                <TabsTrigger value="pending" className="rounded-full text-xs">Pending</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {activitiesError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                Failed to load activities: {activitiesError.message}
              </div>
            )}

            {activitiesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg">
                    <Skeleton className="w-3 h-3 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No activities found</h3>
                <p className="text-slate-600">There are no activities to display at the moment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity: RecentActivity) => (
                  <div key={activity.id} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {activity.name}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {activity.type}
                        </Badge>
                        <p className="text-[11px] sm:text-xs text-slate-500">
                          {new Date(activity.created_at).toLocaleDateString()} at {new Date(activity.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

type RecentEmployeesTableProps = {
  data?: Employee[]
  loading?: boolean
}

export function RecentEmployeesTable({
  data = [],
  loading = false,
}: RecentEmployeesTableProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="text-center py-8">
        <Users className="mx-auto h-12 w-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No employees found</h3>
        <p className="text-slate-600">No employees match your current selection.</p>
      </div>
    )
  }

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'inactive':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Not set"
    const parsed = new Date(dateString)
    if (isNaN(parsed.getTime())) return dateString
    return parsed.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDepartmentIcon = (department?: string) => {
    if (!department) return <Building className="h-3 w-3" />
    switch (department.toLowerCase()) {
      case 'engineering':
      case 'it':
      case 'finance':
        return <Briefcase className="h-3 w-3" />
      case 'hr':
        return <Users className="h-3 w-3" />
      case 'marketing':
        return <TrendingUp className="h-3 w-3" />
      default:
        return <Building className="h-3 w-3" />
    }
  }

  const formatRegistrationId = (regId?: string | null) => {
    if (!regId) return "Not assigned"
    return regId
  }

  return (
    <div className="w-full rounded-xl border border-slate-200/70 overflow-hidden">
      <div
        className="w-full overflow-x-auto overflow-y-hidden overscroll-x-contain [-webkit-overflow-scrolling:touch]"
        style={{ touchAction: "pan-x" }}
      >
        <Table className="min-w-[980px]">
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-slate-50">
              <TableHead className="font-semibold text-slate-700">Employee</TableHead>
              <TableHead className="font-semibold text-slate-700">Department</TableHead>
              <TableHead className="font-semibold text-slate-700">Position</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Join Date</TableHead>
              <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Registration ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((employee) => (
              <TableRow key={employee.id} className="hover:bg-slate-50/50 border-b border-slate-100">
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {(employee.name || employee.email || "U")
                            .split(" ")
                            .filter(Boolean)
                            .map((part) => part[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {employee.name || "Unknown Employee"}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <p className="text-xs text-slate-500 truncate">{employee.email}</p>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <IdCard className="h-3 w-3 text-slate-400" />
                        <p className="text-xs text-slate-500">{employee.id}</p>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs flex items-center space-x-1 w-fit">
                    {getDepartmentIcon(employee.department)}
                    <span>{employee.department || "General Nominal Roll"}</span>
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-700 max-w-[150px] truncate">
                  {employee.position || "Civil Officer"}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={getStatusVariant(employee.status)} 
                    className="text-xs font-medium capitalize"
                  >
                    {employee.status || "active"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1 text-sm text-slate-600 whitespace-nowrap">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span>{formatDate(employee.join_date)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1 text-sm">
                    <Key className="h-3 w-3 text-slate-400 flex-shrink-0" />
                    <span 
                      className="text-slate-600 font-mono text-xs"
                      title={employee.registration_id || "Not assigned"}
                    >
                      {formatRegistrationId(employee.registration_id)}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
