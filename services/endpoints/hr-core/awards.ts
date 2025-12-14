

import { 
  get, 
  post, 
  put, 
  del 
} from "@/services/axios";
import { 
  GetAwardsResponse,
  CreateAwardRequest, 
  CreateAwardResponse,
  UpdateAwardRequest,
  UpdateAwardResponse,
  DeleteAwardResponse
} from "@/types/hr-core/awards";

export const getAwards = async (): Promise<GetAwardsResponse> => {
  const response = await get<GetAwardsResponse>("/admin/hr/awards");
  return response;
};

export const getAward = async (id: number): Promise<{ success: boolean; data: any }> => {
  const response = await get<{ success: boolean; data: any }>(`/admin/hr/awards/${id}`);
  return response;
};

export const createAward = async (payload: CreateAwardRequest): Promise<CreateAwardResponse> => {
  const response = await post<CreateAwardResponse>("/admin/hr/awards", payload);
  return response;
};

export const updateAward = async (id: number, payload: UpdateAwardRequest): Promise<UpdateAwardResponse> => {
  const response = await put<UpdateAwardResponse>(`/admin/hr/awards/${id}`, payload);
  return response;
};

export const deleteAward = async (id: number): Promise<DeleteAwardResponse> => {
  const response = await del<DeleteAwardResponse>(`/admin/hr/awards/${id}`);
  return response;
};