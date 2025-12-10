export interface Promotion {
  id: number;
  employee_id: string;
  department: string | null;
  previous_position: string;
  new_position: string;
  effective_date: string;
  reason: string;
  created_at: string;
  updated_at: string;
}

export interface PromotedEmployee {
  id: string;
  name: string;
  email: string;
  department: string;
  employee_name: string;
  new_position: string;
  effective_date: string;
  previous_position: string;
  reason: string;
  current_position: string;
  status: "active" | "inactive" | "pending";
  join_date: string;
  created_at: string;
  updated_at: string;
  registration_id: string | null;
  metadata: any | null;
  promotions: Promotion[];
}

export interface PromotionResponse {
  success: boolean;
  message: string;
  count: number;
  data: Promotion[];
}

export interface TablePromotion {
  id: string;
  employee: string;
  employeeId: string;
  company?: string;
  promotionTitle: string;
  date: string;
  previousPosition: string;
  details: string;
  employeeEmail?: string;
  createdAt?: string;
  updatedAt?: string;
  currentPosition?: string;
}

export interface CreatePromotionRequest {
  employee_id: string;
  department: string | null;
  previous_position: string;
  new_position: string;
  effective_date: string;
  reason: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  years_of_service: number;
  status: "active" | "inactive" | "pending";
  join_date: string;
  created_at: string;
  updated_at: string;
  registration_id: string | null;
  metadata: any | null;
}

export interface CreatePromotionRequest {
  employee_id: string;
  department: string | null;
  previous_position: string;
  new_position: string;
  effective_date: string;
  reason: string;
}


// types/hr-core/promotion-management.ts
export interface Promotion {
  id: number;
  employee_id: string;
  department: string | null;
  previous_position: string;
  new_position: string;
  effective_date: string;
  reason: string;
  created_at: string;
  updated_at: string;
}

export interface PromotedEmployeeDetails {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  status: "active" | "inactive" | "pending";
  join_date: string;
  created_at: string;
  updated_at: string;
  registration_id: string | null;
  metadata: any | null;
  promotions: Promotion[];
}

export interface TablePromotion {
  id: string;
  employee: string;
  employeeId: string;
  company?: string;
  promotionTitle: string;
  date: string;
  previousPosition: string;
  details: string;
  employeeEmail?: string;
  createdAt?: string;
  updatedAt?: string;
  currentPosition?: string;
}

export interface CreatePromotionRequest {
  employee_id: string;
  department: string | null;
  previous_position: string;
  new_position: string;
  effective_date: string;
  reason: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

// Alias for the hook return type
// export type PromotedEmployee = PromotedEmployeeDetails;





