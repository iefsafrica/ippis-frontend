import { get, put, post, patch, del } from "@/services/axios";
import { 
  PendingEmployeesResponse, 
  PendingEmployeeResponse,
  AllDocumentsResponse,
  DocumentsResponse,
  RejectPendingEmployeeResponse
} from "@/types/employees/pending-employees";

export const getPendingEmployees = async (
  page: number = 1,
  limit: number = 10
): Promise<PendingEmployeesResponse> => {
  const { data } = await get<PendingEmployeesResponse>(`/admin/pending`, {
    params: { page, limit },
  });
  // @ts-expect-error axios response mismatch
  return data;
};

export const updateEmployeeStatus = async (
  id: string,
  status: string
): Promise<PendingEmployeeResponse> => {
  const { data } = await put<PendingEmployeeResponse>(
    `/admin/employees/${id}`,
    { status }
  );
  // @ts-expect-error axios response mismatch
  return data;
};

export const approvePendingEmployee = async (
  registrationId: string,
  payload: { id: string }
): Promise<PendingEmployeeResponse> => {
  const cleanRegistrationId = registrationId.replace(/%20/g, ' ');
  
  const { data } = await patch<PendingEmployeeResponse>(
    `/admin/pending/${cleanRegistrationId}/approve`,
    payload
  );
  // @ts-expect-error axios response mismatch
  return data;
};

export const deletePendingEmployee = async (
  registrationId: string
): Promise<{success: boolean; message: string; data: {registration_id: string; name: string; email: string}}> => {
  const cleanRegistrationId = registrationId.replace(/%20/g, ' ');
  
  const { data } = await del<{success: boolean; message: string; data: {registration_id: string; name: string; email: string}}>(
    `/admin/pending/${cleanRegistrationId}/delete`
  );
  // @ts-expect-error axios response mismatch
  return data;
};

export const rejectPendingEmployee = async (
  registrationId: string
): Promise<RejectPendingEmployeeResponse> => {
  const cleanRegistrationId = registrationId.replace(/%20/g, ' ');
  
  const { data } = await patch<RejectPendingEmployeeResponse>(
    `/admin/pending/${cleanRegistrationId}/reject`
  );
 // @ts-expect-error axios response mismatch
  return data;
};

export const getAllDocuments = async (): Promise<AllDocumentsResponse> => {
  const { data } = await get<AllDocumentsResponse>(`/admin/documents/all`);
  // @ts-expect-error axios response mismatch
  return data;
};

export const getDocuments = async (): Promise<DocumentsResponse> => {
  const { data } = await get<DocumentsResponse>(`/admin/documents`);
  // @ts-expect-error axios response mismatch
  return data;
};