export interface LeaveRecord {
  id: number
  employee_code: string
  employee_name: string
  department: string
  leave_type: string
  from_date: string
  to_date: string
  reason: string
  status: string
  days?: number
  created_at: string
  updated_at: string
}

export interface LeavesListResponse {
  success: boolean
  data: LeaveRecord[]
}

export interface LeaveSingleResponse {
  success: boolean
  data: LeaveRecord
}

export type LeavesData = LeaveRecord[]

export interface CreateLeavePayload {
  employee_code: string
  leave_type: string
  from_date: string
  to_date: string
  reason: string
  department?: string
  status?: string
}

export interface CreateLeaveResponse extends LeaveSingleResponse {
  message?: string
}

export interface UpdateLeavePayload {
  id: number
  leave_type?: string
  from_date?: string
  to_date?: string
  reason?: string
  status?: string
  department?: string
}

export interface UpdateLeaveResponse extends LeaveSingleResponse {
  message?: string
}

export interface DeleteLeaveResponse {
  success: boolean
  message: string
  data: LeaveRecord
}
