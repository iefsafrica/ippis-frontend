import { get, post, put, del } from '@/services/axios'
import {
  AttendancesData,
  AttendanceFilterParams,
  AttendanceListResponse,
  AttendanceRecord,
  AttendanceSingleResponse,
  MarkAttendancePayload,
  MarkAttendanceResponse,
  UpdateAttendancePayload,
  UpdateAttendanceResponse,
  DeleteAttendanceResponse,
  ImportAttendancePayload,
  ImportAttendanceResponse,
} from '@/types/timesheets/attendance'

export const getAttendances = async (params?: AttendanceFilterParams): Promise<AttendancesData> => {
  const response = await get<AttendanceListResponse>('/timesheets/attendance', params)
  return response.data
}

export const getAttendanceById = async (id: number): Promise<AttendanceRecord> => {
  const response = await get<AttendanceSingleResponse>('/timesheets/attendance', { id })
  return response.data
}

export const getAttendanceByEmployeeCode = async (employee_code: string): Promise<AttendancesData> => {
  const response = await get<AttendanceListResponse>('/timesheets/attendance', { employee_code })
  return response.data
}

export const markAttendance = async (payload: MarkAttendancePayload): Promise<MarkAttendanceResponse> => {
  return post<MarkAttendanceResponse>('/timesheets/attendance', payload)
}

export const updateAttendance = async (payload: UpdateAttendancePayload): Promise<UpdateAttendanceResponse> => {
  return put<UpdateAttendanceResponse>('/timesheets/attendance', payload)
}

export const deleteAttendance = async (id: number): Promise<DeleteAttendanceResponse> => {
  return del<DeleteAttendanceResponse>('/timesheets/attendance', { id })
}

export const importAttendance = async (payload: ImportAttendancePayload): Promise<ImportAttendanceResponse> => {
  const formData = new FormData()
  formData.append('CSV', payload.file)

  return post<ImportAttendanceResponse>('/timesheets/attendance/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
