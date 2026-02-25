export type AppraiserStatus = "scheduled" | "in-progress" | "completed" | "cancelled" | string;

export interface Appraiser {
  id: string | number;
  employee_id: string;
  department_id: number;
  designation_id: number;
  appraisal_date: string;
  status: AppraiserStatus;
  rating?: number | null;
  remarks?: string | null;
  added_by?: string | null;
  created_at?: string;
  updated_at?: string;
  department_name?: string;
  designation_name?: string;
}

export interface GetAppraisersResponse {
  success: boolean;
  message?: string;
  data: Appraiser[];
}

export interface GetAppraiserResponse {
  success: boolean;
  message?: string;
  data: Appraiser;
}

export interface CreateAppraiserPayload {
  employee_id: string;
  department_id: number;
  designation_id: number;
  appraisal_date: string;
  status: AppraiserStatus;
  rating?: number;
  remarks?: string;
  added_by?: string;
}

export interface CreateAppraiserResponse {
  success: boolean;
  message?: string;
  data: Appraiser;
}

export interface UpdateAppraiserPayload {
  id: string | number;
  employee_id?: string;
  department_id?: number;
  designation_id?: number;
  appraisal_date?: string;
  status?: AppraiserStatus;
  rating?: number | null;
  remarks?: string;
  added_by?: string;
}

export interface UpdateAppraiserResponse {
  success: boolean;
  message?: string;
  data: Appraiser;
}

export interface DeleteAppraiserResponse {
  success: boolean;
  message?: string;
  data?: Appraiser;
}
