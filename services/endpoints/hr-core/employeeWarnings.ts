import { 
  get, 
  post, 
  put, 
  del 
} from "@/services/axios";
import { 
  GetEmployeeWarningsResponse,
  GetEmployeeWarningByIdResponse,
  GetEmployeeWarningByEmployeeIdResponse,
  CreateEmployeeWarningRequest, 
  CreateEmployeeWarningResponse,
  UpdateEmployeeWarningRequest,
  UpdateEmployeeWarningResponse,
  DeleteEmployeeWarningResponse,
  UploadWarningDocumentResponse
} from "@/types/hr-core/employeeWarnings";

export const getEmployeeWarnings = async (): Promise<GetEmployeeWarningsResponse> => {
  const response = await get<GetEmployeeWarningsResponse>("/admin/hr/employee-warnings");
  return response;
};

export const getEmployeeWarningById = async (id: number): Promise<GetEmployeeWarningByIdResponse> => {
  const response = await get<GetEmployeeWarningByIdResponse>(`/admin/hr/employee-warnings?id=${id}`);
  return response;
};

export const getEmployeeWarningByEmployeeId = async (employeeId: string): Promise<GetEmployeeWarningByEmployeeIdResponse> => {
  const response = await get<GetEmployeeWarningByEmployeeIdResponse>(`/admin/hr/employee-warnings?employee_id=${employeeId}`);
  return response;
};

export const createEmployeeWarning = async (payload: CreateEmployeeWarningRequest): Promise<CreateEmployeeWarningResponse> => {
  const response = await post<CreateEmployeeWarningResponse>("/admin/hr/employee-warnings", payload);
  return response;
};

export const updateEmployeeWarning = async (id: number, payload: UpdateEmployeeWarningRequest): Promise<UpdateEmployeeWarningResponse> => {
  const response = await put<UpdateEmployeeWarningResponse>(`/admin/hr/employee-warnings?id=${id}`, payload);
  return response;
};

export const deleteEmployeeWarning = async (id: number): Promise<DeleteEmployeeWarningResponse> => {
  const response = await del<DeleteEmployeeWarningResponse>(`/admin/hr/employee-warnings?id=${id}`);
  return response;
};

export const uploadWarningDocument = async (formData: FormData): Promise<UploadWarningDocumentResponse> => {
  const response = await post<UploadWarningDocumentResponse>("/admin/hr/upload", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};