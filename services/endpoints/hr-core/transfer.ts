import api from "@/services/axios";
import {
  TransferResponse,
  TransfersListResponse,
  CreateTransferPayload,
  UpdateTransferPayload,
  TransferFilters,
} from "@/types/hr-core/transfer";

export const getTransfersList = async (
  filters?: TransferFilters
): Promise<TransfersListResponse> => {
  const response = await api.get<TransfersListResponse>("/admin/hr/transfer", {
    params: filters,
  });
  return response.data;
};

export const getTransferById = async (id: number): Promise<TransferResponse> => {
  const response = await api.get<TransferResponse>("/admin/hr/transfer", {
    params: { id },
  });
  return response.data;
};

export const getTransfersByEmployeeId = async (
  employee_id: string
): Promise<TransfersListResponse> => {
  const response = await api.get<TransfersListResponse>("/admin/hr/transfer", {
    params: { employee_id },
  });
  return response.data;
};

export const createTransfer = async (
  payload: CreateTransferPayload
): Promise<TransferResponse> => {
  const response = await api.post<TransferResponse>("/admin/hr/transfer", payload);
  return response.data;
};

export const updateTransfer = async (
  payload: UpdateTransferPayload
): Promise<TransferResponse> => {
  const response = await api.put<TransferResponse>("/admin/hr/transfer", payload);
  return response.data;
};

export const deleteTransfer = async (id: number): Promise<TransferResponse> => {
  const response = await api.delete<TransferResponse>("/admin/hr/transfer", {
    params: { id },
  });
  return response.data;
};

// Optional: Additional endpoints that might be useful
// export const approveTransfer = async (id: number): Promise<TransferResponse> => {
//   const response = await api.patch<TransferResponse>(`/admin/hr/transfer/${id}/approve`);
//   return response.data;
// };

// export const rejectTransfer = async (id: number): Promise<TransferResponse> => {
//   const response = await api.patch<TransferResponse>(`/admin/hr/transfer/${id}/reject`);
//   return response.data;
// };