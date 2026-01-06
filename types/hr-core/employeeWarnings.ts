export interface EmployeeWarning {
  id: number;
  employee_id: string;
  employee_name: string;
  department: string;
  warning_subject: string;
  warning_description: string;
  warning_type: string;
  warning_date: string;
  expiry_date: string;
  issued_by: string;
  supporting_documents: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LocalEmployeeWarning {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  warningSubject: string;
  warningDescription: string;
  warningType: string;
  warningDate: string;
  expiryDate: string;
  issuedBy: string;
  supportingDocuments: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetEmployeeWarningsResponse {
  success: boolean;
  data: EmployeeWarning[];
}

export interface GetEmployeeWarningByIdResponse {
  success: boolean;
  data: EmployeeWarning[];
}

export interface GetEmployeeWarningByEmployeeIdResponse {
  success: boolean;
  data: EmployeeWarning[];
}

export interface CreateEmployeeWarningRequest {
  employee_id: string;
  employee_name: string;
  department: string;
  warning_subject: string;
  warning_description: string;
  warning_type: string;
  warning_date: string;
  expiry_date: string;
  issued_by: string;
  supporting_documents: string;
}

export interface CreateEmployeeWarningResponse {
  success: boolean;
  message: string;
  data: EmployeeWarning;
}

export interface UpdateEmployeeWarningRequest {
  employee_id?: string;
  employee_name?: string;
  department?: string;
  warning_subject?: string;
  warning_description?: string;
  warning_type?: string;
  warning_date?: string;
  expiry_date?: string;
  issued_by?: string;
  supporting_documents?: string;
  status?: string;
}

export interface UpdateEmployeeWarningResponse {
  success: boolean;
  message: string;
  data: EmployeeWarning;
}

export interface DeleteEmployeeWarningResponse {
  success: boolean;
  message: string;
}

export interface UploadWarningDocumentResponse {
  success: boolean;
  url: string;
  pathname: string;
}