import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Clock, UserCheck, Calendar } from "lucide-react"

export default function TimesheetsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Timesheets Management</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendance</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">-4 since yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shifts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+1 new shift added</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Holidays</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Next: Independence Day</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leaves">Leaves</TabsTrigger>
          <TabsTrigger value="shifts">Shifts</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timesheet Management Overview</CardTitle>
              <CardDescription>Manage employee attendance, leaves, and work shifts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Welcome to the Timesheet Management dashboard. From here you can:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Track and manage daily attendance records</li>
                <li>View date-wise and monthly attendance reports</li>
                <li>Update attendance records and import attendance data</li>
                <li>Configure office shifts and manage holidays</li>
                <li>Process employee leave requests</li>
              </ul>
              <p>
                Select a tab above to get started, or use the sidebar menu to navigate to specific timesheet management
                functions.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
              <CardDescription>Track employee attendance and time records</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>This section provides tools for managing employee attendance:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <a href="/admin/timesheets/attendances" className="text-blue-600 hover:underline">
                    Attendances
                  </a>{" "}
                  - View and manage daily attendance records
                </li>
                <li>
                  <a href="/admin/timesheets/date-wise-attendances" className="text-blue-600 hover:underline">
                    Date-wise Attendances
                  </a>{" "}
                  - View attendance by specific dates
                </li>
                <li>
                  <a href="/admin/timesheets/monthly-attendances" className="text-blue-600 hover:underline">
                    Monthly Attendances
                  </a>{" "}
                  - View monthly attendance reports
                </li>
                <li>
                  <a href="/admin/timesheets/update-attendances" className="text-blue-600 hover:underline">
                    Update Attendances
                  </a>{" "}
                  - Make corrections to attendance records
                </li>
                <li>
                  <a href="/admin/timesheets/import-attendances" className="text-blue-600 hover:underline">
                    Import Attendances
                  </a>{" "}
                  - Import attendance data from external sources
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="leaves" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leave Management</CardTitle>
              <CardDescription>Process and track employee leave requests</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Use the leave management system to process employee leave requests and track leave balances.
              </p>
              <p>
                <a href="/admin/timesheets/manage-leaves" className="text-blue-600 hover:underline">
                  Manage Leaves
                </a>{" "}
                - View, approve, or reject leave requests
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="shifts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shift & Holiday Management</CardTitle>
              <CardDescription>Configure work shifts and manage holidays</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Configure work shifts and manage official holidays:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <a href="/admin/timesheets/office-shift" className="text-blue-600 hover:underline">
                    Office Shift
                  </a>{" "}
                  - Configure and manage work shifts
                </li>
                <li>
                  <a href="/admin/timesheets/manage-holiday" className="text-blue-600 hover:underline">
                    Manage Holiday
                  </a>{" "}
                  - Set up and manage official holidays
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
