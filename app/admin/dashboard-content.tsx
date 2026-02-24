'use client'
import { useState, useEffect } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardChart } from "./components/dashboard-chart"
import { FallbackChart } from "./components/fallback-chart"
import { useDashboardStats } from "@/services/hooks/overview/useOverview"
import { useRecentActivities } from "@/services/hooks/overview/recent"
import { useRecentEmployees } from "@/services/hooks/employees/useEmployees"
import { RecentActivity } from "@/types/overview/recent"
import { Employee } from "@/types/employees/employee-management"

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
  } = useRecentEmployees()

  const {
    data: pendingEmployeesData,
    isLoading: pendingEmployeesLoading,
    error: pendingEmployeesError,
    refetch: refetchPendingEmployees
  } = useRecentActivities("pending")

  // Generate dummy chart data
  const generateDummyChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      months: months.slice(0, 6),
      counts: Array.from({ length: 6 }, () => Math.floor(Math.random() * 50) + 10)
    };
  };

  const transformActivityToEmployee = (activity: RecentActivity, index: number) => {
    const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
    const positions = ['Software Engineer', 'Marketing Manager', 'Sales Representative', 'HR Specialist', 'Financial Analyst', 'Operations Manager'];
    
    const department = departments[Math.floor(Math.random() * departments.length)];
    const position = positions[Math.floor(Math.random() * positions.length)];
    
    return {
      id: activity.id || `EMP${1000 + index}`,
      name: activity.name,
      email: activity.name.toLowerCase().replace(/\s+/g, '') + '@company.com',
      department: department,
      position: position,
      status: 'pending' as const,
      join_date: null,
      created_at: activity.created_at,
      updated_at: activity.created_at,
      registration_id: `REG-${Math.floor(Math.random() * 10000)}`,
      createdAt: activity.created_at,
      updatedAt: activity.created_at
    };
  };

  useEffect(() => {
    setChartData(generateDummyChartData() as any);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true)
    
    Promise.all([
      refetchStats(),
      refetchActivities(),
      refetchRecentEmployees(),
      refetchPendingEmployees(),
      new Promise(resolve => setTimeout(resolve, 1000))
    ]).then(() => {
      setChartData(generateDummyChartData() as any);
    }).finally(() => {
      setRefreshing(false)
    })
  }

  const statCards = [
    {
      icon: Users,
      label: "Total Employees",
      value: statsData?.totalEmployees || 0,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "All registered employees"
    },
    {
      icon: UserCheck,
      label: "Active Employees",
      value: statsData?.activeEmployees || 0,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Currently working"
    },
    {
      icon: Clock,
      label: "Pending Employees",
      value: statsData?.pendingEmployees || 0,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      description: "Awaiting approval"
    },
    {
      icon: FileCheck,
      label: "Verified Documents",
      value: statsData?.verifiedDocuments || 0,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      description: "Approved documents"
    },
    {
      icon: FileText,
      label: "Pending Documents",
      value: statsData?.pendingDocuments || 0,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Under review"
    },
    {
      icon: FileX,
      label: "Rejected Documents",
      value: statsData?.rejectedDocuments || 0,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: "Requires attention"
    },
  ]

  const activities = activitiesData?.data || []
  const recentEmployees: Employee[] = recentEmployeesData?.employees || []
  const pendingEmployees = pendingEmployeesData?.data?.map((activity, index) => 
    transformActivityToEmployee(activity, index)
  ) || []

  const employeesLoading = refreshing || 
    (employeeTab === "recent" ? recentEmployeesLoading : pendingEmployeesLoading)

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="w-full space-y-4 px-2 sm:space-y-6 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 truncate">Dashboard Overview</h1>
            <p className="text-slate-600 mt-2">Welcome to your employee management dashboard</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={statsLoading || refreshing || activitiesLoading}
            className="border-slate-300 hover:bg-white w-full sm:w-auto"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid w-full grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat, index) => (
            <Card key={stat.label} className="relative w-full overflow-hidden border-slate-200 transition-all duration-200 hover:border-slate-300 hover:shadow-lg">
              <div className={`absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full ${stat.bgColor} opacity-50`}></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-semibold text-slate-700">
                  {stat.label}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20 mb-2" />
                ) : (
                  <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                )}
                <p className="text-xs text-slate-500">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts and Employees Section */}
        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Employee Trends Chart */}
          <Card className="w-full border-slate-200">
            <CardHeader className="flex flex-row items-center space-y-0 pb-4">
              <TrendingUp className="h-5 w-5 text-slate-700 mr-2" />
              <CardTitle className="text-lg font-semibold">Employee Trends</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {chartData ? <DashboardChart data={chartData} /> : <FallbackChart />}
            </CardContent>
          </Card>

          {/* Recent Employees */}
          <Card className="w-full border-slate-200">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 space-y-0 pb-4">
              <div className="flex items-center space-x-2 min-w-0">
                <UserPlus className="h-5 w-5 text-slate-700" />
                <CardTitle className="text-lg font-semibold truncate">Employee Management</CardTitle>
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
                <TabsList className="grid w-full sm:w-[180px] grid-cols-2">
                  <TabsTrigger value="recent" className="text-xs">Recent</TabsTrigger>
                  <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="w-full px-0 pb-4 sm:px-6">
              <RecentEmployeesTable
              //@ts-expect-error
                data={employeeTab === "recent" ? recentEmployees : pendingEmployees}
                loading={employeesLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card className="w-full border-slate-200">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 space-y-0 pb-4">
            <div className="flex items-center space-x-2 min-w-0">
              <Activity className="h-5 w-5 text-slate-700" />
              <CardTitle className="text-lg font-semibold truncate">Recent Activities</CardTitle>
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
              <TabsList className="grid w-full sm:w-[180px] grid-cols-2">
                <TabsTrigger value="recent" className="text-xs">Recent</TabsTrigger>
                <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
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
    switch (status) {
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set"
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDepartmentIcon = (department: string) => {
    switch (department.toLowerCase()) {
      case 'engineering':
        return <Briefcase className="h-3 w-3" />
      case 'it':
        return <Briefcase className="h-3 w-3" />
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

  const formatRegistrationId = (regId: string | null) => {
    if (!regId) return "Not assigned"
    return regId
  }

  return (
    <div className="w-full rounded-lg border border-slate-200">
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
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {employee.name}
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
                  <span>{employee.department}</span>
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-slate-700 max-w-[150px] truncate">
                {employee.position}
              </TableCell>
              <TableCell>
                <Badge 
                  variant={getStatusVariant(employee.status)} 
                  className="text-xs font-medium"
                >
                  {employee.status}
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
