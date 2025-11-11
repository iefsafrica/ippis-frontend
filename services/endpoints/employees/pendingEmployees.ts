// import { get, put } from "@/services/axios";
// import { 
//   PendingEmployeesResponse, 
//   PendingEmployeeResponse,
//   AllDocumentsResponse
// } from "@/types/employees/pending-employees";

// export const getPendingEmployees = async (
//   page: number = 1,
//   limit: number = 10
// ): Promise<PendingEmployeesResponse> => {
//   const { data } = await get<PendingEmployeesResponse>(
//     `/admin/pending`
//   );
//   // @ts-expect-error axios response mismatch
//   return data;
// };

// // Update a pending employee's status by ID
// export const updateEmployeeStatus = async (
//   id: string,
//   status: string
// ): Promise<PendingEmployeeResponse> => {
//   const { data } = await put<PendingEmployeeResponse>(
//     `/admin/employees/${id}`,
//     { status }
//   );
//   // @ts-expect-error axios response mismatch
//   return data;
// };

// // Fetch all documents
// export const getAllDocuments = async (): Promise<AllDocumentsResponse> => {
//   const { data } = await get<AllDocumentsResponse>(
//     `/admin/documents/all`
//   );
//   // @ts-expect-error axios response mismatch
//   return data;
// };


import { get, put, post, patch } from "@/services/axios";
import { 
  PendingEmployeesResponse, 
  PendingEmployeeResponse,
  AllDocumentsResponse
} from "@/types/employees/pending-employees";

// Fetch all pending employees
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

// Update a pending employee's status by internal ID
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

// ✅ Approve a pending employee using registration ID (e.g., IPPIS 008) - FIXED: Using PATCH method
export const approvePendingEmployee = async (
  registrationId: string,
  payload: { id: string }
): Promise<PendingEmployeeResponse> => {
  // Remove URL encoding for spaces, use the raw registrationId
  const cleanRegistrationId = registrationId.replace(/%20/g, ' ');
  
  const { data } = await patch<PendingEmployeeResponse>(
    `/admin/pending/${cleanRegistrationId}/approve`,
    payload
  );
  // @ts-expect-error axios response mismatch
  return data;
};

// Fetch all pending employee documents
export const getAllDocuments = async (): Promise<AllDocumentsResponse> => {
  const { data } = await get<AllDocumentsResponse>(`/admin/documents/all`);
  // @ts-expect-error axios response mismatch
  return data;
};