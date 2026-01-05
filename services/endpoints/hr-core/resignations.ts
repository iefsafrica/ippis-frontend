import { 
  get, 
  post, 
  put, 
  patch,
  del 
} from "@/services/axios";
import { 
  GetResignationsResponse,
  GetResignationResponse,
  CreateResignationRequest,
  CreateResignationResponse,
  UpdateResignationRequest,
  UpdateResignationResponse,
  ApproveResignationRequest,
  ApproveResignationResponse,
  DisapproveResignationRequest,
  DisapproveResignationResponse,
  DeleteResignationResponse
} from "@/types/hr-core/resignations";

export const getResignations = async (): Promise<GetResignationsResponse> => {
  const response = await get<GetResignationsResponse>("/admin/hr/resignation");
  return response;
};

export const getResignation = async (id: number): Promise<GetResignationResponse> => {
  const response = await get<GetResignationResponse>(`/admin/hr/resignation?id=${id}`);
  return response;
};

export const getResignationsByEmployee = async (employee_id: string): Promise<GetResignationsResponse> => {
  const response = await get<GetResignationsResponse>(`/admin/hr/resignation?employee_id=${employee_id}`);
  return response;
};

export const createResignation = async (payload: CreateResignationRequest): Promise<CreateResignationResponse> => {
  const response = await post<CreateResignationResponse>("/admin/hr/resignation", payload);
  return response;
};

export const updateResignation = async (id: number, payload: UpdateResignationRequest): Promise<UpdateResignationResponse> => {
  const response = await patch<UpdateResignationResponse>(`/admin/hr/resignation?id=${id}`, payload);
  return response;
};

export const approveResignation = async (payload: ApproveResignationRequest): Promise<ApproveResignationResponse> => {
  const response = await put<ApproveResignationResponse>("/admin/hr/resignation/approve", payload);
  return response;
};

export const disapproveResignation = async (payload: DisapproveResignationRequest): Promise<DisapproveResignationResponse> => {
  const response = await patch<DisapproveResignationResponse>("/admin/hr/resignation/disapprove", payload);
  return response;
};

export const deleteResignation = async (id: number): Promise<DeleteResignationResponse> => {
  const response = await del<DeleteResignationResponse>(`/admin/hr/resignation?id=${id}`);
  return response;
};