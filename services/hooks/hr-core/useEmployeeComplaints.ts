import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getEmployeeComplaints, 
  getEmployeeComplaint, 
  getEmployeeComplaintsByEmployee,
  createEmployeeComplaint, 
  updateEmployeeComplaint, 
  deleteEmployeeComplaint 
} from "@/services/endpoints/hr-core/employee-complaints";
import { 
  GET_EMPLOYEE_COMPLAINTS,
  GET_EMPLOYEE_COMPLAINT,
  GET_EMPLOYEE_COMPLAINTS_BY_EMPLOYEE,
  CREATE_EMPLOYEE_COMPLAINT,
  UPDATE_EMPLOYEE_COMPLAINT,
  DELETE_EMPLOYEE_COMPLAINT
} from "@/services/constants/employee-complaints";
import { 
  CreateEmployeeComplaintRequest,
  CreateEmployeeComplaintResponse,
  UpdateEmployeeComplaintRequest,
  UpdateEmployeeComplaintResponse,
  DeleteEmployeeComplaintResponse
} from "@/types/hr-core/employee-complaints";

export const useGetEmployeeComplaints = () => {
  return useQuery({
    queryKey: [GET_EMPLOYEE_COMPLAINTS],
    queryFn: getEmployeeComplaints,
    staleTime: 1000 * 60 * 5, 
    gcTime: 1000 * 60 * 10, 
  });
};

export const useGetEmployeeComplaint = (id: number) => {
  return useQuery({
    queryKey: [GET_EMPLOYEE_COMPLAINT, id],
    queryFn: () => getEmployeeComplaint(id),
    enabled: !!id,
  });
};

export const useGetEmployeeComplaintsByEmployee = (employee_id: string) => {
  return useQuery({
    queryKey: [GET_EMPLOYEE_COMPLAINTS_BY_EMPLOYEE, employee_id],
    queryFn: () => getEmployeeComplaintsByEmployee(employee_id),
    enabled: !!employee_id,
  });
};

export const useCreateEmployeeComplaint = () => {
  const queryClient = useQueryClient();
  
  return useMutation<CreateEmployeeComplaintResponse, Error, CreateEmployeeComplaintRequest>({
    mutationKey: [CREATE_EMPLOYEE_COMPLAINT],
    mutationFn: createEmployeeComplaint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_EMPLOYEE_COMPLAINTS] });
    },
  });
};

export const useUpdateEmployeeComplaint = () => {
  const queryClient = useQueryClient();
  
  return useMutation<UpdateEmployeeComplaintResponse, Error, UpdateEmployeeComplaintRequest & { id: number }>({
    mutationKey: [UPDATE_EMPLOYEE_COMPLAINT],
    mutationFn: updateEmployeeComplaint,
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_EMPLOYEE_COMPLAINTS] });
      queryClient.invalidateQueries({ queryKey: [GET_EMPLOYEE_COMPLAINT, variables.id] });
      queryClient.invalidateQueries({ queryKey: [GET_EMPLOYEE_COMPLAINTS_BY_EMPLOYEE, variables.id] });
    },
  });
};

export const useDeleteEmployeeComplaint = () => {
  const queryClient = useQueryClient();
  
  return useMutation<DeleteEmployeeComplaintResponse, Error, number>({
    mutationKey: [DELETE_EMPLOYEE_COMPLAINT],
    mutationFn: deleteEmployeeComplaint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_EMPLOYEE_COMPLAINTS] });
    },
  });
};