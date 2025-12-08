import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import {
  getPromotedEmployeeDetails,
  getPromotedEmployees,
  getAllEmployees,
  createPromotion,
  deletePromotion,
} from "@/services/endpoints/hr-core/promotions";
import { QUERY_KEYS } from "@/services/constants/hr-core";
import {
  PromotedEmployee,
  Employee,
  CreatePromotionRequest,
} from "@/types/hr-core/promotion-management";

export const usePromotedEmployees = (
  options?: UseQueryOptions<PromotedEmployee[], Error>
) => {
  return useQuery<PromotedEmployee[], Error>({
    queryKey: [QUERY_KEYS.ALL_PROMOTED_EMPLOYEES],
    queryFn: getPromotedEmployees,
    ...options,
  });
};

export const useAllEmployees = (
  options?: UseQueryOptions<Employee[], Error>
) => {
  return useQuery<Employee[], Error>({
    queryKey: [QUERY_KEYS.ALL_EMPLOYEES],
    queryFn: getAllEmployees,
    ...options,
  });
};

export const usePromotedEmployeeDetails = (
  employeeId: string,
  options?: UseQueryOptions<PromotedEmployee, Error>
) => {
  return useQuery<PromotedEmployee, Error>({
    queryKey: [QUERY_KEYS.PROMOTED_EMPLOYEE_DETAILS, employeeId],
    queryFn: () => getPromotedEmployeeDetails(employeeId),
    enabled: !!employeeId,
    ...options,
  });
};

export const useCreatePromotion = (
  options?: UseMutationOptions<PromotedEmployee, Error, CreatePromotionRequest>
) => {
  return useMutation<PromotedEmployee, Error, CreatePromotionRequest>({
    mutationFn: createPromotion,
    ...options,
  });
};

export const useDeletePromotion = (
  options?: UseMutationOptions<void, Error, number>
) => {
  return useMutation<void, Error, number>({
    mutationFn: deletePromotion,
    ...options,
  });
};
