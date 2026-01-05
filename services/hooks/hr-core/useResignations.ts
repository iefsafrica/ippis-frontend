import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getResignations, 
  getResignation, 
  getResignationsByEmployee,
  createResignation, 
  updateResignation, 
  approveResignation,
  disapproveResignation,
  deleteResignation 
} from "@/services/endpoints/hr-core/resignations";
import { 
  GET_RESIGNATIONS,
  GET_RESIGNATION,
  GET_RESIGNATIONS_BY_EMPLOYEE,
  CREATE_RESIGNATION,
  UPDATE_RESIGNATION,
  APPROVE_RESIGNATION,
  DISAPPROVE_RESIGNATION,
  DELETE_RESIGNATION
} from "@/services/constants/resignations";
import { 
  CreateResignationRequest,
  CreateResignationResponse,
  UpdateResignationRequest,
  UpdateResignationResponse,
  ApproveResignationRequest,
  ApproveResignationResponse,
  DisapproveResignationRequest,
  DisapproveResignationResponse,
  DeleteResignationResponse,
  Resignation
} from "@/types/hr-core/resignations";

export const useGetResignations = () => {
  return useQuery({
    queryKey: [GET_RESIGNATIONS],
    queryFn: getResignations,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useGetResignation = (id: number) => {
  return useQuery({
    queryKey: [GET_RESIGNATION, id],
    queryFn: () => getResignation(id),
    enabled: !!id,
  });
};

export const useGetResignationsByEmployee = (employee_id: string) => {
  return useQuery({
    queryKey: [GET_RESIGNATIONS_BY_EMPLOYEE, employee_id],
    queryFn: () => getResignationsByEmployee(employee_id),
    enabled: !!employee_id,
  });
};

export const useCreateResignation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<CreateResignationResponse, Error, CreateResignationRequest>({
    mutationKey: [CREATE_RESIGNATION],
    mutationFn: createResignation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_RESIGNATIONS] });
    },
  });
};

export const useUpdateResignation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<UpdateResignationResponse, Error, { id: number; data: UpdateResignationRequest }>({
    mutationKey: [UPDATE_RESIGNATION],
    mutationFn: ({ id, data }) => updateResignation(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_RESIGNATIONS] });
      queryClient.invalidateQueries({ queryKey: [GET_RESIGNATION, variables.id] });
    },
  });
};

export const useApproveResignation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ApproveResignationResponse, Error, ApproveResignationRequest>({
    mutationKey: [APPROVE_RESIGNATION],
    mutationFn: approveResignation,
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_RESIGNATIONS] });
      queryClient.invalidateQueries({ queryKey: [GET_RESIGNATION, variables.id] });
    },
  });
};

export const useDisapproveResignation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<DisapproveResignationResponse, Error, DisapproveResignationRequest>({
    mutationKey: [DISAPPROVE_RESIGNATION],
    mutationFn: disapproveResignation,
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_RESIGNATIONS] });
      queryClient.invalidateQueries({ queryKey: [GET_RESIGNATION, variables.id] });
    },
  });
};

export const useDeleteResignation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<DeleteResignationResponse, Error, number>({
    mutationKey: [DELETE_RESIGNATION],
    mutationFn: deleteResignation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_RESIGNATIONS] });
    },
  });
};