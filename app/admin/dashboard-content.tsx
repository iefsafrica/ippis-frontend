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
import { useDashboardStats } from "@/services/hooks/overview/useOverview"

export default function DashboardContent() {
  const [chartData, setChartData] = useState(null)
  const [recentEmployees, setRecentEmployees] = useState<any[]>([])
  const [pendingEmployees, setPendingEmployees] = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [employeeTab, setEmployeeTab] = useState<"recent" | "pending">("recent")

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useDashboardStats()

  // Generate dummy chart data
  const generateDummyChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      months: months.slice(0, 6), // Last 6 months
      counts: Array.from({ length: 6 }, () => Math.floor(Math.random() * 50) + 10)
    };
  };

  // Generate dummy employee data
  const generateDummyEmployees = (type: "recent" | "pending") => {
    const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
    const positions = ['Software Engineer', 'Marketing Manager', 'Sales Representative', 'HR Specialist', 'Financial Analyst', 'Operations Manager'];
    
    return Array.from({ length: 8 }, (_, i) => ({
      id: type === 'recent' ? `EMP${1000 + i}` : `PEND${2000 + i}`,
      name: type === 'recent' ? `Employee ${i + 1}` : `Pending Employee ${i + 1}`,
      email: type === 'recent' ? `employee${i + 1}@company.com` : `pending${i + 1}@company.com`,
      department: departments[Math.floor(Math.random() * departments.length)],
      position: positions[Math.floor(Math.random() * positions.length)],
      status: type === 'recent' ? 'active' : 'pending',
      join_date: type === 'recent' 
        ? new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : null
    }));
  };

  useEffect(() => {
    // Set dummy chart data
    setChartData(generateDummyChartData() as any);
    
    // Set dummy employee data
    setRecentEmployees(generateDummyEmployees("recent"));
    setPendingEmployees(generateDummyEmployees("pending"));
  }, []);

  const handleRefresh = () => {
    setRefreshing(true)
    
    // Refetch stats and regenerate dummy data
    Promise.all([
      refetchStats(),
      new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    ]).then(() => {
      // Regenerate dummy data on refresh
      setChartData(generateDummyChartData() as any);
      setRecentEmployees(generateDummyEmployees("recent"));
      setPendingEmployees(generateDummyEmployees("pending"));
    }).finally(() => {
      setRefreshing(false)
    })
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
        {statsLoading ? (
          <Skeleton className="h-6 w-16" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  )

  // Extract stats from the React Query data, fallback to zeros if not available
  const stats = statsData || {
    totalEmployees: 0,
    activeEmployees: 0,
    pendingEmployees: 0,
    pendingDocuments: 0,
    verifiedDocuments: 0,
    rejectedDocuments: 0,
  }

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
          onClick={handleRefresh}
          disabled={statsLoading || refreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <TabsContent value="overview" className="space-y-4">
        {/* Error Display for Stats Only */}
        {statsError && (
          <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
            Failed to load dashboard statistics: {statsError.message}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {renderStatCard(Users, "Total Employees", stats.totalEmployees)}
          {renderStatCard(UserCheck, "Active Employees", stats.activeEmployees)}
          {renderStatCard(Clock, "Pending Employees", stats.pendingEmployees)}
          {renderStatCard(CheckCircle2, "Documents Verified", stats.verifiedDocuments)}
          {renderStatCard(AlertTriangle, "Pending Documents", stats.pendingDocuments)}
          {renderStatCard(XCircle, "Rejected Documents", stats.rejectedDocuments)}
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Employee Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData ? <DashboardChart data={chartData} /> : <FallbackChart />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
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
                loading={refreshing}
              />
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="activity" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">
                      {['Employee created', 'Document uploaded', 'Profile updated', 'Status changed', 'Document verified'][i]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {`${['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'Tom Brown'][i]} - ${new Date(Date.now() - (i * 60 * 60 * 1000)).toLocaleTimeString()}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (!data.length) {
    return <div className="text-muted-foreground">No employees found.</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
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