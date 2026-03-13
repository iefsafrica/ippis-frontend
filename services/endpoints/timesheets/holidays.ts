import { get, post, put, del } from "@/services/axios"
import {
  CreateHolidayPayload,
  DeleteHolidayPayload,
  HolidayListResponse,
  HolidayRecord,
  HolidaySingleResponse,
  UpdateHolidayPayload,
} from "@/types/timesheets/holidays"

export const getHolidays = async (): Promise<HolidayRecord[]> => {
  const response = await get<HolidayListResponse>("/timesheets/attendance/holidays")
  return response.data
}

export const getHolidayById = async (id: number): Promise<HolidayRecord> => {
  const response = await get<HolidaySingleResponse>("/timesheets/attendance/holidays", { id })
  return response.data
}

export const createHoliday = async (payload: CreateHolidayPayload): Promise<HolidayRecord> => {
  const response = await post<HolidaySingleResponse>("/timesheets/attendance/holidays", payload)
  return response.data
}

export const updateHoliday = async (payload: UpdateHolidayPayload): Promise<HolidayRecord> => {
  const response = await put<HolidaySingleResponse>("/timesheets/attendance/holidays", payload)
  return response.data
}

export const deleteHoliday = async (payload: DeleteHolidayPayload): Promise<HolidayRecord> => {
  const response = await del<HolidaySingleResponse>("/timesheets/attendance/holidays", { id: payload.id })
  return response.data
}
