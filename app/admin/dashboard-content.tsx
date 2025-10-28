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
import { useRecentActivities } from "@/services/hooks/overview/recent"
import { RecentActivity } from "@/types/overview/recent"

export default function DashboardContent() {
  const [chartData, setChartData] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [employeeTab, setEmployeeTab] = useState<"recent" | "pending">("recent")
  const [activityTab, setActivityTab] = useState<"recent" | "pending">("recent")

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useDashboardStats()

  const {
    data: activitiesData,
    isLoading: activitiesLoading,
    error: activitiesError,
    refetch: refetchActivities
  } = useRecentActivities(activityTab)

  const {
    data: recentEmployeesData,
    isLoading: recentEmployeesLoading,
    error: recentEmployeesError,
    refetch: refetchRecentEmployees
  } = useRecentActivities("recent")

  const {
    data: pendingEmployeesData,
    isLoading: pendingEmployeesLoading,
    error: pendingEmployeesError,
    refetch: refetchPendingEmployees
  } = useRecentActivities("pending")

  // Generate dummy chart data (keeping this since we don't have a chart API yet)
  const generateDummyChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      months: months.slice(0, 6), // Last 6 months
      counts: Array.from({ length: 6 }, () => Math.floor(Math.random() * 50) + 10)
    };
  };

  // Transform RecentActivity to employee data structure
  const transformActivityToEmployee = (activity: RecentActivity, index: number) => {
    // Extract department and position from activity type or name if possible
    // For now, we'll create some derived data from the activity
    const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
    const positions = ['Software Engineer', 'Marketing Manager', 'Sales Representative', 'HR Specialist', 'Financial Analyst', 'Operations Manager'];
    
    // Use activity data where available, fallback to generated data
    const department = departments[Math.floor(Math.random() * departments.length)];
    const position = positions[Math.floor(Math.random() * positions.length)];
    
    return {
      id: activity.id || `EMP${1000 + index}`,
      name: activity.name,
      email: activity.name.toLowerCase().replace(/\s+/g, '') + '@company.com',
      department: department,
      position: position,
      status: employeeTab === "recent" ? 'active' : 'pending',
      join_date: employeeTab === "recent" 
        ? new Date(activity.created_at).toISOString().split('T')[0]
        : null
    };
  };

  useEffect(() => {
    // Set dummy chart data (keep this for now since we don't have chart API)
    setChartData(generateDummyChartData() as any);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true)
    
    // Refetch all data
    Promise.all([
      refetchStats(),
      refetchActivities(),
      refetchRecentEmployees(),
      refetchPendingEmployees(),
      new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    ]).then(() => {
      // Regenerate chart data on refresh (keep this for now)
      setChartData(generateDummyChartData() as any);
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

  // Extract activities from the React Query data
  const activities = activitiesData?.data || []
  
  // Transform recent activities data to employee format
  const recentEmployees = recentEmployeesData?.data?.map((activity, index) => 
    transformActivityToEmployee(activity, index)
  ) || []
  
  // Transform pending activities data to employee format  
  const pendingEmployees = pendingEmployeesData?.data?.map((activity, index) => 
    transformActivityToEmployee(activity, index)
  ) || []

  // Determine loading state for employees table
  const employeesLoading = refreshing || 
    (employeeTab === "recent" ? recentEmployeesLoading : pendingEmployeesLoading)

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
          disabled={statsLoading || refreshing || activitiesLoading}
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

        {/* Error Display for Employees */}
        {(recentEmployeesError || pendingEmployeesError) && (
          <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
            Failed to load employee data: {recentEmployeesError?.message || pendingEmployeesError?.message}
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
                loading={employeesLoading}
              />
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="activity" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>
              <Tabs
                defaultValue={activityTab}
                onValueChange={(value) => {
                  if (value === "recent" || value === "pending") {
                    setActivityTab(value)
                  }
                }}
              >
                <TabsList>
                  <TabsTrigger value="recent">Recent Activities</TabsTrigger>
                  <TabsTrigger value="pending">Pending Activities</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Error Display for Activities */}
            {activitiesError && (
              <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-4">
                Failed to load activities: {activitiesError.message}
              </div>
            )}

            {activitiesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <Skeleton className="w-2 h-2 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No activities found.
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity: RecentActivity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">
                        {activity.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground capitalize">
                          {activity.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
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