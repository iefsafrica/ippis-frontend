import { get, post, put, del } from "@/services/axios"
import {
  LeavesData,
  LeavesListResponse,
  LeaveSingleResponse,
  CreateLeavePayload,
  CreateLeaveResponse,
  UpdateLeavePayload,
  UpdateLeaveResponse,
  DeleteLeaveResponse,
} from "@/types/timesheets/leaves"

export const getLeaves = async (): Promise<LeavesData> => {
  const response = await get<LeavesListResponse>("/timesheets/attendance/leaves")
  return response.data
}

export const getLeaveById = async (id: number): Promise<LeaveSingleResponse["data"]> => {
  const response = await get<LeaveSingleResponse>("/timesheets/attendance/leaves", { id })
  return response.data
}

export const createLeave = async (payload: CreateLeavePayload): Promise<CreateLeaveResponse> => {
  return post<CreateLeaveResponse>("/timesheets/attendance/leaves", payload)
}

export const updateLeave = async (payload: UpdateLeavePayload): Promise<UpdateLeaveResponse> => {
  return put<UpdateLeaveResponse>("/timesheets/attendance/leaves", payload)
}

export const deleteLeave = async (id: number): Promise<DeleteLeaveResponse> => {
  return del<DeleteLeaveResponse>("/timesheets/attendance/leaves", { id })
}
