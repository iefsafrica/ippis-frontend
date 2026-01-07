export interface Termination {
  id: number;
  employee_id: string;
  employee_name: string;
  position: string;
  department: string;
  termination_type: string;
  termination_reason: string;
  termination_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface GetTerminationsResponse {
  success: boolean;
  data: Termination[];
}

export interface GetTerminationResponse {
  success: boolean;
  data: Termination;
}

export interface CreateTerminationRequest {
  employee_id: string;
  employee_name: string;
  position: string;
  department: string;
  termination_type: string;
  termination_reason: string;
  termination_date: string;
  status?: string;
}

export interface CreateTerminationResponse {
  success: boolean;
  message: string;
  data: Termination;
}

export interface UpdateTerminationRequest {
  employee_id?: string;
  employee_name?: string;
  position?: string;
  department?: string;
  termination_type?: string;
  termination_reason?: string;
  termination_date?: string;
  status?: string;
}

export interface UpdateTerminationResponse {
  success: boolean;
  message: string;
  data: Termination;
}

export interface DeleteTerminationResponse {
  success: boolean;
  message: string;
}