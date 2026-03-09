import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAttendanceByEmployeeCode,
  getAttendanceById,
  getAttendances,
  importAttendance,
  markAttendance,
  updateAttendance,
  deleteAttendance,
} from '@/services/endpoints/timesheets/attendance'
import { QUERY_KEYS } from '@/services/constants/timesheets/attendance'
import {
  AttendancesData,
  AttendanceFilterParams,
  AttendanceRecord,
  ImportAttendancePayload,
  ImportAttendanceResponse,
  MarkAttendancePayload,
  MarkAttendanceResponse,
  UpdateAttendancePayload,
  UpdateAttendanceResponse,
  DeleteAttendanceResponse,
} from '@/types/timesheets/attendance'

export const useAttendances = (params?: AttendanceFilterParams) => {
  const queryKey = [
    QUERY_KEYS.ATTENDANCES_LIST,
    params?.attendance_date ?? null,
    params?.department ?? null,
    params?.employee_code ?? null,
    params?.id ?? null,
  ]

  return useQuery<AttendancesData, Error>({
    queryKey,
    queryFn: () => getAttendances(params),
    keepPreviousData: true,
  })
}

export const useAttendanceById = (id?: number) => {
  return useQuery<AttendanceRecord, Error>({
    queryKey: [QUERY_KEYS.ATTENDANCE_DETAILS, id],
    queryFn: async () => {
      if (!id) {
        throw new Error("Missing attendance id")
      }
      return getAttendanceById(id)
    },
    enabled: Boolean(id),
  })
}

export const useAttendanceByEmployeeCode = (employee_code?: string) => {
  return useQuery<AttendancesData, Error>({
    queryKey: [QUERY_KEYS.ATTENDANCE_BY_EMPLOYEE, employee_code],
    queryFn: () => getAttendanceByEmployeeCode(employee_code!),
    enabled: Boolean(employee_code),
  })
}

export const useMarkAttendance = () => {
  const queryClient = useQueryClient()

  return useMutation<MarkAttendanceResponse, Error, MarkAttendancePayload>({
    mutationFn: markAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ATTENDANCES_LIST] })
    },
  })
}

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient()

  return useMutation<UpdateAttendanceResponse, Error, UpdateAttendancePayload>({
    mutationFn: updateAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ATTENDANCES_LIST] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ATTENDANCE_DETAILS] })
    },
  })
}

export const useDeleteAttendance = () => {
  const queryClient = useQueryClient()

  return useMutation<DeleteAttendanceResponse, Error, number>({
    mutationFn: deleteAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ATTENDANCES_LIST] })
    },
  })
}

export const useImportAttendance = () => {
  const queryClient = useQueryClient()

  return useMutation<ImportAttendanceResponse, Error, ImportAttendancePayload>({
    mutationFn: importAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ATTENDANCES_LIST] })
    },
  })
}
