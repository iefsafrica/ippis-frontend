"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Save, Calendar, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { useAttendances, useUpdateAttendance } from "@/services/hooks/timesheets/attendance"
import { AttendanceFilterParams, AttendanceStatus, UpdateAttendancePayload } from "@/types/timesheets/attendance"
import {
  CustomSelect,
  CustomSelectContent,
  CustomSelectGroup,
  CustomSelectItem,
  CustomSelectTrigger,
  CustomSelectValue,
} from "@/components/ui/custom-select"
import { DatePicker } from "@/components/ui/date-picker"

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

const ATTENDANCE_STATUS_OPTIONS: AttendanceStatus[] = ["present", "absent", "leave", "late"]

const formatIsoDate = (value?: Date) => (value ? value.toISOString().split("T")[0] : undefined)

type PendingChangesMap = Record<number, Partial<EditableAttendanceRow>>

export function UpdateAttendancesContent() {
  const defaultDate = new Date()
  const [date, setDate] = useState<Date>(defaultDate)
  const [department, setDepartment] = useState("all")
  const [searchFilters, setSearchFilters] = useState<AttendanceFilterParams>({
    attendance_date: formatIsoDate(defaultDate),
  })
  const [attendanceData, setAttendanceData] = useState<EditableAttendanceRow[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [pendingChanges, setPendingChanges] = useState<PendingChangesMap>({})
  const originalRecordsRef = useRef<Record<number, EditableAttendanceRow>>({})
  const attendancesQuery = useAttendances(searchFilters)
  const updateAttendanceMutation = useUpdateAttendance()

  useEffect(() => {
    if (!attendancesQuery.data) {
      setAttendanceData([])
      originalRecordsRef.current = {}
      setPendingChanges({})
      return
    }

    const rows = attendancesQuery.data.map((attendance) => ({
      id: attendance.id,
      employeeId: attendance.employee_code ?? "",
      name: attendance.employee_name,
      department: attendance.department ?? "",
      status: attendance.status,
      clockIn: attendance.clock_in ?? "",
      clockOut: attendance.clock_out ?? "",
      notes: attendance.notes ?? "",
    }))

    setAttendanceData(rows)
    originalRecordsRef.current = rows.reduce<Record<number, EditableAttendanceRow>>((acc, row) => {
      acc[row.id] = row
      return acc
    }, {})
    setPendingChanges({})
  }, [attendancesQuery.data])

  const hasPendingChanges = Object.keys(pendingChanges).length > 0

  const updateRowField = <K extends keyof EditableAttendanceRow>(id: number, field: K, value: EditableAttendanceRow[K]) => {
    setAttendanceData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    )

    setPendingChanges((prev) => {
      const next = { ...prev }
      const existing = next[id] ? { ...next[id] } : {}
      const original = originalRecordsRef.current[id]
      const hasOriginal = Boolean(original)
      const valueMatchesOriginal = hasOriginal && original[field] === value

      if (valueMatchesOriginal) {
        delete existing[field]
        if (Object.keys(existing).length === 0) {
          delete next[id]
        } else {
          next[id] = existing
        }
        return next
      }

      next[id] = { ...existing, [field]: value }
      return next
    })
  }

  const handleSearch = () => {
    const filters: AttendanceFilterParams = {}
    const isoDate = formatIsoDate(date)
    if (isoDate) {
      filters.attendance_date = isoDate
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

    if (!hasPendingChanges) {
      toast({
        title: "No changes",
        description: "Update at least one field before saving.",
        variant: "destructive",
      })
      return
    }

    const pendingEntries = Object.entries(pendingChanges)

    setIsSaving(true)
    try {
      await Promise.all(
        pendingEntries.map(([id, changes]) => {
          const payload: UpdateAttendancePayload = {
            id: Number(id),
          }

          if (changes.clockIn !== undefined) {
            payload.clock_in = changes.clockIn
          }
          if (changes.clockOut !== undefined) {
            payload.clock_out = changes.clockOut
          }
          if (changes.status !== undefined) {
            payload.status = changes.status
          }
          if (changes.notes !== undefined) {
            payload.notes = changes.notes
          }

          return updateAttendanceMutation.mutateAsync(payload)
        }),
      )

      toast({
        title: "Changes saved",
        description: "Attendance records have been updated successfully.",
        variant: "success",
      })
      setPendingChanges({})
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
    updateRowField(id, "status", value)
    if (value === "absent") {
      updateRowField(id, "clockIn", "")
      updateRowField(id, "clockOut", "")
    }
  }

  const handleClockInChange = (id: number, value: string) => {
    updateRowField(id, "clockIn", value)
  }

  const handleClockOutChange = (id: number, value: string) => {
    updateRowField(id, "clockOut", value)
  }

  const handleNotesChange = (id: number, value: string) => {
    updateRowField(id, "notes", value)
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
              <DatePicker value={date} onValueChange={setDate} className="w-full" />
            </div>
            <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Department</label>
            <CustomSelect value={department} onValueChange={setDepartment}>
              <CustomSelectTrigger className="w-full">
                <CustomSelectValue placeholder="Department" />
              </CustomSelectTrigger>
              <CustomSelectContent>
                <CustomSelectGroup>
                  <CustomSelectItem value="all">All Departments</CustomSelectItem>
                  <CustomSelectItem value="it">IT</CustomSelectItem>
                  <CustomSelectItem value="hr">HR</CustomSelectItem>
                  <CustomSelectItem value="finance">Finance</CustomSelectItem>
                  <CustomSelectItem value="marketing">Marketing</CustomSelectItem>
                  <CustomSelectItem value="operations">Operations</CustomSelectItem>
                </CustomSelectGroup>
              </CustomSelectContent>
            </CustomSelect>
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
                        <CustomSelect value={item.status} onValueChange={(value) => handleStatusChange(item.id, value as AttendanceStatus)}>
                          <CustomSelectTrigger className="w-full" disabled={isSaving}>
                            <CustomSelectValue />
                          </CustomSelectTrigger>
                          <CustomSelectContent>
                            <CustomSelectGroup>
                              {ATTENDANCE_STATUS_OPTIONS.map((status) => (
                                <CustomSelectItem key={status} value={status}>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </CustomSelectItem>
                              ))}
                            </CustomSelectGroup>
                          </CustomSelectContent>
                        </CustomSelect>
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
