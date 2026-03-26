"use client"

import { useMemo, useState } from "react"
import { format, subDays } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Search } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useAttendances } from "@/services/hooks/timesheets/attendance"
import { AttendanceFilterParams } from "@/types/timesheets/attendance"
import {
  CustomSelect,
  CustomSelectContent,
  CustomSelectGroup,
  CustomSelectItem,
  CustomSelectTrigger,
  CustomSelectValue,
} from "@/components/ui/custom-select"

const getStatusStyles = (status: string | undefined) => {
  switch (status) {
    case "present":
      return "bg-green-100 text-green-800"
    case "absent":
      return "bg-red-100 text-red-800"
    case "late":
      return "bg-yellow-100 text-yellow-800"
    case "leave":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function DateWiseAttendancesContent() {
  const [startDate, setStartDate] = useState(() => subDays(new Date(), 6))
  const [endDate, setEndDate] = useState(() => new Date())
  const [department, setDepartment] = useState("ALL")
  const [filters, setFilters] = useState<AttendanceFilterParams | undefined>()
  const [rangeLabel, setRangeLabel] = useState("Last 7 days")
  const attendancesQuery = useAttendances(filters)
  const isLoading = attendancesQuery.isFetching
  const attendanceData = attendancesQuery.data ?? []

  const handleSearch = () => {
    if (!startDate || !endDate) {
      toast.error("Incomplete dates", {
        description: "Both start and end dates must be provided.",
      })
      return
    }

    const start = startDate
    const end = endDate
    if (start > end) {
      toast.error("Invalid range", {
        description: "Start date cannot come after the end date.",
      })
      return
    }

      setFilters({
        start_date: format(start, "yyyy-MM-dd"),
        end_date: format(end, "yyyy-MM-dd"),
        department: department === "ALL" ? undefined : department,
      })
    setRangeLabel(`${format(start, "PPP")} – ${format(end, "PPP")}`)
  }

  const handleExport = () => {
    toast.success("Export queued", {
      description: "Preparing the attendance report.",
    })
  }

  const tableSkeleton = useMemo(
    () =>
      Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={`loading-${index}`}>
          {Array.from({ length: 8 }).map((_, cellIndex) => (
            <TableCell key={`loading-cell-${index}-${cellIndex}`}>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            </TableCell>
          ))}
        </TableRow>
      )),
    [],
  )

  const tableContents = useMemo(
    () =>
      attendanceData.map((item) => (
        <TableRow key={item.id}>
          <TableCell>{item.employee_code ?? "—"}</TableCell>
          <TableCell>{item.employee_name}</TableCell>
          <TableCell>{item.department || "N/A"}</TableCell>
          <TableCell>{format(new Date(item.attendance_date), "PPP")}</TableCell>
          <TableCell>
            <Badge className={`${getStatusStyles(item.status)} capitalize`}>{item.status}</Badge>
          </TableCell>
          <TableCell>{item.clock_in || "--"}</TableCell>
          <TableCell>{item.clock_out || "--"}</TableCell>
          <TableCell>--</TableCell>
        </TableRow>
      )),
    [attendanceData],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Date-wise Attendances</h1>
        <Button variant="outline" size="sm" onClick={handleExport} className="border-gray-200 text-gray-700 hover:bg-[#effaf0]">
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
              <DatePicker
                value={startDate}
                onValueChange={(value) => value && setStartDate(value)}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">End Date</label>
              <DatePicker
                value={endDate}
                onValueChange={(value) => value && setEndDate(value)}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Department</label>
              <CustomSelect value={department} onValueChange={setDepartment}>
                <CustomSelectTrigger className="w-full">
                  <CustomSelectValue placeholder="Select department" />
                </CustomSelectTrigger>
                <CustomSelectContent>
                  <CustomSelectGroup>
                    <CustomSelectItem value="ALL">All Departments</CustomSelectItem>
                    <CustomSelectItem value="IT">IT</CustomSelectItem>
                    <CustomSelectItem value="HR">HR</CustomSelectItem>
                    <CustomSelectItem value="Finance">Finance</CustomSelectItem>
                    <CustomSelectItem value="Marketing">Marketing</CustomSelectItem>
                    <CustomSelectItem value="Operations">Operations</CustomSelectItem>
                  </CustomSelectGroup>
                </CustomSelectContent>
              </CustomSelect>
            </div>
            <div className="flex items-end gap-3">
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="h-10 px-5 bg-gradient-to-r from-[#159E3B] to-[#0F7A2B] text-white font-medium rounded-lg shadow-sm hover:from-[#0F7A2B] hover:to-[#0C6321]"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
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
              <span className="text-sm font-semibold text-gray-500">{rangeLabel}</span>
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
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && !attendanceData.length ? (
                  tableSkeleton
                ) : !attendanceData.length ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  tableContents
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
