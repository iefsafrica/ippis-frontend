export type ShiftStatus = "active" | "inactive" | string

export interface ShiftRecord {
  id: number
  shift_name: string
  start_time: string
  end_time: string
  late_mark_time?: string | null
  department: string
  status: ShiftStatus
  created_at: string
  updated_at: string
}

export interface ShiftListResponse {
  success: true
  data: ShiftRecord[]
  message?: string
}

export interface ShiftSingleResponse {
  success: true
  data: ShiftRecord
  message?: string
}

export interface CreateShiftPayload {
  shift_name: string
  start_time: string
  end_time: string
  late_mark_time?: string
  department: string
  status: ShiftStatus
}

export interface UpdateShiftPayload {
  id: number
  shift_name?: string
  start_time?: string
  end_time?: string
  late_mark_time?: string
  department?: string
  status?: ShiftStatus
}

export interface DeleteShiftPayload {
  id: number
}
