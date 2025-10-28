import { get, put } from "@/services/axios";
import { 
  PendingEmployeesResponse, 
  PendingEmployeeResponse,
  AllDocumentsResponse
} from "@/types/employees/pending-employees";

export const getPendingEmployees = async (
  page: number = 1,
  limit: number = 10
): Promise<PendingEmployeesResponse> => {
  const { data } = await get<PendingEmployeesResponse>(
    `/admin/employees?status=pending&page=${page}&limit=${limit}`
  );
  // @ts-expect-error axios response mismatch
  return data;
};

// Update a pending employee's status by ID
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

// Fetch all documents
export const getAllDocuments = async (): Promise<AllDocumentsResponse> => {
  const { data } = await get<AllDocumentsResponse>(
    `/admin/documents/all`
  );
  // @ts-expect-error axios response mismatch
  return data;
};