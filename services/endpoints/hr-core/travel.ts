import { 
  get, 
  post, 
  put, 
  del 
} from "@/services/axios";
import { 
  GetTravelsResponse,
  GetTravelResponse,
  CreateTravelRequest, 
  CreateTravelResponse,
  UpdateTravelRequest,
  UpdateTravelResponse,
  DeleteTravelResponse,
  TravelQueryParams
} from "@/types/hr-core/travel";

export const getTravels = async (params?: TravelQueryParams): Promise<GetTravelsResponse> => {
  const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  const response = await get<GetTravelsResponse>(`/admin/hr/travel${queryString}`);
  return response;
};

export const getTravel = async (params: TravelQueryParams): Promise<GetTravelResponse> => {
  const queryString = `?${new URLSearchParams(params as Record<string, string>).toString()}`;
  const response = await get<GetTravelResponse>(`/admin/hr/travel${queryString}`);
  return response;
};

export const createTravel = async (payload: CreateTravelRequest): Promise<CreateTravelResponse> => {
  const response = await post<CreateTravelResponse>("/admin/hr/travel", payload);
  return response;
};

export const updateTravel = async (payload: UpdateTravelRequest): Promise<UpdateTravelResponse> => {
  const response = await put<UpdateTravelResponse>("/admin/hr/travel", payload);
  return response;
};

export const deleteTravel = async (id: number): Promise<DeleteTravelResponse> => {
  const response = await del<DeleteTravelResponse>(`/admin/hr/travel?id=${id}`);
  return response;
};