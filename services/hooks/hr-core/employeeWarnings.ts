import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getEmployeeWarnings, 
  getEmployeeWarningById,
  getEmployeeWarningByEmployeeId,
  createEmployeeWarning, 
  updateEmployeeWarning, 
  deleteEmployeeWarning,
  uploadWarningDocument
} from "@/services/endpoints/hr-core/employeeWarnings";
import { 
  CREATE_EMPLOYEE_WARNING, 
  GET_EMPLOYEE_WARNINGS, 
  GET_EMPLOYEE_WARNING_BY_ID,
  GET_EMPLOYEE_WARNING_BY_EMPLOYEE_ID,
  UPDATE_EMPLOYEE_WARNING, 
  DELETE_EMPLOYEE_WARNING,
  UPLOAD_WARNING_DOCUMENT
} from "@/services/constants/employeeWarnings";
import { 
  CreateEmployeeWarningRequest, 
  CreateEmployeeWarningResponse,
  UpdateEmployeeWarningRequest,
  UpdateEmployeeWarningResponse,
  DeleteEmployeeWarningResponse,
  UploadWarningDocumentResponse,
  EmployeeWarning,
  GetEmployeeWarningsResponse,
  GetEmployeeWarningByEmployeeIdResponse
} from "@/types/hr-core/employeeWarnings";

export const useGetEmployeeWarnings = () => {
  return useQuery<GetEmployeeWarningsResponse, Error>({
    queryKey: [GET_EMPLOYEE_WARNINGS],
    queryFn: getEmployeeWarnings,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useGetEmployeeWarningById = (id: number) => {
  return useQuery<{ success: boolean; data: EmployeeWarning[] }, Error>({
    queryKey: [GET_EMPLOYEE_WARNING_BY_ID, id],
    queryFn: () => getEmployeeWarningById(id),
    enabled: !!id,
  });
};

export const useGetEmployeeWarningByEmployeeId = (employeeId: string) => {
  return useQuery<GetEmployeeWarningByEmployeeIdResponse, Error>({
    queryKey: [GET_EMPLOYEE_WARNING_BY_EMPLOYEE_ID, employeeId],
    queryFn: () => getEmployeeWarningByEmployeeId(employeeId),
    enabled: !!employeeId,
  });
};

export const useCreateEmployeeWarning = () => {
  const queryClient = useQueryClient();
  
  return useMutation<CreateEmployeeWarningResponse, Error, CreateEmployeeWarningRequest>({
    mutationKey: [CREATE_EMPLOYEE_WARNING],
    mutationFn: createEmployeeWarning,
    onSuccess: (response) => {
      // If the server returned the created warning, optimistically add it to the top of the cached list
      const newWarning = response?.data;

      if (newWarning) {
        queryClient.setQueryData<GetEmployeeWarningsResponse | undefined>([GET_EMPLOYEE_WARNINGS], (old) => {
          if (!old) return { success: true, data: [newWarning] };
          // ensure we don't duplicate the same id (in case of refetch)
          const filtered = old.data.filter((w) => w.id !== newWarning.id);
          return { ...old, data: [newWarning, ...filtered] };
        });
      } else {
        queryClient.invalidateQueries({ queryKey: [GET_EMPLOYEE_WARNINGS] });
      }

      // Still invalidate employee-specific queries to keep things in sync
      queryClient.invalidateQueries({ queryKey: [GET_EMPLOYEE_WARNING_BY_EMPLOYEE_ID] });
    },
  });
};

export const useUpdateEmployeeWarning = () => {
  const queryClient = useQueryClient();
  
  return useMutation<UpdateEmployeeWarningResponse, Error, { id: number; data: UpdateEmployeeWarningRequest }>({
    mutationKey: [UPDATE_EMPLOYEE_WARNING],
    mutationFn: ({ id, data }) => updateEmployeeWarning(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_EMPLOYEE_WARNINGS] });
      queryClient.invalidateQueries({ queryKey: [GET_EMPLOYEE_WARNING_BY_ID, variables.id] });
      queryClient.invalidateQueries({ queryKey: [GET_EMPLOYEE_WARNING_BY_EMPLOYEE_ID] });
    },
  });
};

export const useDeleteEmployeeWarning = () => {
  const queryClient = useQueryClient();
  
  return useMutation<DeleteEmployeeWarningResponse, Error, number>({
    mutationKey: [DELETE_EMPLOYEE_WARNING],
    mutationFn: deleteEmployeeWarning,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_EMPLOYEE_WARNINGS] });
      queryClient.invalidateQueries({ queryKey: [GET_EMPLOYEE_WARNING_BY_EMPLOYEE_ID] });
    },
  });
};

export const useUploadWarningDocument = () => {
  return useMutation<UploadWarningDocumentResponse, Error, FormData>({
    mutationKey: [UPLOAD_WARNING_DOCUMENT],
    mutationFn: uploadWarningDocument,
  });
};