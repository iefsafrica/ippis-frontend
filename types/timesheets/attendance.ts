export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave'

export interface AttendanceRecord {
  id: number
  employee_name: string
  department: string
  attendance_date: string
  clock_in: string | null
  clock_out: string | null
  status: AttendanceStatus
  notes: string | null
  created_at: string
  employee_code: string | null
}

export interface AttendanceListResponse {
  success: boolean
  data: AttendanceRecord[]
}

export interface AttendanceSingleResponse {
  success: boolean
  data: AttendanceRecord
}

export type AttendancesData = AttendanceRecord[]

export interface AttendanceFilterParams {
  id?: number
  employee_code?: string
  department?: string
  attendance_date?: string
}

export interface MarkAttendancePayload {
  employee_code: string
  attendance_date: string
  clock_in: string
  clock_out: string
  status: AttendanceStatus
  notes?: string
}

export interface MarkAttendanceResponse extends AttendanceSingleResponse {
  message?: string
}

export interface UpdateAttendancePayload {
  id: number
  clock_in?: string
  clock_out?: string
  status?: AttendanceStatus
  notes?: string
}

export interface UpdateAttendanceResponse extends AttendanceSingleResponse {
  message?: string
}

export interface DeleteAttendanceResponse {
  success: boolean
  message: string
  data: AttendanceRecord
}

export interface ImportAttendancePayload {
  file: File
}

export interface ImportAttendanceResponse {
  success: boolean
  message: string
  data: Record<string, unknown>
}
