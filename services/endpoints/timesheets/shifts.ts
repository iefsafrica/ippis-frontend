import { get, post, put, del } from "@/services/axios"
import {
  CreateShiftPayload,
  DeleteShiftPayload,
  ShiftListResponse,
  ShiftRecord,
  ShiftSingleResponse,
  UpdateShiftPayload,
} from "@/types/timesheets/shifts"

export const getShifts = async (): Promise<ShiftRecord[]> => {
  const response = await get<ShiftListResponse>("/timesheets/attendance/shifts")
  return response.data
}

export const getShiftById = async (id: number): Promise<ShiftRecord> => {
  const response = await get<ShiftSingleResponse>("/timesheets/attendance/shifts", { id })
  return response.data
}

export const createShift = async (payload: CreateShiftPayload): Promise<ShiftRecord> => {
  const response = await post<ShiftSingleResponse>("/timesheets/attendance/shifts", payload)
  return response.data
}

export const updateShift = async (payload: UpdateShiftPayload): Promise<ShiftRecord> => {
  const response = await put<ShiftSingleResponse>("/timesheets/attendance/shifts", payload)
  return response.data
}

export const deleteShift = async (payload: DeleteShiftPayload): Promise<ShiftRecord> => {
  const response = await del<ShiftSingleResponse>("/timesheets/attendance/shifts", { id: payload.id })
  return response.data
}
