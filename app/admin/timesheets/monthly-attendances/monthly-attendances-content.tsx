"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Search, FileText, Printer } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function MonthlyAttendancesContent() {
  const [month, setMonth] = useState("5")
  const [year, setYear] = useState("2023")
  const [department, setDepartment] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)

  // Mock data for demonstration
  const monthlyData = [
    {
      id: "1",
      name: "John Doe",
      department: "IT",
      present: 18,
      absent: 0,
      leave: 2,
      late: 3,
      earlyDeparture: 1,
      totalHours: "168.5",
    },
    {
      id: "2",
      name: "Jane Smith",
      department: "HR",
      present: 20,
      absent: 1,
      leave: 0,
      late: 2,
      earlyDeparture: 0,
      totalHours: "175.0",
    },
    {
      id: "3",
      name: "Robert Johnson",
      department: "Finance",
      present: 21,
      absent: 0,
      leave: 0,
      late: 1,
      earlyDeparture: 2,
      totalHours: "182.5",
    },
    {
      id: "4",
      name: "Emily Davis",
      department: "Marketing",
      present: 15,
      absent: 2,
      leave: 4,
      late: 0,
      earlyDeparture: 0,
      totalHours: "131.25",
    },
    {
      id: "5",
      name: "Michael Wilson",
      department: "Operations",
      present: 19,
      absent: 0,
      leave: 2,
      late: 1,
      earlyDeparture: 3,
      totalHours: "166.0",
    },
  ]

  // Mock data for employee details
  const employeeDetailData = [
    { date: "2023-05-01", status: "Present", clockIn: "08:30 AM", clockOut: "05:15 PM", hours: "8.75" },
    { date: "2023-05-02", status: "Present", clockIn: "08:45 AM", clockOut: "05:30 PM", hours: "8.75" },
    { date: "2023-05-03", status: "Leave", clockIn: "--", clockOut: "--", hours: "0.00" },
    { date: "2023-05-04", status: "Present", clockIn: "08:15 AM", clockOut: "05:00 PM", hours: "8.75" },
    { date: "2023-05-05", status: "Late", clockIn: "09:30 AM", clockOut: "06:15 PM", hours: "8.75" },
    { date: "2023-05-08", status: "Present", clockIn: "08:30 AM", clockOut: "05:15 PM", hours: "8.75" },
    { date: "2023-05-09", status: "Present", clockIn: "08:30 AM", clockOut: "05:15 PM", hours: "8.75" },
    { date: "2023-05-10", status: "Present", clockIn: "08:30 AM", clockOut: "05:15 PM", hours: "8.75" },
    { date: "2023-05-11", status: "Late", clockIn: "09:15 AM", clockOut: "06:00 PM", hours: "8.75" },
    { date: "2023-05-12", status: "Present", clockIn: "08:30 AM", clockOut: "05:15 PM", hours: "8.75" },
  ]

  const handleSearch = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleExport = () => {
    console.log("Exporting report...")
    // Implement export logic
  }

  const handlePrint = () => {
    window.print()
  }

  const handleViewDetails = (employee: any) => {
    setSelectedEmployee(employee)
    setDetailsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Monthly Attendances</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <FileText className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Attendance Report</CardTitle>
          <CardDescription>View attendance summary for a specific month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Month</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Year</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="2021">2021</option>
                <option value="2022">2022</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Department</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="all">All Departments</option>
                <option value="it">IT</option>
                <option value="hr">HR</option>
                <option value="finance">Finance</option>
                <option value="marketing">Marketing</option>
                <option value="operations">Operations</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Searching...
                  </span>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Absent</TableHead>
                  <TableHead>Leave</TableHead>
                  <TableHead>Late</TableHead>
                  <TableHead>Early Departure</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`loading-${index}`}>
                      {Array.from({ length: 9 }).map((_, cellIndex) => (
                        <TableCell key={`loading-cell-${index}-${cellIndex}`}>
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : monthlyData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  monthlyData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.department}</TableCell>
                      <TableCell>{item.present}</TableCell>
                      <TableCell>{item.absent}</TableCell>
                      <TableCell>{item.leave}</TableCell>
                      <TableCell>{item.late}</TableCell>
                      <TableCell>{item.earlyDeparture}</TableCell>
                      <TableCell>{item.totalHours}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(item)}>
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Employee Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{selectedEmployee?.name} - Attendance Details (May 2023)</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium">Department</p>
              <p>{selectedEmployee?.department}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Total Hours</p>
              <p>{selectedEmployee?.totalHours}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Present Days</p>
              <p>{selectedEmployee?.present}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Absent Days</p>
              <p>{selectedEmployee?.absent}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Leave Days</p>
              <p>{selectedEmployee?.leave}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Late Days</p>
              <p>{selectedEmployee?.late}</p>
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeDetailData.map((detail, index) => (
                  <TableRow key={index}>
                    <TableCell>{detail.date}</TableCell>
                    <TableCell>{detail.status}</TableCell>
                    <TableCell>{detail.clockIn}</TableCell>
                    <TableCell>{detail.clockOut}</TableCell>
                    <TableCell>{detail.hours}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
