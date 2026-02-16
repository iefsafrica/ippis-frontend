import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import {
  getGoalTypes,
  createGoalType,
  updateGoalTypeStatus,
  deleteGoalType,
} from "@/services/endpoints/performance/goal-types";
import { PERFORMANCE_QUERY_KEYS } from "@/services/constants/performance";
import {
  GoalType,
  GoalTypeQueryParams,
  CreateGoalTypeRequest,
  UpdateGoalTypeStatusRequest,
  DeleteGoalTypeRequest,
} from "@/types/performance/goal-types";

export const useGoalTypes = (
  params?: GoalTypeQueryParams,
  options?: UseQueryOptions<GoalType[], Error>
) => {
  return useQuery<GoalType[], Error>({
    queryKey: [PERFORMANCE_QUERY_KEYS.GOAL_TYPES, params],
    queryFn: () => getGoalTypes(params),
    ...options,
  });
};

export const useCreateGoalType = (
  options?: UseMutationOptions<GoalType, Error, CreateGoalTypeRequest>
) => {
  return useMutation<GoalType, Error, CreateGoalTypeRequest>({
    mutationFn: createGoalType,
    ...options,
  });
};

export const useUpdateGoalTypeStatus = (
  options?: UseMutationOptions<GoalType, Error, UpdateGoalTypeStatusRequest>
) => {
  return useMutation<GoalType, Error, UpdateGoalTypeStatusRequest>({
    mutationFn: updateGoalTypeStatus,
    ...options,
  });
};

export const useDeleteGoalType = (
  options?: UseMutationOptions<GoalType, Error, DeleteGoalTypeRequest>
) => {
  return useMutation<GoalType, Error, DeleteGoalTypeRequest>({
    mutationFn: deleteGoalType,
    ...options,
  });
};
