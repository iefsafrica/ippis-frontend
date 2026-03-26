"use client"

import { Calendar, Users, Clock, AlertTriangle } from "lucide-react"
import { ReportLayout } from "../components/report-layout"
import { DateFilter } from "../components/date-filter"
import { useHrAttendances } from "@/services/hooks/hr-reports/attendance"
import type { AttendanceRecord, AttendanceStatus } from "@/types/timesheets/attendance"
import { useMemo } from "react"
import type { ReactNode } from "react"

const statusCardDefinition: {
  status: AttendanceStatus
  label: string
  bgClass: string
  textClass: string
  icon: ReactNode
}[] = [
  {
    status: "present",
    label: "Present",
    bgClass: "bg-green-50",
    textClass: "text-green-700",
    icon: <Users className="h-5 w-5 text-green-600" />,
  },
  {
    status: "absent",
    label: "Absent",
    bgClass: "bg-red-50",
    textClass: "text-red-700",
    icon: <Users className="h-5 w-5 text-red-600" />,
  },
  {
    status: "late",
    label: "Late",
    bgClass: "bg-yellow-50",
    textClass: "text-yellow-700",
    icon: <Clock className="h-5 w-5 text-yellow-600" />,
  },
  {
    status: "leave",
    label: "On Leave",
    bgClass: "bg-blue-50",
    textClass: "text-blue-700",
    icon: <Calendar className="h-5 w-5 text-blue-600" />,
  },
]

const statusBadgeClasses: Record<AttendanceStatus, string> = {
  present: "bg-green-100 text-green-800",
  absent: "bg-red-100 text-red-800",
  late: "bg-amber-100 text-amber-800",
  leave: "bg-blue-100 text-blue-800",
}

const parseTimeToMinutes = (value?: string) => {
  if (!value) return null
  const [hours, minutes, seconds] = value.split(":").map((segment) => parseInt(segment, 10))
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
  return hours * 60 + minutes + (Number.isNaN(seconds) ? 0 : seconds / 60)
}

const formatDuration = (minutes: number) => {
  if (minutes <= 0) return "-"
  const wholeHours = Math.floor(minutes / 60)
  const remainingMinutes = Math.round(minutes - wholeHours * 60)
  return `${wholeHours}h ${remainingMinutes}m`
}

const getWorkingHours = (clockIn?: string | null, clockOut?: string | null) => {
  const start = parseTimeToMinutes(clockIn ?? undefined)
  const end = parseTimeToMinutes(clockOut ?? undefined)
  if (start === null || end === null || end <= start) {
    return "-"
  }
  return formatDuration(end - start)
}

const formatDate = (value?: string) => {
  if (!value) return "-"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "-"
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export default function AttendanceReportPage() {
  const { data, isLoading, isError } = useHrAttendances()
  const attendanceRecords = useMemo<AttendanceRecord[]>(() => {
    const records = data ?? []
    return [...records].sort((a, b) => b.id - a.id)
  }, [data])

  const totals = useMemo(() => {
    const base: Record<AttendanceStatus, number> = {
      present: 0,
      absent: 0,
      late: 0,
      leave: 0,
    }

    attendanceRecords.forEach((record) => {
      const status = record.status || "present"
      if (status in base) {
        base[status] += 1
      }
    })

    return base
  }, [attendanceRecords])

  const isEmpty = !attendanceRecords.length && !isLoading

  return (
    <ReportLayout title="Attendance Report" description="Track check-ins, check-outs, and daily statuses">
      <DateFilter />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusCardDefinition.map((card) => (
            <div key={card.status} className={`p-4 rounded-lg border ${card.bgClass} border-gray-200`}>
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-white/60 mr-3">{card.icon}</div>
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className={`text-2xl font-semibold ${card.textClass}`}>
                    {isLoading ? "..." : totals[card.status].toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Based on latest pull</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <div>
              <h3 className="text-lg font-semibold">Attendance Trends</h3>
              <p className="text-sm text-muted-foreground">Showing live totals from the attendance endpoint.</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 text-sm font-medium text-blue-600 rounded-md border border-blue-200 hover:bg-blue-50">
                Export
              </button>
              <button
                className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-md border border-gray-200 hover:bg-gray-200"
                onClick={() => window.location.reload()}
              >
                Refresh
              </button>
            </div>
          </div>
          <div className="h-[220px] bg-gray-50 rounded-md border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500">
            <AlertTriangle className="h-10 w-10 mb-3" />
            <p className="text-sm">Trend chart placeholder (real chart coming soon)</p>
          </div>
        </div>

        <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Attendance Details</h3>
              <p className="text-sm text-muted-foreground">
                Latest {attendanceRecords.length ?? 0} entries from the API.
              </p>
            </div>
            {isError && !isLoading && (
              <div className="text-sm text-red-600">Unable to load attendance right now.</div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Working Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-sm text-muted-foreground">
                      Loading attendance records...
                    </td>
                  </tr>
                )}
                {isEmpty && (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-sm text-muted-foreground">
                      No attendance data available right now.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  attendanceRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{record.employee_name}</div>
                        <div className="text-xs text-gray-500">{record.employee_code ?? "—"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            statusBadgeClasses[record.status] ?? "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.clock_in ?? "—"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.clock_out ?? "—"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getWorkingHours(record.clock_in, record.clock_out)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(record.attendance_date)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {(!isLoading && !isEmpty) && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
              <span>Showing {attendanceRecords.length} of {attendanceRecords.length} entries</span>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm">Previous</button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ReportLayout>
  )
}
