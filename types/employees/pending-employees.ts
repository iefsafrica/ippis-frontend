export interface PendingEmployee {
  id: string | number;
  registration_id?: string;
  firstname?: string;
  surname?: string;
  name?: string;
  email: string;
  department: string;
  position: string;
  status: string;
  source?: string;
  submission_date?: string;
  join_date?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  missing_fields?: unknown;
  metadata: Record<string, string> | null;
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

// New types for documents endpoint
export interface EmployeeDocuments {
  appointmentLetter: string | null;
  educationalCertificates: string | null;
  profileImage: string | null;
  signature: string | null;
}

export interface DocumentByEmployee {
  registrationId: string;
  name: string;
  documents: EmployeeDocuments;
  status: string | null;
  uploadedAt: string | null;
}

export interface DocumentsResponse {
  success: boolean;
  data: DocumentByEmployee[];
}

// New type for reject pending employee response
export interface RejectPendingEmployeeResponse {
  success: boolean;
  message: string;
  data: {
    registration_id: string;
    name: string;
    email: string;
    reapply_url: string;
  };
}

export interface BulkApprovePendingEmployeesPayload {
  registration_ids: string[];
}

export interface BulkApprovePendingEmployeesResponse {
  success: boolean;
  message: string;
  results: {
    success: Array<{
      id: string;
      [key: string]: unknown;
    }>;
    failed: Array<{
      id: string;
      error: string;
      [key: string]: unknown;
    }>;
  };
}

// New type for the detailed employee data from your API
export interface Employee3 {
  id: string | number;
  registration_id: string;
  surname: string;
  firstname: string;
  name?: string;
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
  middlename?: string;
  email: string;
  department: string;
  position: string;
  status: string;
  source: string;
  submission_date: string;
  created_at: string;
  updated_at: string;
  createdAt: string;
  updatedAt: string;
  missing_fields: unknown;
  metadata: Record<string, string> | null;
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
  join_date?: string;
}

export interface Employee3Response {
  success: boolean;
  data: {
    employees: Employee3[];
    pagination: PendingEmployeesPagination;
  };
}
