
export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  metadata: any;
  position: string;
  status: 'active' | 'inactive' | 'pending'; 
  join_date: string;
  created_at: string;
  updated_at: string;
  registration_id: string | null;
  createdAt: string;
  updatedAt: string;
  uploaded_documents?: string; 
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

export interface RecentEmployeesResponse {
  success: boolean;
  data: {
    employees: Employee[];
    count: number;
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

export interface RecentEmployeesData {
  employees: Employee[];
  count: number;
}

// Add Employee Types
export interface AddEmployeePayload {
  surname: string;
  firstname: string;
  email: string;
  department: string;
  position: string;
  status: 'pending' | 'active' | 'inactive';
}

export interface AddEmployeeResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    registration_id: string;
    surname: string;
    firstname: string;
    email: string;
    department: string;
    position: string;
    status: 'pending' | 'active' | 'inactive';
    source: string;
    submission_date: string;
    created_at: string;
    updated_at: string;
    missing_fields: any;
    metadata: any;
  };
}

// Import Employees Types
export interface ImportEmployeesPayload {
  file: File;
}

export interface ImportEmployeeData {
  id: number;
  registration_id: string;
  surname: string;
  firstname: string;
  email: string;
  department: string;
  position: string;
  status: string;
  source: string;
  submission_date: string;
  recorded_at: string;
}

export interface ImportEmployeesResponse {
  success: boolean;
  message: string;
  data: ImportEmployeeData[];
}

export interface EmployeeRegistrationPayload {
  registration_id?: string;
  registrationId?: string;
  nin?: string;
  firstname?: string;
  firstName?: string;
  first_name?: string;
  surname?: string;
  middlename?: string;
  middle_name?: string;
  email?: string;
  gender?: string;
  telephoneno?: string;
  birthdate?: string;
  state_of_origin?: string;
  residence_address?: string;
  residence_state?: string;
  residence_lga?: string;
  profession?: string;
  maritalstatus?: string;
  employment_id?: string;
  service_number?: string;
  file_number?: string;
  rank_position?: string;
  department?: string;
  organization?: string;
  employment_type?: string;
  probation_period?: string;
  work_location?: string;
  date_of_first_appointment?: string;
  grade_level?: string;
  salary_structure?: string;
  cadre?: string;
  bank_name?: string;
  account_number?: string;
  pfa_name?: string;
  rsapin?: string;
  educational_background?: string;
  certifications?: string;
  next_of_kin_name?: string;
  next_of_kin_relationship?: string;
  next_of_kin_phone_number?: string;
  next_of_kin_address?: string;
  declaration?: boolean;
}

export interface EmployeeRegistrationResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}
