import { EmployeeWarning, LocalEmployeeWarning } from "@/types/hr-core/employeeWarnings";

export const transformToLocalWarning = (warning: EmployeeWarning): LocalEmployeeWarning => {
  return {
    id: warning.id.toString(),
    employeeId: warning.employee_id,
    employeeName: warning.employee_name,
    department: warning.department,
    warningSubject: warning.warning_subject,
    warningDescription: warning.warning_description,
    warningType: warning.warning_type,
    warningDate: warning.warning_date,
    expiryDate: warning.expiry_date,
    issuedBy: warning.issued_by,
    supportingDocuments: warning.supporting_documents,
    status: warning.status,
    createdAt: warning.created_at,
    updatedAt: warning.updated_at,
  };
};

export const transformToApiWarning = (warning: LocalEmployeeWarning): EmployeeWarning => {
  return {
    id: parseInt(warning.id),
    employee_id: warning.employeeId,
    employee_name: warning.employeeName,
    department: warning.department,
    warning_subject: warning.warningSubject,
    warning_description: warning.warningDescription,
    warning_type: warning.warningType,
    warning_date: warning.warningDate,
    expiry_date: warning.expiryDate,
    issued_by: warning.issuedBy,
    supporting_documents: warning.supportingDocuments,
    status: warning.status,
    created_at: warning.createdAt || new Date().toISOString(),
    updated_at: warning.updatedAt || new Date().toISOString(),
  };
};

export const createWarningFormData = (file: File): FormData => {
  const formData = new FormData();
  formData.append('file', file);
  return formData;
};