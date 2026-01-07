import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getTerminations,
  getTermination,
  getTerminationsByEmployee,
  createTermination,
  updateTermination,
  deleteTermination
} from "@/services/endpoints/hr-core/terminations";
import {
  CREATE_TERMINATION,
  GET_TERMINATIONS,
  GET_TERMINATION,
  GET_TERMINATIONS_BY_EMPLOYEE,
  UPDATE_TERMINATION,
  DELETE_TERMINATION
} from "@/services/constants/terminations";
import {
  CreateTerminationRequest,
  CreateTerminationResponse,
  UpdateTerminationRequest,
  UpdateTerminationResponse,
  DeleteTerminationResponse
} from "@/types/hr-core/terminations";

export const useGetTerminations = () => {
  return useQuery({
    queryKey: [GET_TERMINATIONS],
    queryFn: getTerminations,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useGetTermination = (id: number) => {
  return useQuery({
    queryKey: [GET_TERMINATION, id],
    queryFn: () => getTermination(id),
    enabled: !!id,
  });
};

export const useGetTerminationsByEmployee = (employeeId: string) => {
  return useQuery({
    queryKey: [GET_TERMINATIONS_BY_EMPLOYEE, employeeId],
    queryFn: () => getTerminationsByEmployee(employeeId),
    enabled: !!employeeId,
  });
};

export const useCreateTermination = () => {
  const queryClient = useQueryClient();
  
  return useMutation<CreateTerminationResponse, Error, CreateTerminationRequest>({
    mutationKey: [CREATE_TERMINATION],
    mutationFn: createTermination,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_TERMINATIONS] });
      queryClient.invalidateQueries({ queryKey: [GET_TERMINATIONS_BY_EMPLOYEE] });
    },
  });
};

export const useUpdateTermination = () => {
  const queryClient = useQueryClient();
  
  return useMutation<UpdateTerminationResponse, Error, { id: number; data: UpdateTerminationRequest }>({
    mutationKey: [UPDATE_TERMINATION],
    mutationFn: ({ id, data }) => updateTermination(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_TERMINATIONS] });
      queryClient.invalidateQueries({ queryKey: [GET_TERMINATION, variables.id] });
      queryClient.invalidateQueries({ queryKey: [GET_TERMINATIONS_BY_EMPLOYEE] });
    },
  });
};

export const useDeleteTermination = () => {
  const queryClient = useQueryClient();
  
  return useMutation<DeleteTerminationResponse, Error, number>({
    mutationKey: [DELETE_TERMINATION],
    mutationFn: deleteTermination,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_TERMINATIONS] });
      queryClient.invalidateQueries({ queryKey: [GET_TERMINATIONS_BY_EMPLOYEE] });
    },
  });
};