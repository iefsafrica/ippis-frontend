import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getLeaves, 
  getLeave, 
  createLeave, 
  updateLeave, 
  deleteLeave 
} from "@/services/endpoints/calendar/leaves";
import { 
  CREATE_LEAVE, 
  GET_LEAVES, 
  GET_LEAVE, 
  UPDATE_LEAVE, 
  DELETE_LEAVE 
} from "@/services/constants/calendar/leaves";
import { 
  CreateLeaveRequest, 
  CreateLeaveResponse,
  UpdateLeaveRequest,
  UpdateLeaveResponse,
  DeleteLeaveResponse,
  LeaveQueryParams
} from "@/types/calendar/leaves";

export const useGetLeaves = (params?: LeaveQueryParams) => {
  return useQuery({
    queryKey: [GET_LEAVES, params],
    queryFn: () => getLeaves(params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

export const useGetLeave = (params: LeaveQueryParams) => {
  return useQuery({
    queryKey: [GET_LEAVE, params],
    queryFn: () => getLeave(params),
    enabled: !!(params.id || params.employee_id),
  });
};

export const useCreateLeave = () => {
  const queryClient = useQueryClient();
  
  return useMutation<CreateLeaveResponse, Error, CreateLeaveRequest>({
    mutationKey: [CREATE_LEAVE],
    mutationFn: createLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_LEAVES] });
    },
  });
};

export const useUpdateLeave = () => {
  const queryClient = useQueryClient();
  
  return useMutation<UpdateLeaveResponse, Error, UpdateLeaveRequest>({
    mutationKey: [UPDATE_LEAVE],
    mutationFn: updateLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_LEAVES] });
    },
  });
};

export const useDeleteLeave = () => {
  const queryClient = useQueryClient();
  
  return useMutation<DeleteLeaveResponse, Error, number>({
    mutationKey: [DELETE_LEAVE],
    mutationFn: deleteLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_LEAVES] });
    },
  });
};
