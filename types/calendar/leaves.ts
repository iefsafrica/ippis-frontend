export interface Leave {
  id: number;
  employee_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  emergency_contact: string;
  status: string;
  created_at: string;
  updated_at: string;
  employee_id: string;
}

export interface GetLeavesResponse {
  success: boolean;
  data: Leave[];
}

export interface GetLeaveResponse {
  success: boolean;
  data: Leave[];
}

export interface CreateLeaveRequest {
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  emergency_contact: string;
}

export interface CreateLeaveResponse {
  success: boolean;
  message: string;
  data: Leave;
}

export interface UpdateLeaveRequest {
  id: number;
  employee_id?: string;
  leave_type?: string;
  start_date?: string;
  end_date?: string;
  reason?: string;
  emergency_contact?: string;
  status?: string;
}

export interface UpdateLeaveResponse {
  success: boolean;
  message: string;
}

export interface DeleteLeaveResponse {
  success: boolean;
  message: string;
}

export interface LeaveQueryParams {
  id?: number;
  employee_id?: string;
}
