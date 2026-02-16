import { get, post, put, delWithBody } from "@/services/axios";
import {
  GoalType,
  GoalTypeQueryParams,
  GetGoalTypesResponse,
  CreateGoalTypeRequest,
  CreateGoalTypeResponse,
  UpdateGoalTypeStatusRequest,
  UpdateGoalTypeStatusResponse,
  DeleteGoalTypeRequest,
  DeleteGoalTypeResponse,
} from "@/types/performance/goal-types";

const GOAL_TYPES_ENDPOINT = "/admin/performance/goal-types";

export const getGoalTypes = async (
  params?: GoalTypeQueryParams
): Promise<GoalType[]> => {
  const queryString = params
    ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
    : "";
  const response = await get<GetGoalTypesResponse>(
    `${GOAL_TYPES_ENDPOINT}${queryString}`
  );
  if (response && response.success && response.data) return response.data;
  return [];
};

export const createGoalType = async (
  payload: CreateGoalTypeRequest
): Promise<GoalType> => {
  const response = await post<CreateGoalTypeResponse>(GOAL_TYPES_ENDPOINT, payload);
  return response.data;
};

export const updateGoalTypeStatus = async (
  payload: UpdateGoalTypeStatusRequest
): Promise<GoalType> => {
  const response = await put<UpdateGoalTypeStatusResponse>(GOAL_TYPES_ENDPOINT, payload);
  return response.data;
};

export const deleteGoalType = async (
  payload: DeleteGoalTypeRequest
): Promise<GoalType> => {
  const response = await delWithBody<DeleteGoalTypeResponse>(
    GOAL_TYPES_ENDPOINT,
    payload
  );
  return response.data;
};
