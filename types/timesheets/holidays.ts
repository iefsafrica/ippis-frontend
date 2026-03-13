export type HolidayStatus = "active" | "inactive" | string

export interface HolidayRecord {
  id: number
  holiday_name: string
  start_date: string
  end_date: string
  description?: string | null
  status: HolidayStatus
  created_at: string
  updated_at: string
  days?: number
}

export interface HolidayListResponse {
  success: true
  data: HolidayRecord[]
  message?: string
}

export interface HolidaySingleResponse {
  success: true
  data: HolidayRecord
  message?: string
}

export interface CreateHolidayPayload {
  holiday_name: string
  start_date: string
  end_date: string
  description?: string
  status: HolidayStatus
}

export interface UpdateHolidayPayload {
  id: number
  holiday_name?: string
  start_date?: string
  end_date?: string
  description?: string
  status?: HolidayStatus
}

export interface DeleteHolidayPayload {
  id: number
}
