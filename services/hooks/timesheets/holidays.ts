import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createHoliday,
  deleteHoliday,
  getHolidayById,
  getHolidays,
  updateHoliday,
} from "@/services/endpoints/timesheets/holidays"
import {
  CreateHolidayPayload,
  DeleteHolidayPayload,
  HolidayRecord,
  UpdateHolidayPayload,
} from "@/types/timesheets/holidays"
import { QUERY_KEYS } from "@/services/constants/timesheets/holidays"

export const useHolidays = () => {
  return useQuery<HolidayRecord[], Error>({
    queryKey: [QUERY_KEYS.HOLIDAYS_LIST],
    queryFn: getHolidays,
    keepPreviousData: true,
  })
}

export const useHolidayById = (id?: number) => {
  return useQuery<HolidayRecord, Error>({
    queryKey: [QUERY_KEYS.HOLIDAY_DETAILS, id],
    queryFn: async () => {
      if (!id) {
        throw new Error("Missing holiday id")
      }
      return getHolidayById(id)
    },
    enabled: Boolean(id),
  })
}

export const useCreateHoliday = () => {
  const queryClient = useQueryClient()
  return useMutation<HolidayRecord, Error, CreateHolidayPayload>({
    mutationFn: createHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HOLIDAYS_LIST] })
    },
  })
}

export const useUpdateHoliday = () => {
  const queryClient = useQueryClient()
  return useMutation<HolidayRecord, Error, UpdateHolidayPayload>({
    mutationFn: updateHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HOLIDAYS_LIST] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HOLIDAY_DETAILS] })
    },
  })
}

export const useDeleteHoliday = () => {
  const queryClient = useQueryClient()
  return useMutation<HolidayRecord, Error, DeleteHolidayPayload>({
    mutationFn: deleteHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HOLIDAYS_LIST] })
    },
  })
}
