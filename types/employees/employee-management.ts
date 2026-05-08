
export interface Employee {
  id: string;
  employee_id?: string;
  registration_id?: string;
  firstname?: string;
  surname?: string;
  middlename?: string;
  name: string;
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
  email: string;
  department: string;
  metadata: Record<string, string> | null;
  position: string;
  status: "active" | "inactive" | "pending" | string;
  source?: string;
  join_date?: string;
  submission_date?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  missing_fields?: unknown;
  uploaded_documents?: string;
  title?: string;
  gender?: string;
  telephoneno?: string;
  birthdate?: string;
  state_of_origin?: string;
  residence_address?: string;
  residence_state?: string;
  residence_lga?: string;
  profession?: string;
  maritalstatus?: string;
  next_of_kin_name?: string;
  next_of_kin_relationship?: string;
  next_of_kin_phone_number?: string;
  next_of_kin_address?: string;
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
  firstname: string;
  surname: string;
  name?: string;
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
  email: string;
  department: string;
  position: string;
  nin: string;
  middlename: string;
  gender: string;
  telephoneno: string;
  birthdate: string;
  state_of_origin: string;
  residence_address: string;
  residence_state: string;
  residence_lga: string;
  profession: string;
  maritalstatus: string;
  title: string;
  next_of_kin_name: string;
  next_of_kin_relationship: string;
  next_of_kin_phone_number: string;
  next_of_kin_address: string;
  employment_id_no?: string;
  employmentIdNo?: string;
  service_no?: string;
  serviceNo?: string;
  file_no?: string;
  fileNo?: string;
  rank_position?: string;
  rankPosition?: string;
  organization?: string;
  employment_type?: string;
  employmentType?: string;
  probation_period?: string;
  probationPeriod?: string;
  work_location?: string;
  date_of_first_appointment?: string;
  grade_level?: string;
  salary_structure?: string;
  step?: string;
  cadre?: string;
  bank_name?: string;
  account_number?: string;
  pfa_name?: string;
  rsapin?: string;
  rsa_pin?: string;
  educational_background?: string;
  certifications?: string;
  nuban_account_number?: string;
  metadata?: Record<string, string>;
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
    metadata: Record<string, string> | null;
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
