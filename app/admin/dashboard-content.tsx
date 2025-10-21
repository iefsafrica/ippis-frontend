'use client'

import { useState, useEffect } from "react"
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Users,
  UserCheck,
  Clock,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardChart } from "./components/dashboard-chart"
import { FallbackChart } from "./components/fallback-chart"

export default function DashboardContent() {
  const [loading, setLoading] = useState(true)
  const [employeeLoading, setEmployeeLoading] = useState(false)
  const [chartData, setChartData] = useState(null)
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingEmployees: 0,
    documentsVerified: 0,
    pendingDocuments: 0,
    rejectedDocuments: 0,
  })
  const [recentEmployees, setRecentEmployees] = useState<any[]>([])
  const [pendingEmployees, setPendingEmployees] = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [employeeTab, setEmployeeTab] = useState<"recent" | "pending">("recent")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    fetchEmployees(employeeTab)
  }, [employeeTab])

 const fetchDashboardData = async () => {
  try {
    setLoading(true)
    setError(null)

    // Fetch chart, stats, and pending doc count all in parallel
    const [chartRes, statsRes, pendingDocsRes] = await Promise.all([
      fetch("/api/admin/dashboard/chart"),
      fetch("/api/admin/dashboard/stats"),
      fetch("/api/admin/documents/pending/count"),
    ])

    const chartJson = await chartRes.json()
    const statsJson = await statsRes.json()
    const pendingDocsJson = await pendingDocsRes.json()

    // Chart data
    if (chartJson.success) {
      setChartData(chartJson.data)
    } else {
      setChartData(null)
    }

    // Employee + doc stats (excluding pendingDocs, we'll override it below)
    if (statsJson.success) {
      const d = statsJson.data
      setStats(prev => ({
        ...prev,
        totalEmployees: d.totalEmployees || 0,
        activeEmployees: d.activeEmployees || 0,
        pendingEmployees: d.pendingEmployees || 0,
        documentsVerified: d.verifiedDocuments || 0,
        rejectedDocuments: d.rejectedDocuments || 0,
      }))
    } else {
      resetStats()
    }

    // Override pendingDocuments with count from /documents/pending/count
    if (pendingDocsJson.success) {
      setStats(prev => ({
        ...prev,
        pendingDocuments: pendingDocsJson.count || 0,
      }))
    }

  } catch (error) {
    setError("Failed to load dashboard data.")
    resetStats()
    setChartData(null)
  } finally {
    setLoading(false)
    setRefreshing(false)
  }
}


  const resetStats = () => {
    setStats({
      totalEmployees: 0,
      activeEmployees: 0,
      pendingEmployees: 0,
      documentsVerified: 0,
      pendingDocuments: 0,
      rejectedDocuments: 0,
    })
  }

  const fetchEmployees = async (type: "recent" | "pending") => {
    setEmployeeLoading(true)
    setError(null)
    try {
      const endpoint =
        type === "pending"
          ? "/api/admin/employees?status=pending"
          : "/api/admin/dashboard/recent?type=recent"

      const res = await fetch(endpoint)
      const json = await res.json()

      if (json.success) {
        const employees = json.data?.employees || json.data?.pendingEmployees || []

        if (type === "recent") {
          setRecentEmployees(employees)
        } else {
          setPendingEmployees(employees)
        }
      } else {
        setError(json.message || "Failed to load employees.")
        if (type === "recent") setRecentEmployees([])
        else setPendingEmployees([])
      }
    } catch (error) {
      setError("Failed to load employees.")
      if (type === "recent") setRecentEmployees([])
      else setPendingEmployees([])
    } finally {
      setEmployeeLoading(false)
    }
  }

  const renderStatCard = (
    Icon: React.ElementType,
    label: string,
    value: number,
    color = "text-primary"
  ) => (
    <Card key={label}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-6 w-16" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setRefreshing(true)
            fetchDashboardData()
            fetchEmployees(employeeTab)
          }}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <TabsContent value="overview" className="space-y-4">
        {error && <div className="text-red-500">{error}</div>}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {renderStatCard(Users, "Total Employees", stats.totalEmployees)}
          {renderStatCard(UserCheck, "Active Employees", stats.activeEmployees)}
          {renderStatCard(Clock, "Pending Employees", stats.pendingEmployees)}
          {renderStatCard(CheckCircle2, "Documents Verified", stats.documentsVerified)}
          {renderStatCard(AlertTriangle, "Pending Documents", stats.pendingDocuments)}
          {renderStatCard(XCircle, "Rejected Documents", stats.rejectedDocuments)}
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Employee Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && !chartData ? <FallbackChart /> : <DashboardChart data={chartData} />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {/* Inner Tabs to toggle employee list */}
                <Tabs
                  defaultValue={employeeTab}
                  onValueChange={(value) => {
                    if (value === "recent" || value === "pending") {
                      setEmployeeTab(value)
                    }
                  }}
                >
                  <TabsList>
                    <TabsTrigger value="recent">Recent Employees</TabsTrigger>
                    <TabsTrigger value="pending">Pending Employees</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecentEmployeesTable
                data={employeeTab === "recent" ? recentEmployees : pendingEmployees}
                loading={employeeLoading}
              />
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="activity" className="space-y-4">
        {/* Future Activity Feed */}
      </TabsContent>
    </Tabs>
  )
}

type RecentEmployeesTableProps = {
  data?: any[]
  loading?: boolean
}

export function RecentEmployeesTable({
  data = [],
  loading = false,
}: RecentEmployeesTableProps) {
  if (loading) {
    return <div>Loading employees...</div>
  }

  if (!data.length) {
    return <div>No employees found.</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name </th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Department</th>
            <th className="border px-4 py-2">Position</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Join Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map((emp, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{emp.id}</td>
              <td className="border px-4 py-2">{emp.name}</td>
              <td className="border px-4 py-2">{emp.email}</td>
              <td className="border px-4 py-2">{emp.department}</td>
              <td className="border px-4 py-2">{emp.position}</td>
              <td className="border px-4 py-2 capitalize">{emp.status}</td>
              <td className="border px-4 py-2">
                {emp.join_date
                  ? new Date(emp.join_date).toLocaleDateString()
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
