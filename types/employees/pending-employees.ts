export interface PendingEmployee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  status: string; 
  join_date: string; 
}

export interface PendingEmployeesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PendingEmployeesResponse {
  success: boolean;
  data: {
    employees: PendingEmployee[];
    pagination: PendingEmployeesPagination;
  };
}

// New type for single employee response
export interface PendingEmployeeResponse {
  success: boolean;
  data: PendingEmployee;
}

// Document types
export interface Document {
  id: number;
  name: string;
  type: string;
  employee_name: string;
  employee_id: string;
  status: string;
  upload_date: string;
}

export interface AllDocumentsResponse {
  success: boolean;
  data: Document[];
  message: string;
}