// import { useQuery, useMutation } from "@tanstack/react-query";
// import { 
//   getPendingEmployees, 
//   updateEmployeeStatus,
//   getAllDocuments
// } from "@/services/endpoints/employees/pendingEmployees";
// import { 
//   PENDING_DOCUMENTS, 
//   PENDING_EMPLOYEES 
// } from "@/services/constants/employees";
// import { 
//   PendingEmployeesResponse, 
//   PendingEmployeeResponse,
//   AllDocumentsResponse
// } from "@/types/employees/pending-employees";

// export const usePendingEmployees = (page: number = 1, limit: number = 10) => {
//   return useQuery<PendingEmployeesResponse, Error>({
//     queryKey: [PENDING_EMPLOYEES, page, limit],
//     queryFn: () => getPendingEmployees(page, limit),
//   });
// };

// // Hook to update employee status
// export const useUpdateEmployeeStatus = () => {
//   return useMutation<PendingEmployeeResponse, Error, { id: string; status: string }>({
//     mutationFn: ({ id, status }) => updateEmployeeStatus(id, status),
//   });
// };

// // Hook to fetch all documents
// export const useAllDocuments = () => {
//   return useQuery<AllDocumentsResponse, Error>({
//     queryKey: [PENDING_DOCUMENTS],
//     queryFn: () => getAllDocuments(),
//   });
// };


import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  getPendingEmployees, 
  updateEmployeeStatus,
  getAllDocuments,
  approvePendingEmployee
} from "@/services/endpoints/employees/pendingEmployees";
import { 
  PENDING_DOCUMENTS, 
  PENDING_EMPLOYEES 
} from "@/services/constants/employees";
import { 
  PendingEmployeesResponse, 
  PendingEmployeeResponse,
  AllDocumentsResponse
} from "@/types/employees/pending-employees";

// Fetch pending employees list
export const usePendingEmployees = (page: number = 1, limit: number = 10) => {
  return useQuery<PendingEmployeesResponse, Error>({
    queryKey: [PENDING_EMPLOYEES, page, limit],
    queryFn: () => getPendingEmployees(page, limit),
  });
};

// Update employee status by ID
export const useUpdateEmployeeStatus = () => {
  return useMutation<PendingEmployeeResponse, Error, { id: string; status: string }>({
    mutationFn: ({ id, status }) => updateEmployeeStatus(id, status),
  });
};

// ✅ Approve pending employee by registration ID (IPPIS code) - FIXED: Using correct method
export const useApprovePendingEmployee = () => {
  return useMutation<
    PendingEmployeeResponse,
    Error,
    { registrationId: string; id: string }
  >({
    mutationFn: ({ registrationId, id }) =>
      approvePendingEmployee(registrationId, { id }),
  });
};

// Fetch all documents
export const useAllDocuments = () => {
  return useQuery<AllDocumentsResponse, Error>({
    queryKey: [PENDING_DOCUMENTS],
    queryFn: () => getAllDocuments(),
  });
};