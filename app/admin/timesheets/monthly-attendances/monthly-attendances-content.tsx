"use client"

import { useMemo, useState, useEffect } from "react"
import { format, parse, differenceInMinutes, isValid, endOfMonth, startOfMonth } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Search, FileText, Printer, ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useAttendances } from "@/services/hooks/timesheets/attendance"
import { AttendanceFilterParams, AttendanceRecord } from "@/types/timesheets/attendance"
import {
  CustomSelect,
  CustomSelectContent,
  CustomSelectGroup,
  CustomSelectItem,
  CustomSelectTrigger,
  CustomSelectValue,
} from "@/components/ui/custom-select"

const parseClockDate = (date: string, time?: string) => {
  if (!date || !time) return null
  const cleanTime = time.trim()
  const formats = ["yyyy-MM-dd hh:mm a", "yyyy-MM-dd HH:mm", "yyyy-MM-dd HH:mm:ss"]
  for (const fmt of formats) {
    const parsed = parse(`${date} ${cleanTime}`, fmt, new Date())
    if (isValid(parsed)) return parsed
  }
  return null
}

const formatMinutesToHours = (minutes: number) => {
  if (!minutes) return "--"
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hrs}h ${mins.toString().padStart(2, "0")}m`
}

const getMonthRange = (month: number, year: number) => {
  const start = startOfMonth(new Date(year, month - 1, 1))
  const end = endOfMonth(start)
  return {
    start: format(start, "yyyy-MM-dd"),
    end: format(end, "yyyy-MM-dd"),
    label: format(start, "MMMM yyyy"),
  }
}

type AggregatedEmployee = {
  key: string
  employeeCode?: string | null
  employeeName?: string | null
  department?: string | null
  present: number
  absent: number
  leave: number
  late: number
  earlyDeparture: number
  totalMinutes: number
}

export function MonthlyAttendancesContent() {
  const [month, setMonth] = useState("5")
  const [year, setYear] = useState("2023")
  const initialRange = useMemo(() => getMonthRange(Number(month), Number(year)), [month, year])
  const [filters, setFilters] = useState<AttendanceFilterParams | undefined>(undefined)
  const [rangeLabel, setRangeLabel] = useState("All records")
  const [department, setDepartment] = useState("ALL")
  const [isLoading, setIsLoading] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<AggregatedEmployee | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const attendancesQuery = useAttendances(filters)
  const attendanceRecords = attendancesQuery.data ?? []

  useEffect(() => {
    if (attendancesQuery.isFetching) {
      setIsLoading(true)
    } else {
      const timer = setTimeout(() => setIsLoading(false), 100)
      return () => clearTimeout(timer)
    }
  }, [attendancesQuery.isFetching])

  const aggregatedData = useMemo<AggregatedEmployee[]>(() => {
    const map = new Map<string, AggregatedEmployee>()

    attendanceRecords.forEach((record) => {
      if (department !== "ALL" && record.department?.toUpperCase() !== department.toUpperCase()) {
        return
      }

      const key = record.employee_code ?? record.employee_name ?? record.id.toString()
      const existing = map.get(key) ?? {
        key,
        employeeCode: record.employee_code ?? null,
        employeeName: record.employee_name ?? null,
        department: record.department ?? null,
        present: 0,
        absent: 0,
        leave: 0,
        late: 0,
        earlyDeparture: 0,
        totalMinutes: 0,
      }

      switch (record.status) {
        case "present":
          existing.present += 1
          break
        case "absent":
          existing.absent += 1
          break
        case "leave":
          existing.leave += 1
          break
        case "late":
          existing.late += 1
          break
        default:
          break
      }

      const clockInDate = parseClockDate(record.attendance_date, record.clock_in ?? undefined)
      const clockOutDate = parseClockDate(record.attendance_date, record.clock_out ?? undefined)
      if (clockInDate && clockOutDate && isValid(clockOutDate) && isValid(clockInDate)) {
        const minutes = differenceInMinutes(clockOutDate, clockInDate)
        if (minutes > 0) {
          existing.totalMinutes += minutes
        }
      }

      map.set(key, existing)
    })

    return Array.from(map.values())
  }, [attendanceRecords, department])

  const itemsPerPage = 5
  const totalItems = aggregatedData.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems)
  const pagedData = aggregatedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [aggregatedData.length])

  const handleSearch = () => {
    const { start, end, label } = getMonthRange(Number(month), Number(year))
    setFilters({
      start_date: start,
      end_date: end,
      department: department === "ALL" ? undefined : department,
    })
    setRangeLabel(label)
    setCurrentPage(1)
  }

  const handleExport = () => {
    toast.success("Export queued", {
      description: "Preparing the monthly attendance report.",
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleViewDetails = (employee: AggregatedEmployee) => {
    setSelectedEmployee(employee)
    setDetailsDialogOpen(true)
  }

  const selectedEmployeeDetails = useMemo(() => {
    if (!selectedEmployee) return []
    return attendanceRecords.filter(
      (record) =>
        (record.employee_code && record.employee_code === selectedEmployee.employeeCode) ||
        (record.employee_name === selectedEmployee.employeeName),
    )
  }, [attendanceRecords, selectedEmployee])

  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(1, prev - 1))
  const handleNextPage = () => setCurrentPage((prev) => Math.min(totalPages, prev + 1))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Monthly Attendances</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="transition-colors duration-150 hover:bg-[#effaf0]"
          >
            <FileText className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="transition-colors duration-150 hover:bg-[#effaf0]"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Attendance Report</CardTitle>
          <CardDescription>{rangeLabel}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Month</label>
              <CustomSelect value={month} onValueChange={setMonth}>
                <CustomSelectTrigger className="w-full">
                  <CustomSelectValue placeholder="Select month" />
                </CustomSelectTrigger>
                <CustomSelectContent>
                  <CustomSelectGroup>
                    {Array.from({ length: 12 }, (_, idx) => {
                      const value = (idx + 1).toString()
                      const label = format(new Date(2023, idx, 1), "MMMM")
                      return (
                        <CustomSelectItem key={value} value={value}>
                          {label}
                        </CustomSelectItem>
                      )
                    })}
                  </CustomSelectGroup>
                </CustomSelectContent>
              </CustomSelect>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Year</label>
              <Input
                type="number"
                min={2021}
                max={2030}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="transition-colors duration-150 hover:bg-[#f3fdf4]"
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
                ) : totalItems === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedData.map((item) => (
                    <TableRow key={item.key}>
                      <TableCell>{item.employeeName ?? item.employeeCode ?? "—"}</TableCell>
                      <TableCell>{item.department || "N/A"}</TableCell>
                      <TableCell>{item.present}</TableCell>
                      <TableCell>{item.absent}</TableCell>
                      <TableCell>{item.leave}</TableCell>
                      <TableCell>{item.late}</TableCell>
                      <TableCell>{item.earlyDeparture}</TableCell>
                      <TableCell>{formatMinutesToHours(item.totalMinutes)}</TableCell>
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
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-2">
            <div className="text-sm text-gray-600">
              Showing {totalItems === 0 ? 0 : startIndex}-{endIndex} of {totalItems} employees
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="h-8 w-8 px-0 border"
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{selectedEmployee?.employeeName || selectedEmployee?.employeeCode} - Attendance Details</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium">Department</p>
              <p>{selectedEmployee?.department || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Total Hours</p>
              <p>{formatMinutesToHours(selectedEmployee?.totalMinutes ?? 0)}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Present Days</p>
              <p>{selectedEmployee?.present ?? 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Absent Days</p>
              <p>{selectedEmployee?.absent ?? 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Leave Days</p>
              <p>{selectedEmployee?.leave ?? 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Late Days</p>
              <p>{selectedEmployee?.late ?? 0}</p>
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
                {selectedEmployeeDetails.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                      No detailed records found
                    </TableCell>
                  </TableRow>
                ) : (
                  selectedEmployeeDetails.map((detail) => {
                    const clockIn = detail.clock_in || "--"
                    const clockOut = detail.clock_out || "--"
                    let minutes = 0
                    const clockInDate = parseClockDate(detail.attendance_date, detail.clock_in ?? undefined)
                    const clockOutDate = parseClockDate(detail.attendance_date, detail.clock_out ?? undefined)
                    if (clockInDate && clockOutDate) {
                      const diff = differenceInMinutes(clockOutDate, clockInDate)
                      if (diff > 0) minutes = diff
                    }
                    return (
                      <TableRow key={`${detail.id}-${detail.attendance_date}`}>
                        <TableCell>{detail.attendance_date}</TableCell>
                        <TableCell>{detail.status}</TableCell>
                        <TableCell>{clockIn}</TableCell>
                        <TableCell>{clockOut}</TableCell>
                        <TableCell>{formatMinutesToHours(minutes)}</TableCell>
                      </TableRow>
                    )
                  })
                )}
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
