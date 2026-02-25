export type GoalTrackingStatus = "not-started" | "in-progress" | "completed" | "cancelled" | string;

export interface GoalTracking {
  id: string | number;
  employee_id: string;
  goal_type_id: number;
  title: string;
  description: string;
  status: GoalTrackingStatus;
  target_date: string;
  achieved: boolean;
  created_at?: string;
  updated_at?: string;
  goal_type?: string;
}

export interface GetGoalTrackingsResponse {
  success: boolean;
  message?: string;
  data: GoalTracking[];
}

export interface GetGoalTrackingResponse {
  success: boolean;
  message?: string;
  data: GoalTracking;
}

export interface CreateGoalTrackingPayload {
  employee_id: string;
  goal_type_id: number;
  title: string;
  description: string;
  status: GoalTrackingStatus;
  target_date: string;
}

export interface CreateGoalTrackingResponse {
  success: boolean;
  message?: string;
  data: GoalTracking;
}

export interface UpdateGoalTrackingPayload {
  id: string | number;
  employee_id?: string;
  goal_type_id?: number;
  title?: string;
  description?: string;
  status?: GoalTrackingStatus;
  target_date?: string;
  achieved?: boolean;
}

export interface UpdateGoalTrackingResponse {
  success: boolean;
  message?: string;
  data: GoalTracking;
}

export interface DeleteGoalTrackingResponse {
  success: boolean;
  message?: string;
  data?: GoalTracking;
}
