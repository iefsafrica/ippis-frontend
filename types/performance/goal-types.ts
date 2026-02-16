export type GoalTypeStatus = "active" | "inactive";

export interface GoalType {
  id: number;
  goal_type: string;
  description: string;
  status: GoalTypeStatus;
  created_date: string;
}

export interface GetGoalTypesResponse {
  success: boolean;
  data: GoalType[];
}

export interface GoalTypeQueryParams {
  id?: number | string;
}

export interface CreateGoalTypeRequest {
  goal_type: string;
  description: string;
  status: GoalTypeStatus;
}

export interface CreateGoalTypeResponse {
  success: boolean;
  message: string;
  data: GoalType;
}

export interface UpdateGoalTypeStatusRequest {
  id: number | string;
  status: GoalTypeStatus;
  goal_type?: string;
  description?: string;
}

export interface UpdateGoalTypeStatusResponse {
  success: boolean;
  message: string;
  data: GoalType;
}

export interface DeleteGoalTypeRequest {
  id: number | string;
}

export interface DeleteGoalTypeResponse {
  success: boolean;
  message: string;
  data: GoalType;
}
