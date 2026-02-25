export type IndicatorStatus = "active" | "inactive" | string;

export interface Indicator {
  id: string | number;
  indicator_name: string;
  department_id: number;
  designation_id: number;
  description: string;
  status: IndicatorStatus;
  added_by: string;
  created_at?: string;
  updated_at?: string;
  department_name?: string;
  designation_name?: string;
}

export interface GetIndicatorsResponse {
  success: boolean;
  message?: string;
  data: Indicator[];
}

export interface GetIndicatorResponse {
  success: boolean;
  message?: string;
  data: Indicator;
}

export interface CreateIndicatorPayload {
  indicator_name: string;
  department_id: number;
  designation_id: number;
  description: string;
  status: IndicatorStatus;
  added_by: string;
}

export interface CreateIndicatorResponse {
  success: boolean;
  message?: string;
  data: Indicator;
}

export interface UpdateIndicatorPayload {
  id: string | number;
  indicator_name?: string;
  department_id?: number;
  designation_id?: number;
  description?: string;
  status?: IndicatorStatus;
  added_by?: string;
}

export interface UpdateIndicatorResponse {
  success: boolean;
  message?: string;
  data: Indicator;
}

export interface DeleteIndicatorResponse {
  success: boolean;
  message?: string;
  data?: Indicator;
}
