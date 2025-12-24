export interface Transfer {
  id: number;
  employee_id: string;
  employee_name: string;
  from_department: string;
  to_department: string;
  from_position: string;
  to_position: string;
  from_location: string;
  to_location: string;
  effective_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

// Base response interfaces
export interface BaseResponse {
  success: boolean;
  message?: string;
}

export interface TransferResponse extends BaseResponse {
  data: Transfer;
}

export interface TransfersListResponse extends BaseResponse {
  data: Transfer[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Payload interfaces
export interface CreateTransferPayload {
  employee_id: string;
  employee_name: string;
  from_department: string;
  to_department: string;
  from_position: string;
  to_position: string;
  from_location: string;
  to_location: string;
  effective_date: string;
  reason: string;
}

export interface UpdateTransferPayload {
  id: number;
  from_department?: string;
  from_position?: string;
  from_location?: string;
  employee_id?: string;
  employee_name?: string;
  to_department?: string;
  to_position?: string;
  to_location?: string;
  effective_date?: string;
  reason?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
}

export interface TransferFilters {
  id?: number;
  employee_id?: string;
  status?: string;
  from_department?: string;
  to_department?: string;
  page?: number;
  limit?: number;
}

// For component usage
export interface TransferData {
  transfers: Transfer[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}