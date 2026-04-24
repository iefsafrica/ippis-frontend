import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getPendingEmployees, 
  updateEmployeeStatus,
  getAllDocuments,
  approvePendingEmployee,
  bulkApprovePendingEmployees,
  deletePendingEmployee,
  getDocuments,
  disapprovePendingEmployee 
} from "@/services/endpoints/employees/pendingEmployees";
import { 
  PENDING_DOCUMENTS, 
  PENDING_EMPLOYEES,
  QUERY_KEYS,
  DOCUMENTS
} from "@/services/constants/employees";
import { 
  PendingEmployeesResponse, 
  PendingEmployeeResponse,
  AllDocumentsResponse,
  DocumentsResponse,
  RejectPendingEmployeeResponse,
  BulkApprovePendingEmployeesResponse,
  BulkApprovePendingEmployeesPayload
} from "@/types/employees/pending-employees";

export const usePendingEmployees = (page: number = 1, limit: number = 10) => {
  return useQuery<PendingEmployeesResponse, Error>({
    queryKey: [PENDING_EMPLOYEES, page, limit],
    queryFn: () => getPendingEmployees(page, limit),
  });
};

export const useUpdateEmployeeStatus = () => {
  return useMutation<PendingEmployeeResponse, Error, { id: string; status: string }>({
    mutationFn: ({ id, status }) => updateEmployeeStatus(id, status),
  });
};

export const useApprovePendingEmployee = () => {
  return useMutation<
    PendingEmployeeResponse,
    Error,
    { registrationId: string }
  >({
    mutationFn: ({ registrationId }) =>
      approvePendingEmployee(registrationId),
  });
};

export const useBulkApprovePendingEmployees = () => {
  const queryClient = useQueryClient();

  return useMutation<
    BulkApprovePendingEmployeesResponse,
    Error,
    BulkApprovePendingEmployeesPayload
  >({
    mutationFn: bulkApprovePendingEmployees,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PENDING_EMPLOYEES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EMPLOYEES_LIST] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECENT_EMPLOYEES] });
    },
  });
};

export const useDeletePendingEmployee = () => {
  return useMutation<
    {success: boolean; message: string; data: {registration_id: string; name: string; email: string}},
    Error,
    { registrationId: string }
  >({
    mutationFn: ({ registrationId }) =>
      deletePendingEmployee(registrationId),
  });
};

export const useDisapprovePendingEmployee = () => {
  return useMutation<
    RejectPendingEmployeeResponse,
    Error,
    { registrationId: string }
  >({
    mutationFn: ({ registrationId }) =>
      disapprovePendingEmployee(registrationId),
  });
};

export const useAllDocuments = () => {
  return useQuery<AllDocumentsResponse, Error>({
    queryKey: [PENDING_DOCUMENTS],
    queryFn: () => getAllDocuments(),
  });
};

export const useDocuments = () => {
  return useQuery<DocumentsResponse, Error>({
    queryKey: [DOCUMENTS],
    queryFn: () => getDocuments(),
  });
};
