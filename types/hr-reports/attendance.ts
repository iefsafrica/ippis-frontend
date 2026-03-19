import type {
  AttendanceRecord,
  AttendancesData,
} from "@/types/timesheets/attendance"

export type HrReportAttendanceRecord = AttendanceRecord
export type HrReportAttendancesData = AttendancesData

export interface HrReportAttendanceResponse {
  success: boolean
  data: HrReportAttendanceRecord[]
}
