"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Download, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export function DateWiseAttendancesContent() {
  const [startDate, setStartDate] = useState("2023-05-01")
  const [endDate, setEndDate] = useState("2023-05-08")
  const [department, setDepartment] = useState("all")
  const [isLoading, setIsLoading] = useState(false)

  // Mock data for demonstration
  const attendanceData = [
    {
      id: "1",
      employeeId: "EMP001",
      name: "John Doe",
      department: "IT",
      date: "2023-05-01",
      status: "present",
      clockIn: "08:30 AM",
      clockOut: "05:15 PM",
      totalHours: "8.75",
    },
    {
      id: "2",
      employeeId: "EMP001",
      name: "John Doe",
      department: "IT",
      date: "2023-05-02",
      status: "present",
      clockIn: "08:45 AM",
      clockOut: "05:30 PM",
      totalHours: "8.75",
    },
    {
      id: "3",
      employeeId: "EMP001",
      name: "John Doe",
      department: "IT",
      date: "2023-05-03",
      status: "leave",
      clockIn: "",
      clockOut: "",
      totalHours: "0.00",
    },
    {
      id: "4",
      employeeId: "EMP001",
      name: "John Doe",
      department: "IT",
      date: "2023-05-04",
      status: "present",
      clockIn: "08:15 AM",
      clockOut: "05:00 PM",
      totalHours: "8.75",
    },
    {
      id: "5",
      employeeId: "EMP001",
      name: "John Doe",
      department: "IT",
      date: "2023-05-05",
      status: "late",
      clockIn: "09:30 AM",
      clockOut: "06:15 PM",
      totalHours: "8.75",
    },
    {
      id: "6",
      employeeId: "EMP002",
      name: "Jane Smith",
      department: "HR",
      date: "2023-05-01",
      status: "present",
      clockIn: "08:15 AM",
      clockOut: "05:00 PM",
      totalHours: "8.75",
    },
    {
      id: "7",
      employeeId: "EMP002",
      name: "Jane Smith",
      department: "HR",
      date: "2023-05-02",
      status: "present",
      clockIn: "08:30 AM",
      clockOut: "05:15 PM",
      totalHours: "8.75",
    },
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Date-wise Attendances</h1>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Date Range</CardTitle>
          <CardDescription>View attendance records for a specific date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <div className="relative">
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="pr-10" />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">End Date</label>
              <div className="relative">
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="pr-10" />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
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
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Total Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`loading-${index}`}>
                      {Array.from({ length: 8 }).map((_, cellIndex) => (
                        <TableCell key={`loading-cell-${index}-${cellIndex}`}>
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : attendanceData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  attendanceData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.employeeId}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.department}</TableCell>
                      <TableCell>{format(new Date(item.date), "PPP")}</TableCell>
                      <TableCell>
                        <Badge
                          className={`${
                            item.status === "present"
                              ? "bg-green-100 text-green-800"
                              : item.status === "absent"
                                ? "bg-red-100 text-red-800"
                                : item.status === "late"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                          } capitalize`}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.clockIn || "--"}</TableCell>
                      <TableCell>{item.clockOut || "--"}</TableCell>
                      <TableCell>{item.totalHours}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
