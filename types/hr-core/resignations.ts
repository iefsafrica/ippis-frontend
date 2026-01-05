export interface Resignation {
  id: number;
  employee_id: string;
  employee_name: string;
  department: string;
  position: string;
  notice_date: string;
  resignation_date: string;
  reason: string;
  exit_interview: 'pending' | 'completed' | 'scheduled';
  notes: string;
  status: 'pending' | 'approved' | 'disapproved';
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  disapproved_by: string | null;
  disapproved_at: string | null;
  disapproval_reason: string | null;
}

export interface GetResignationsResponse {
  success: boolean;
  data: Resignation[];
}

export interface GetResignationResponse {
  success: boolean;
  data: Resignation;
}

export interface CreateResignationRequest {
  employee_id: string;
  employee_name: string;
  department: string;
  position: string;
  notice_date: string;
  resignation_date: string;
  reason: string;
  exit_interview?: 'pending' | 'completed' | 'scheduled';
  notes?: string;
}

export interface CreateResignationResponse {
  success: boolean;
  message: string;
  data: Resignation;
}

export interface UpdateResignationRequest {
  notes?: string;
  exit_interview?: 'pending' | 'completed' | 'scheduled';
}

export interface UpdateResignationResponse {
  success: boolean;
  message: string;
  data: Resignation;
}

export interface ApproveResignationRequest {
  id: number;
  approved_by: string;
}

export interface ApproveResignationResponse {
  success: boolean;
  message: string;
  data: Resignation;
}

export interface DisapproveResignationRequest {
  id: number;
  disapproved_by: string;
  reason: string;
}

export interface DisapproveResignationResponse {
  success: boolean;
  message: string;
  data: Resignation;
}

export interface DeleteResignationResponse {
  success: boolean;
  message: string;
}