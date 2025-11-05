export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  status: 'active' | 'inactive';
  join_date: string;
  created_at: string;
  updated_at: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeesResponse {
  success: boolean;
  data: {
    employees: Employee[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface EmployeeResponse {
  success: boolean;
  data: Employee;
}

// For the hook return type
export interface EmployeesData {
  employees: Employee[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}