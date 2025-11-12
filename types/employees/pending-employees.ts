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

// New type for the detailed employee data from your API
export interface Employee3 {
  id: string;
  registration_id: string;
  surname: string;
  firstname: string;
  email: string;
  department: string;
  position: string;
  status: string;
  source: string;
  submission_date: string;
  created_at: string;
  updated_at: string;
  missing_fields: any;
  metadata: {
    GL: string;
    LGA: string;
    Step: string;
    Cadre: string;
    Email: string;
    Title: string;
    Gender: string;
    Salary: string;
    "File No": string;
    "RSA PIN": string;
    Surname: string;
    "PFA Name": string;
    Position: string;
    "Bank Name": string;
    FirstName: string;
    Department: string;
    "Service No": string;
    "Employee ID": string;
    "Other Names": string;
    "BVN Verified": string;
    "NIN Verified": string;
    Organization: string;
    "Phone Number": string;
    "Date of Birth": string;
    "Work Location": string;
    "Account Number": string;
    "Marital Status": string;
    "Payment Method": string;
    "Employment Type": string;
    "State of Origin": string;
    "Next of Kin Name": string;
    "Probation Period": string;
    "Salary Structure": string;
    "Next of Kin Phone": string;
    "State of Residence": string;
    "Next of Kin Address": string;
    "Residential Address": string;
    "Next of Kin Relationship": string;
    "Date of First Appointment": string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Employee3Response {
  success: boolean;
  data: {
    employees: Employee3[];
    pagination: PendingEmployeesPagination;
  };
}