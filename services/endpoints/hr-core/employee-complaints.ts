import { 
  get, 
  post, 
  put, 
  patch,
  del 
} from "@/services/axios";
import { 
  GetEmployeeComplaintsResponse,
  GetEmployeeComplaintResponse,
  CreateEmployeeComplaintRequest,
  CreateEmployeeComplaintResponse,
  UpdateEmployeeComplaintRequest,
  UpdateEmployeeComplaintResponse,
  DeleteEmployeeComplaintResponse
} from "@/types/hr-core/employee-complaints";

export const getEmployeeComplaints = async (): Promise<GetEmployeeComplaintsResponse> => {
  const response = await get<GetEmployeeComplaintsResponse>("/admin/hr/employee-complaints");
  return response;
};

export const getEmployeeComplaint = async (id: number): Promise<GetEmployeeComplaintResponse> => {
  const response = await get<GetEmployeeComplaintResponse>(`/admin/hr/employee-complaints?id=${id}`);
  return response;
};

export const getEmployeeComplaintsByEmployee = async (employee_id: string): Promise<GetEmployeeComplaintsResponse> => {
  const response = await get<GetEmployeeComplaintsResponse>(`/admin/hr/employee-complaint?employee_id=${employee_id}`);
  return response;
};

export const createEmployeeComplaint = async (payload: CreateEmployeeComplaintRequest): Promise<CreateEmployeeComplaintResponse> => {
  const response = await post<CreateEmployeeComplaintResponse>("/admin/hr/employee-complaints", payload);
  return response;
};

export const updateEmployeeComplaint = async (payload: UpdateEmployeeComplaintRequest & { id: number }): Promise<UpdateEmployeeComplaintResponse> => {
  const response = await put<UpdateEmployeeComplaintResponse>("/admin/hr/employee-complaints", payload);
  return response;
};

export const deleteEmployeeComplaint = async (id: number): Promise<DeleteEmployeeComplaintResponse> => {
  const response = await del<DeleteEmployeeComplaintResponse>(`/admin/hr/employee-complaints?id=${id}`);
  return response;
};