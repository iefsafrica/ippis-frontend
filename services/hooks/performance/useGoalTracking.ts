import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createGoalTracking,
  deleteGoalTracking,
  getGoalTrackingById,
  getGoalTrackings,
  updateGoalTracking,
} from "@/services/endpoints/performance/goal-tracking";
import {
  CREATE_GOAL_TRACKING,
  DELETE_GOAL_TRACKING,
  GET_GOAL_TRACKING,
  GET_GOAL_TRACKINGS,
  UPDATE_GOAL_TRACKING,
} from "@/services/constants/performance";
import {
  CreateGoalTrackingPayload,
  CreateGoalTrackingResponse,
  DeleteGoalTrackingResponse,
  GetGoalTrackingResponse,
  GetGoalTrackingsResponse,
  GoalTracking,
  UpdateGoalTrackingPayload,
  UpdateGoalTrackingResponse,
} from "@/types/performance/goal-tracking";

export const useGetGoalTrackings = () => {
  return useQuery<GetGoalTrackingsResponse, Error>({
    queryKey: [GET_GOAL_TRACKINGS],
    queryFn: getGoalTrackings,
  });
};

export const useGetGoalTrackingById = (id?: string | number) => {
  return useQuery<GetGoalTrackingResponse, Error>({
    queryKey: [GET_GOAL_TRACKING, id],
    queryFn: () => getGoalTrackingById(id as string | number),
    enabled: id !== undefined && id !== null && `${id}`.length > 0,
  });
};

export const useCreateGoalTracking = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateGoalTrackingResponse, Error, CreateGoalTrackingPayload>({
    mutationKey: [CREATE_GOAL_TRACKING],
    mutationFn: createGoalTracking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_GOAL_TRACKINGS] });
    },
  });
};

export const useUpdateGoalTracking = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateGoalTrackingResponse, Error, UpdateGoalTrackingPayload>({
    mutationKey: [UPDATE_GOAL_TRACKING],
    mutationFn: updateGoalTracking,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_GOAL_TRACKINGS] });
      queryClient.invalidateQueries({ queryKey: [GET_GOAL_TRACKING, variables.id] });
    },
  });
};

export const useDeleteGoalTracking = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteGoalTrackingResponse, Error, string | number>({
    mutationKey: [DELETE_GOAL_TRACKING],
    mutationFn: deleteGoalTracking,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: [GET_GOAL_TRACKINGS] });
      queryClient.invalidateQueries({ queryKey: [GET_GOAL_TRACKING, deletedId] });
    },
  });
};

export const useGoalTrackingData = () => {
  return useQuery<GoalTracking[], Error>({
    queryKey: [GET_GOAL_TRACKINGS, "normalized"],
    queryFn: async () => {
      const response = await getGoalTrackings();
      return response.data || [];
    },
  });
};
