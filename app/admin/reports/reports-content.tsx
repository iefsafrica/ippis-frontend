"use client"

import { useState, useEffect } from "react"
import {
  CalendarIcon,
  Download,
  Filter,
  BarChart,
  PieChart as LucidePieChart,
  LineChart,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, subMonths } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import {
  ReportsService,
  type OverviewStats,
  type DepartmentStats,
  type EmployeeGrowthData,
  type PayrollStats,
} from "../services/real-reports-service"
import { getEmployeesList } from "@/services/endpoints/employees/employees"
import { getPendingEmployees, getDocuments } from "@/services/endpoints/employees/pendingEmployees"

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
export function ReportsContent() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 12))
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<string>("overview")

  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null)
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[] | null>(null)
  const [employeeGrowthData, setEmployeeGrowthData] = useState<EmployeeGrowthData | null>(null)
  const [payrollStats, setPayrollStats] = useState<PayrollStats | null>(null)

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
              return departmentMatches(employee.department, selectedDepartment)
            })

            const pendingInScope = allPendingEmployees.filter((employee) => {
              return departmentMatches(employee.department, selectedDepartment)
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
              return departmentMatches(employee.department, selectedDepartment)
            })

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

          case "payroll":
            const payroll = await ReportsService.getPayrollStats(filters)
            setPayrollStats(payroll)
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
  }, [activeTab, startDate, endDate, selectedDepartment])

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
        case "payroll":
          reportType = "payroll"
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
            <p className="text-gray-600 mt-1">Insights and trends across employees and payroll.</p>
          </div>
        </div>
        <Button onClick={handleExportData} disabled={loading}>
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <Select
          value={selectedDepartment}
          onValueChange={setSelectedDepartment}
        >
          <SelectTrigger className="w-[180px]">
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
              className="w-[240px] justify-start text-left font-normal"
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
          }}
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
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
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
                    {employeeGrowthData ? (
                      <div className="h-[300px] w-full flex items-center justify-center rounded-lg border border-gray-200 bg-muted/20 transition-colors hover:border-emerald-200">
                        <LineChart className="h-16 w-16 text-muted" />
                        <span className="ml-2 text-muted">
                          Employee Growth Chart
                        </span>
                      </div>
                    ) : (
                      <div className="h-[300px] w-full flex items-center justify-center">
                        <span className="text-muted">No data available</span>
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
                    {departmentStats && departmentStats.length > 0 ? (
                      <div className="h-[300px] w-full flex items-center justify-center rounded-lg border border-gray-200 bg-muted/20 transition-colors hover:border-emerald-200">
                        <LucidePieChart className="h-16 w-16 text-muted" />
                        <span className="ml-2 text-muted">
                          Department Distribution Chart
                        </span>
                      </div>
                    ) : (
                      <div className="h-[300px] w-full flex items-center justify-center">
                        <span className="text-muted">No data available</span>
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
              <CardHeader>
                <CardTitle>Employee Demographics</CardTitle>
                <CardDescription>
                  Age, gender, and location distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full flex items-center justify-center rounded-lg border border-gray-200 bg-muted/20 transition-colors hover:border-emerald-200">
                  <BarChart className="h-16 w-16 text-muted" />
                  <span className="ml-2 text-muted">
                    Employee Demographics Chart
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading payroll data...</span>
            </div>
          ) : (
            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm transition-colors hover:border-emerald-200">
              <CardHeader>
                <CardTitle>Payroll Analysis</CardTitle>
                <CardDescription>
                  Salary distribution and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full flex items-center justify-center rounded-lg border border-gray-200 bg-muted/20 transition-colors hover:border-emerald-200">
                  <BarChart className="h-16 w-16 text-muted" />
                  <span className="ml-2 text-muted">
                    Payroll Analysis Chart
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ReportsContent
