import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getLeaves,
  getLeaveById,
  createLeave,
  updateLeave,
  deleteLeave,
} from "@/services/endpoints/timesheets/leaves"
import { QUERY_KEYS } from "@/services/constants/timesheets/leaves"
import {
  LeavesData,
  LeaveRecord,
  CreateLeavePayload,
  CreateLeaveResponse,
  UpdateLeavePayload,
  UpdateLeaveResponse,
  DeleteLeaveResponse,
} from "@/types/timesheets/leaves"

export const useLeaves = () => {
  return useQuery<LeavesData, Error>({
    queryKey: [QUERY_KEYS.LEAVES_LIST],
    queryFn: getLeaves,
    keepPreviousData: true,
  })
}

export const useLeaveById = (id?: number) => {
  return useQuery<LeaveRecord, Error>({
    queryKey: [QUERY_KEYS.LEAVE_DETAILS, id],
    queryFn: async () => {
      if (!id) {
        throw new Error("Leave id is required")
      }
      return getLeaveById(id)
    },
    enabled: Boolean(id),
  })
}

export const useCreateLeave = () => {
  const queryClient = useQueryClient()

  return useMutation<CreateLeaveResponse, Error, CreateLeavePayload>({
    mutationFn: createLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEAVES_LIST] })
    },
  })
}

export const useUpdateLeave = () => {
  const queryClient = useQueryClient()

  return useMutation<UpdateLeaveResponse, Error, UpdateLeavePayload>({
    mutationFn: updateLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEAVES_LIST] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEAVE_DETAILS] })
    },
  })
}

export const useDeleteLeave = () => {
  const queryClient = useQueryClient()

  return useMutation<DeleteLeaveResponse, Error, number>({
    mutationFn: deleteLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEAVES_LIST] })
    },
  })
}
