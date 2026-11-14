"use client"

import { useState, useEffect, useMemo } from "react"
import {
  CalendarIcon,
  Download,
  Filter,
  BarChart,
  Loader2,
  Printer,
  Users,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MdaSelect } from "@/components/mda-select"
import { format, subMonths } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import {
  ReportsService,
  type OverviewStats,
  type DepartmentStats,
  type EmployeeGrowthData,
} from "../services/real-reports-service"
import { getEmployeesList } from "@/services/endpoints/employees/employees"
import { getPendingEmployees, getDocuments } from "@/services/endpoints/employees/pendingEmployees"
import { buttonHoverEnhancements } from "../employees/button-hover"

const isWithinDateRange = (rawDate: string, startDate: Date, endDate: Date) => {
  const value = new Date(rawDate)
  if (Number.isNaN(value.getTime())) return false
  return value >= startDate && value <= endDate
}

const normalizeDepartment = (department: string | undefined | null) =>
  String(department ?? "").trim().toLowerCase()

const departmentMatches = (employeeDepartment: string | undefined | null, selectedDepartment: string) => {
  const selected = normalizeDepartment(selectedDepartment)
  const current = normalizeDepartment(employeeDepartment)

  if (selected === "all") return true
  if (current === selected) return true

  if (selected === "hr") return current === "human resources"
  if (selected === "it") return current === "information technology"
  return false
}

const mdaMatches = (employee: any, selectedMda: string) => {
  if (!selectedMda || selectedMda === "all") return true
  const empMdaId = String(
    employee?.company_id ??
      employee?.mda_id ??
      employee?.metadata?.company_id ??
      employee?.metadata?.mda_id ??
      ""
  ).trim()
  return empMdaId === String(selectedMda).trim()
}

const getMonthLabels = (startDate: Date, endDate: Date) => {
  const labels: string[] = []
  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1)

  while (cursor <= end) {
    labels.push(format(cursor, "MMM yyyy"))
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return labels
}

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
})

const formatCurrency = (value: number) => currencyFormatter.format(Number.isFinite(value) ? value : 0)

const getEmployeesForAllPages = async () => {
  const firstPage = await getEmployeesList(1)
  const totalPages = firstPage?.pagination?.totalPages ?? 1
  const firstEmployees = firstPage?.employees ?? []

  if (totalPages <= 1) return firstEmployees

  const remaining = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, idx) => getEmployeesList(idx + 2)),
  )

  const merged = [...firstEmployees, ...remaining.flatMap((page) => page.employees ?? [])]
  return Array.from(new Map(merged.map((employee) => [employee.id, employee])).values())
}

const getPendingForAllPages = async () => {
  const pageSize = 100
  const firstPage = await getPendingEmployees(1, pageSize)
  const totalPages = firstPage?.data?.pagination?.totalPages ?? 1
  const firstEmployees = firstPage?.data?.employees ?? []

  if (totalPages <= 1) return firstEmployees

  const remaining = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, idx) => getPendingEmployees(idx + 2, pageSize)),
  )

  return [...firstEmployees, ...remaining.flatMap((page) => page.data?.employees ?? [])]
}
const DEPARTMENT_CHART_COLORS = [
  "#0B4628",
  "#10B981",
  "#34D399",
  "#065F46",
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#64748B",
]

