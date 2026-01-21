import { 
  get, 
  post, 
  put, 
  del 
} from "@/services/axios";
import { 
  GetLeavesResponse,
  GetLeaveResponse,
  CreateLeaveRequest, 
  CreateLeaveResponse,
  UpdateLeaveRequest,
  UpdateLeaveResponse,
  DeleteLeaveResponse,
  LeaveQueryParams
} from "@/types/calendar/leaves";

export const getLeaves = async (params?: LeaveQueryParams): Promise<GetLeavesResponse> => {
  const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  const response = await get<GetLeavesResponse>(`/admin/hr/leaves${queryString}`);
  return response;
};

export const getLeave = async (params: LeaveQueryParams): Promise<GetLeaveResponse> => {
  const queryString = `?${new URLSearchParams(params as Record<string, string>).toString()}`;
  const response = await get<GetLeaveResponse>(`/admin/hr/leaves${queryString}`);
  return response;
};

export const createLeave = async (payload: CreateLeaveRequest): Promise<CreateLeaveResponse> => {
  const response = await post<CreateLeaveResponse>("/admin/hr/leaves", payload);
  return response;
};

export const updateLeave = async (payload: UpdateLeaveRequest): Promise<UpdateLeaveResponse> => {
  const response = await put<UpdateLeaveResponse>("/admin/hr/leaves", payload);
  return response;
};

export const deleteLeave = async (id: number): Promise<DeleteLeaveResponse> => {
  const response = await del<DeleteLeaveResponse>(`/admin/hr/leaves?id=${id}`);
  return response;
};
