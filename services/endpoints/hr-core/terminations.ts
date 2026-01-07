import { get, post, put, del } from "@/services/axios";
import {
  GetTerminationsResponse,
  GetTerminationResponse,
  CreateTerminationRequest,
  CreateTerminationResponse,
  UpdateTerminationRequest,
  UpdateTerminationResponse,
  DeleteTerminationResponse,
  Termination
} from "@/types/hr-core/terminations";

export const getTerminations = async (): Promise<GetTerminationsResponse> => {
  const response = await get<GetTerminationsResponse>("/admin/hr/terminations");
  return response;
};

export const getTermination = async (id: number): Promise<GetTerminationResponse> => {
  const response = await get<GetTerminationResponse>(`/admin/hr/terminations?id=${id}`);
  return response;
};

export const getTerminationsByEmployee = async (employeeId: string): Promise<GetTerminationsResponse> => {
  const response = await get<GetTerminationsResponse>(`/admin/hr/terminations?employee_id=${employeeId}`);
  return response;
};

export const createTermination = async (payload: CreateTerminationRequest): Promise<CreateTerminationResponse> => {
  const response = await post<CreateTerminationResponse>("/admin/hr/terminations", payload);
  return response;
};

export const updateTermination = async (id: number, payload: UpdateTerminationRequest): Promise<UpdateTerminationResponse> => {
  const response = await put<UpdateTerminationResponse>(`/admin/hr/terminations`, {
    id,
    ...payload
  });
  return response;
};

export const deleteTermination = async (id: number): Promise<DeleteTerminationResponse> => {
  const response = await del<DeleteTerminationResponse>(`/admin/hr/terminations?id=${id}`);
  return response;
};