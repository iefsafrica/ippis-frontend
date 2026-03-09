"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Save, Calendar, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { useAttendances, useUpdateAttendance } from "@/services/hooks/timesheets/attendance"
import { AttendanceFilterParams, AttendanceStatus } from "@/types/timesheets/attendance"

type EditableAttendanceRow = {
  id: number
  employeeId: string
  name: string
  department: string
  status: AttendanceStatus
  clockIn: string
  clockOut: string
  notes: string
}

export function UpdateAttendancesContent() {
  const defaultDate = new Date().toISOString().split("T")[0]
  const [date, setDate] = useState(defaultDate)
  const [department, setDepartment] = useState("all")
  const [searchFilters, setSearchFilters] = useState<AttendanceFilterParams>({
    attendance_date: defaultDate,
  })
  const [attendanceData, setAttendanceData] = useState<EditableAttendanceRow[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const attendancesQuery = useAttendances(searchFilters)
  const updateAttendanceMutation = useUpdateAttendance()

  useEffect(() => {
    if (!attendancesQuery.data) {
      setAttendanceData([])
      return
    }

    setAttendanceData(
      attendancesQuery.data.map((attendance) => ({
        id: attendance.id,
        employeeId: attendance.employee_code ?? "",
        name: attendance.employee_name,
        department: attendance.department ?? "",
        status: attendance.status,
        clockIn: attendance.clock_in ?? "",
        clockOut: attendance.clock_out ?? "",
        notes: attendance.notes ?? "",
      })),
    )
  }, [attendancesQuery.data])

  const handleSearch = () => {
    const filters: AttendanceFilterParams = {}
    if (date) {
      filters.attendance_date = date
    }
    if (department && department !== "all") {
      filters.department = department
    }
    setSearchFilters(filters)
  }

  const handleSaveChanges = async () => {
    if (attendanceData.length === 0) {
      toast({
        title: "No records",
        description: "Load attendance records before saving.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      await Promise.all(
        attendanceData.map((item) =>
          updateAttendanceMutation.mutateAsync({
            id: item.id,
            clock_in: item.clockIn,
            clock_out: item.clockOut,
            status: item.status,
            notes: item.notes,
          }),
        ),
      )
      toast({
        title: "Changes saved",
        description: "Attendance records have been updated successfully.",
        variant: "success",
      })
      attendancesQuery.refetch()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save changes"
      toast({
        title: "Save failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = (id: number, value: AttendanceStatus) => {
    setAttendanceData((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item
        }
        const updatedItem = { ...item, status: value }
        if (value === "absent") {
          updatedItem.clockIn = ""
          updatedItem.clockOut = ""
        }
        return updatedItem
      }),
    )
  }

  const handleClockInChange = (id: number, value: string) => {
    setAttendanceData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, clockIn: value } : item)),
    )
  }

  const handleClockOutChange = (id: number, value: string) => {
    setAttendanceData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, clockOut: value } : item)),
    )
  }

  const handleNotesChange = (id: number, value: string) => {
    setAttendanceData((prev) => prev.map((item) => (item.id === id ? { ...item, notes: value } : item)))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Update Attendances</h1>
        <Button size="sm" onClick={handleSaveChanges} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Attendance Records</CardTitle>
          <CardDescription>Make corrections to employee attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Date</label>
              <div className="relative">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="pr-10" />
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
            <Button onClick={handleSearch} disabled={attendancesQuery.isFetching}>
              {attendancesQuery.isFetching ? (
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
                  <TableHead>Status</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendancesQuery.isFetching ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`loading-${index}`}>
                      {Array.from({ length: 7 }).map((_, cellIndex) => (
                        <TableCell key={`loading-cell-${index}-${cellIndex}`}>
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : attendanceData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  attendanceData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.employeeId}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.department}</TableCell>
                      <TableCell>
                        <select
                          className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background"
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          disabled={isSaving}
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="leave">Leave</option>
                          <option value="late">Late</option>
                        </select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="time"
                          value={item.clockIn}
                          onChange={(e) => handleClockInChange(item.id, e.target.value)}
                          className="w-full"
                          disabled={item.status === "absent" || item.status === "leave" || isSaving}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="time"
                          value={item.clockOut}
                          onChange={(e) => handleClockOutChange(item.id, e.target.value)}
                          className="w-full"
                          disabled={item.status === "absent" || item.status === "leave" || isSaving}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          placeholder="Add notes"
                          value={item.notes}
                          onChange={(e) => handleNotesChange(item.id, e.target.value)}
                          className="w-full"
                          disabled={isSaving}
                        />
                      </TableCell>
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
