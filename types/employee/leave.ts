export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface LeaveBalanceItem {
  id?: string | number;
  leave_type: string;
  days_allowed: number;
  days_taken: number;
  days_pending: number;
  days_available: number;
  year?: number;
}

export interface EmployeeLeaveBalancesResponse {
  success: boolean;
  data: LeaveBalanceItem[];
  message?: string;
}

export interface EmployeeLeaveRequest {
  id: number | string;
  employee_id?: number | string;
  employee_code?: string;
  employee_name?: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  created_at: string;
  updated_at?: string;
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  reliever_name?: string | null;
  department?: string | null;
  mda?: string | null;
}

export interface EmployeeLeaveListResponse {
  success: boolean;
  data: EmployeeLeaveRequest[];
  message?: string;
}

export interface ApplyLeavePayload {
  leave_type: string;
  from_date: string;
  to_date: string;
  reason: string;
  reliever_name?: string;
  contact_address?: string;
  contact_phone?: string;
}

export interface ApplyLeaveResponse {
  success: boolean;
  data: EmployeeLeaveRequest;
  message?: string;
}

export interface CancelLeaveResponse {
  success: boolean;
  message: string;
}

export interface ReviewLeavePayload {
  id: number | string;
  status: "approved" | "rejected";
  rejection_reason?: string;
  remarks?: string;
}

export interface ReviewLeaveResponse {
  success: boolean;
  data: any;
  message?: string;
}

