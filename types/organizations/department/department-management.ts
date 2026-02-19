export type DepartmentStatus = "active" | "inactive" | "pending" | string;

export interface Department {
  id: string;
  company_id: string;
  name: string;
  status: DepartmentStatus;
  created_at: string;
}

export interface GetDepartmentsResponse {
  success: boolean;
  data: Department[];
}

export interface GetDepartmentByIdResponse {
  success: boolean;
  data: Department[] | Department;
}

export interface CreateDepartmentPayload {
  name: string;
  status: DepartmentStatus;
}

export interface CreateDepartmentResponse {
  success: boolean;
  message?: string;
  data: Department;
}

export interface UpdateDepartmentPayload {
  id: string | number;
  name?: string;
  status?: DepartmentStatus;
}

export interface UpdateDepartmentResponse {
  success: boolean;
  message?: string;
  data: Department;
}

export interface DeleteDepartmentResponse {
  success: boolean;
  message?: string;
  data?: Department;
}

