import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createShift,
  deleteShift,
  getShiftById,
  getShifts,
  updateShift,
} from "@/services/endpoints/timesheets/shifts"
import {
  CreateShiftPayload,
  DeleteShiftPayload,
  ShiftRecord,
  UpdateShiftPayload,
} from "@/types/timesheets/shifts"
import { QUERY_KEYS } from "@/services/constants/timesheets/shifts"

export const useShifts = () => {
  return useQuery<ShiftRecord[], Error>({
    queryKey: [QUERY_KEYS.SHIFTS_LIST],
    queryFn: getShifts,
    keepPreviousData: true,
  })
}

export const useShiftById = (id?: number) => {
  return useQuery<ShiftRecord, Error>({
    queryKey: [QUERY_KEYS.SHIFT_DETAILS, id],
    queryFn: async () => {
      if (!id) {
        throw new Error("Missing shift id")
      }
      return getShiftById(id)
    },
    enabled: Boolean(id),
  })
}

export const useCreateShift = () => {
  const queryClient = useQueryClient()
  return useMutation<ShiftRecord, Error, CreateShiftPayload>({
    mutationFn: createShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SHIFTS_LIST] })
    },
  })
}

export const useUpdateShift = () => {
  const queryClient = useQueryClient()
  return useMutation<ShiftRecord, Error, UpdateShiftPayload>({
    mutationFn: updateShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SHIFTS_LIST] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SHIFT_DETAILS] })
    },
  })
}

export const useDeleteShift = () => {
  const queryClient = useQueryClient()
  return useMutation<ShiftRecord, Error, DeleteShiftPayload>({
    mutationFn: deleteShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SHIFTS_LIST] })
    },
  })
}
