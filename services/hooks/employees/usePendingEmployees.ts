// import { useQuery, useMutation } from "@tanstack/react-query";
// import { 
//   getPendingEmployees, 
//   updateEmployeeStatus,
//   getAllDocuments,
//   approvePendingEmployee,
//   deletePendingEmployee
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


// export const useUpdateEmployeeStatus = () => {
//   return useMutation<PendingEmployeeResponse, Error, { id: string; status: string }>({
//     mutationFn: ({ id, status }) => updateEmployeeStatus(id, status),
//   });
// };


// export const useApprovePendingEmployee = () => {
//   return useMutation<
//     PendingEmployeeResponse,
//     Error,
//     { registrationId: string; id: string }
//   >({
//     mutationFn: ({ registrationId, id }) =>
//       approvePendingEmployee(registrationId, { id }),
//   });
// };


// export const useDeletePendingEmployee = () => {
//   return useMutation<
//     {success: boolean; message: string; data: {registration_id: string; name: string; email: string}},
//     Error,
//     { registrationId: string }
//   >({
//     mutationFn: ({ registrationId }) =>
//       deletePendingEmployee(registrationId),
//   });
// };


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
  approvePendingEmployee,
  deletePendingEmployee,
  getDocuments // Import the new function
} from "@/services/endpoints/employees/pendingEmployees";
import { 
  PENDING_DOCUMENTS, 
  PENDING_EMPLOYEES,
  DOCUMENTS // Import the new constant
} from "@/services/constants/employees";
import { 
  PendingEmployeesResponse, 
  PendingEmployeeResponse,
  AllDocumentsResponse,
  DocumentsResponse // Import the new type
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
    { registrationId: string; id: string }
  >({
    mutationFn: ({ registrationId, id }) =>
      approvePendingEmployee(registrationId, { id }),
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