export function ReportsContent() {
  const [mounted, setMounted] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 12))
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [selectedMda, setSelectedMda] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<string>("overview")

  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null)
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[] | null>(null)
  const [employeeGrowthData, setEmployeeGrowthData] = useState<EmployeeGrowthData | null>(null)
  const [scopedEmployeesList, setScopedEmployeesList] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  const growthChartSeries = useMemo(() => {
    if (!employeeGrowthData?.labels?.length) return []
    const seriesData = employeeGrowthData.datasets?.[0]?.data ?? []
    return employeeGrowthData.labels.map((label, index) => ({
      month: label,
      employees: Number(seriesData[index] ?? 0),
    }))
  }, [employeeGrowthData])

  const departmentChartData = useMemo(() => {
    if (!departmentStats?.length) return []
    return departmentStats.map((dept, index) => ({
      name: dept.name || "Unassigned",
      count: Number(dept.count ?? 0),
      percentage: Number(dept.percentage ?? 0),
      color: DEPARTMENT_CHART_COLORS[index % DEPARTMENT_CHART_COLORS.length],
    }))
  }, [departmentStats])

  // Load data based on active tab and filters
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        const filters = {
          startDate,
          endDate,
          department: selectedDepartment,
        }

        switch (activeTab) {
          case "overview":
            const [allEmployees, allPendingEmployees, documentsResponse] = await Promise.all([
              getEmployeesForAllPages(),
              getPendingForAllPages(),
              getDocuments().catch(() => null),
            ])

            const employeesInScope = allEmployees.filter((employee) => {
              return (
                departmentMatches(employee.department, selectedDepartment) &&
                mdaMatches(employee, selectedMda)
              )
            })

            setScopedEmployeesList(employeesInScope)

            const pendingInScope = allPendingEmployees.filter((employee) => {
              return (
                departmentMatches(employee.department, selectedDepartment) &&
                mdaMatches(employee, selectedMda)
              )
            })

            const currentYear = new Date().getFullYear()
            const lastYear = currentYear - 1

            const newHires = employeesInScope.filter((employee) => {
              const joinDate = new Date(employee.join_date)
              return !Number.isNaN(joinDate.getTime()) && joinDate.getFullYear() === currentYear
            }).length

            const lastYearHires = employeesInScope.filter((employee) => {
              const joinDate = new Date(employee.join_date)
              return !Number.isNaN(joinDate.getTime()) && joinDate.getFullYear() === lastYear
            }).length

            const growthRate =
              lastYearHires > 0
                ? ((newHires - lastYearHires) / lastYearHires) * 100
                : newHires > 0
                  ? 100
                  : 0

            const totalEmployees = employeesInScope.length
            const pendingApprovals = pendingInScope.length
            const approvalRate =
              totalEmployees + pendingApprovals > 0
                ? (totalEmployees / (totalEmployees + pendingApprovals)) * 100
                : 0

            const hasDepartmentFilter = normalizeDepartment(selectedDepartment) !== "all"
            const employeesByRegistration = new Map(
              employeesInScope
                .filter((employee) => employee.registration_id)
                .map((employee) => [String(employee.registration_id), employee]),
            )

            const docsData = Array.isArray(documentsResponse)
              ? documentsResponse
              : (documentsResponse?.data ?? [])
            const documentSubmissions = docsData.filter((row) => {
              if (!row.uploadedAt) return false
              if (!isWithinDateRange(row.uploadedAt, startDate, endDate)) return false
              if (!hasDepartmentFilter) return true
              const matchedEmployee = employeesByRegistration.get(String(row.registrationId))
              return departmentMatches(matchedEmployee?.department, selectedDepartment)
            }).length

            const overview: OverviewStats = {
              totalEmployees,
              newHires,
              pendingApprovals,
              documentSubmissions,
              growthRate: Number(growthRate.toFixed(1)),
              approvalRate: Number(approvalRate.toFixed(1)),
            }

            const labels = getMonthLabels(startDate, endDate)
            const trendData = labels.map((label) => {
              const [monthLabel, yearLabel] = label.split(" ")
              const monthStart = new Date(`${monthLabel} 1, ${yearLabel}`)
              const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
              return employeesInScope.filter((employee) => {
                const joinDate = new Date(employee.join_date)
                return !Number.isNaN(joinDate.getTime()) && joinDate <= monthEnd
              }).length
            })

            const growthData: EmployeeGrowthData = {
              labels,
              datasets: [{ label: "Employees", data: trendData }],
            }

            const departmentCountMap = new Map<string, number>()
            employeesInScope.forEach((employee) => {
              const key = employee.department || "Unassigned"
              departmentCountMap.set(key, (departmentCountMap.get(key) ?? 0) + 1)
            })

            const deptStats: DepartmentStats[] = Array.from(departmentCountMap.entries()).map(([name, count]) => ({
              name,
              count,
              percentage: totalEmployees > 0 ? Number(((count / totalEmployees) * 100).toFixed(1)) : 0,
            }))

            setOverviewStats(overview)
            setEmployeeGrowthData(growthData)
            setDepartmentStats(deptStats)
            break

          case "employees":
            const employeesForTab = await getEmployeesForAllPages()
            const scopedEmployeesForTab = employeesForTab.filter((employee) => {
              return (
                departmentMatches(employee.department, selectedDepartment) &&
                mdaMatches(employee, selectedMda)
              )
            })
            setScopedEmployeesList(scopedEmployeesForTab)

            const labelsForTab = getMonthLabels(startDate, endDate)
            const trendDataForTab = labelsForTab.map((label) => {
              const [monthLabel, yearLabel] = label.split(" ")
              const monthStart = new Date(`${monthLabel} 1, ${yearLabel}`)
              const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
              return scopedEmployeesForTab.filter((employee) => {
                const joinDate = new Date(employee.join_date)
                return !Number.isNaN(joinDate.getTime()) && joinDate <= monthEnd
              }).length
            })

            setEmployeeGrowthData({
              labels: labelsForTab,
              datasets: [{ label: "Employees", data: trendDataForTab }],
            })

            const departmentMapForTab = new Map<string, number>()
            scopedEmployeesForTab.forEach((employee) => {
              const key = employee.department || "Unassigned"
              departmentMapForTab.set(key, (departmentMapForTab.get(key) ?? 0) + 1)
            })

            setDepartmentStats(
              Array.from(departmentMapForTab.entries()).map(([name, count]) => ({
                name,
                count,
                percentage:
                  scopedEmployeesForTab.length > 0
                    ? Number(((count / scopedEmployeesForTab.length) * 100).toFixed(1))
                    : 0,
              })),
            )
            break
        }
      } catch (err) {
        console.error("Error loading report data:", err)
        setError("Failed to load report data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [activeTab, startDate, endDate, selectedDepartment, selectedMda])

  const handlePrintEmployeesByMda = () => {
    if (typeof window === "undefined") return
    const printWin = window.open("", "_blank", "width=1024,height=768")
    if (!printWin) return

    const mdaLabel =
      selectedMda === "all"
        ? "All MDAs"
        : scopedEmployeesList[0]?.mda_name ||
          scopedEmployeesList[0]?.company_name ||
          scopedEmployeesList[0]?.metadata?.mda_name ||
          `MDA #${selectedMda}`

    const deptLabel = selectedDepartment === "all" ? "All Departments" : selectedDepartment

    const rowsHtml =
      scopedEmployeesList.length === 0
        ? `<tr><td colspan="7" style="text-align:center;padding:24px;color:#64748b;">No employees match the selected MDA / Department filters.</td></tr>`
        : scopedEmployeesList
            .map((emp: any, idx: number) => {
              const id = emp.registration_id || emp.ippis_number || emp.employee_id || emp.id || "-"
              const mda = emp.mda_name || emp.company_name || emp.metadata?.mda_name || mdaLabel
              const joinDate = emp.join_date ? format(new Date(emp.join_date), "dd MMM yyyy") : "-"
              return `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${String(id)}</td>
                  <td><strong>${emp.name || "Unknown"}</strong><br/><span style="color:#64748b;font-size:11px;">${emp.email || ""}</span></td>
                  <td>${mda}</td>
                  <td>${emp.department || "General"}</td>
                  <td>${emp.position || "Civil Officer"}</td>
                  <td style="text-transform:capitalize;">${emp.status || "active"}</td>
                  <td>${joinDate}</td>
                </tr>
              `
            })
            .join("")

    printWin.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Employee Report - ${mdaLabel}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #0f172a; padding: 28px; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0B4628; padding-bottom: 14px; margin-bottom: 18px; }
            .header-left { display: flex; align-items: center; gap: 14px; }
            .header img { height: 56px; width: auto; }
            h1 { margin: 0; font-size: 20px; color: #0B4628; }
            .meta { font-size: 12px; color: #475569; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
            th { background: #0B4628; color: #fff; text-align: left; padding: 8px 10px; }
            td { border-bottom: 1px solid #e2e8f0; padding: 8px 10px; vertical-align: top; }
            tr:nth-child(even) td { background: #f8fafc; }
            @media print { body { padding: 12px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-left">
              <img src="${window.location.origin}/images/coat-of-arms.png" alt="Coat of Arms" />
              <div>
                <h1>IPPIS Employee Nominal Roll Report</h1>
                <div class="meta">MDA: <strong>${mdaLabel}</strong> &bull; Department: <strong>${deptLabel}</strong> &bull; Total Employees: <strong>${scopedEmployeesList.length}</strong></div>
              </div>
            </div>
            <div class="meta">Printed: ${format(new Date(), "dd MMM yyyy HH:mm")}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>ID / IPPIS</th>
                <th>Employee</th>
                <th>MDA</th>
                <th>Department</th>
                <th>Position</th>
                <th>Status</th>
                <th>Join Date</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </body>
      </html>
    `)
    printWin.document.close()
    printWin.focus()
    setTimeout(() => printWin.print(), 300)
  }

  // Handle exporting data
  const handleExportData = async () => {
    try {
      let reportType = "overview"

      switch (activeTab) {
        case "overview":
          reportType = "overview"
          break
        case "employees":
          reportType = "employees"
          break
      }

      const filters = {
        startDate,
        endDate,
        department: selectedDepartment,
      }

      const blob = await ReportsService.exportReportData(reportType, "json", filters)

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `ippis-${reportType}-report-${format(new Date(), "yyyy-MM-dd")}.json`
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Error exporting data:", err)
      setError("Failed to export report data. Please try again.")
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 flex items-center justify-center shadow-sm">
            <BarChart className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Reports & Analytics
            </h1>
            <p className="text-gray-600 mt-1">Insights and trends across employees and departments.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={handlePrintEmployeesByMda}
            disabled={loading}
            className={`${buttonHoverEnhancements} bg-white border-emerald-200 text-[#0B4628] hover:bg-emerald-50`}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print by MDA
          </Button>
          <Button
            onClick={handleExportData}
            disabled={loading}
            className={`${buttonHoverEnhancements} bg-emerald-600 text-white shadow-sm hover:bg-emerald-800 hover:!bg-emerald-800`}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="w-[220px]">
          <MdaSelect
            value={selectedMda === "all" ? "" : selectedMda}
            onValueChange={(val) => setSelectedMda(val || "all")}
            placeholder="All MDAs"
          />
        </div>

        <Select
          value={selectedDepartment}
          onValueChange={setSelectedDepartment}
        >
        <SelectTrigger className={`${buttonHoverEnhancements} w-[180px]`}>
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="hr">Human Resources</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="it">Information Technology</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`${buttonHoverEnhancements} w-[240px] justify-start text-left font-normal`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button
          variant="outline"
          onClick={() => {
            // Reset filters to default
            setDate(new Date());
            setStartDate(subMonths(new Date(), 12));
            setEndDate(new Date());
            setSelectedDepartment("all");
            setSelectedMda("all");
          }}
          className={buttonHoverEnhancements}
        >
          <Filter className="mr-2 h-4 w-4" />
          Reset Filters
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="flex w-full max-w-[360px] items-center justify-between gap-2 rounded-full border border-emerald-200 bg-white p-1 text-center shadow-sm">
          <TabsTrigger
            value="overview"
            className="flex-1 rounded-full border border-emerald-200 bg-white px-5 py-2 text-sm font-semibold text-emerald-900 transition-colors data-[state=active]:border-transparent data-[state=active]:bg-emerald-700 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="employees"
            className="flex-1 rounded-full border border-emerald-200 bg-white px-5 py-2 text-sm font-semibold text-emerald-900 transition-colors data-[state=active]:border-transparent data-[state=active]:bg-emerald-700 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Employees
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading report data...</span>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-xl border border-gray-200 bg-white shadow-sm transition-colors hover:border-emerald-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">
                      Total Employees
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {overviewStats?.totalEmployees || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {overviewStats?.growthRate && overviewStats.growthRate > 0
                        ? "+"
                        : ""}
                      {overviewStats?.growthRate || 0}% from last year
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border border-gray-200 bg-white shadow-sm transition-colors hover:border-emerald-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">
                      New Hires
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {overviewStats?.newHires || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Current fiscal year
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border border-gray-200 bg-white shadow-sm transition-colors hover:border-emerald-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">
                      Pending Approvals
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {overviewStats?.pendingApprovals || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Approval rate: {overviewStats?.approvalRate || 0}%
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border border-gray-200 bg-white shadow-sm transition-colors hover:border-emerald-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">
                      Document Submissions
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {overviewStats?.documentSubmissions || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      For selected period
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 rounded-xl border border-gray-200 bg-white shadow-sm transition-colors hover:border-emerald-200">
                  <CardHeader>
                    <CardTitle>Employee Growth</CardTitle>
                    <CardDescription>
                      Monthly employee count over the selected period
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    {mounted && growthChartSeries.length > 0 ? (
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={growthChartSeries}
                            margin={{ top: 12, right: 16, left: 0, bottom: 4 }}
                          >
                            <defs>
                              <linearGradient id="employeeGrowthFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.32} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                            <XAxis
                              dataKey="month"
                              tick={{ fill: "#64748B", fontSize: 12 }}
                              axisLine={{ stroke: "#E5E7EB" }}
                              tickLine={false}
                            />
                            <YAxis
                              allowDecimals={false}
                              tick={{ fill: "#64748B", fontSize: 12 }}
                              axisLine={false}
                              tickLine={false}
                              width={40}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#FFFFFF",
                                borderColor: "#D1FAE5",
                                borderRadius: "10px",
                                boxShadow: "0 4px 12px rgba(11, 70, 40, 0.08)",
                              }}
                              formatter={(value: number) => [value.toLocaleString(), "Employees"]}
                            />
                            <Area
                              type="monotone"
                              dataKey="employees"
                              stroke="#0B4628"
                              strokeWidth={2.5}
                              fill="url(#employeeGrowthFill)"
                              activeDot={{ r: 5, fill: "#0B4628", stroke: "#FFFFFF", strokeWidth: 2 }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[300px] w-full flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-muted/10">
                        <span className="text-sm text-muted-foreground">No employee growth data available</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card className="col-span-3 rounded-xl border border-gray-200 bg-white shadow-sm transition-colors hover:border-emerald-200">
                  <CardHeader>
                    <CardTitle>Department Distribution</CardTitle>
                    <CardDescription>Employees by department</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {mounted && departmentChartData.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        <div className="h-[220px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={departmentChartData}
                                dataKey="count"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={52}
                                outerRadius={84}
                                paddingAngle={2}
                              >
                                {departmentChartData.map((entry) => (
                                  <Cell key={entry.name} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#FFFFFF",
                                  borderColor: "#D1FAE5",
                                  borderRadius: "10px",
                                  boxShadow: "0 4px 12px rgba(11, 70, 40, 0.08)",
                                }}
                                formatter={(value: number, name: string, item: any) => [
                                  `${value.toLocaleString()} (${item?.payload?.percentage ?? 0}%)`,
                                  name,
                                ]}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="max-h-[72px] space-y-1.5 overflow-y-auto pr-1">
                          {departmentChartData.map((entry) => (
                            <div
                              key={entry.name}
                              className="flex items-center justify-between text-xs text-slate-600"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="truncate font-medium text-slate-700">
                                  {entry.name}
                                </span>
                              </div>
                              <span className="ml-2 shrink-0 tabular-nums text-slate-500">
                                {entry.count.toLocaleString()} ({entry.percentage}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="h-[300px] w-full flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-muted/10">
                        <span className="text-sm text-muted-foreground">No department distribution data available</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading employee data...</span>
            </div>
          ) : (
            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm transition-colors hover:border-emerald-200">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#0B4628]" />
                    Employee Roster by MDA ({scopedEmployeesList.length})
                  </CardTitle>
                  <CardDescription>
                    Filter by MDA or Department above, then print or export the employee list.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={handlePrintEmployeesByMda}
                  className="bg-[#0B4628] hover:bg-[#08351E] text-white"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print Employees ({scopedEmployeesList.length})
                </Button>
              </CardHeader>
              <CardContent>
                {scopedEmployeesList.length === 0 ? (
                  <div className="py-12 text-center text-sm text-slate-500">
                    No employees found for the selected MDA / Department filters.
                  </div>
                ) : (
                  <div className="rounded-lg border overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead>ID / IPPIS</TableHead>
                          <TableHead>Employee</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Join Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scopedEmployeesList.slice(0, 50).map((emp: any) => (
                          <TableRow key={emp.id}>
                            <TableCell className="font-mono text-xs">
                              {emp.registration_id || emp.ippis_number || emp.id}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-slate-900">{emp.name}</div>
                              <div className="text-xs text-slate-500">{emp.email}</div>
                            </TableCell>
                            <TableCell>{emp.department || "General"}</TableCell>
                            <TableCell>{emp.position || "Civil Officer"}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {emp.status || "active"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-slate-600">
                              {emp.join_date ? format(new Date(emp.join_date), "dd MMM yyyy") : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
}

export default ReportsContent
