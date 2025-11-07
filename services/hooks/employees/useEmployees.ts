
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEmployeesList, addEmployee } from "@/services/endpoints/employees/employees";
import { QUERY_KEYS } from "@/services/constants/employees";
import { EmployeesData, AddEmployeePayload, AddEmployeeResponse } from "@/types/employees/employee-management";

export const useEmployeesList = (page: number = 1) => {
  return useQuery<EmployeesData, Error>({
    queryKey: [QUERY_KEYS.EMPLOYEES_LIST, page],
    queryFn: () => getEmployeesList(page),
  });
};

export const useAddEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation<AddEmployeeResponse, Error, AddEmployeePayload>({
    mutationFn: addEmployee,
    onSuccess: () => {
      // Invalidate and refetch employees list to update the UI
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EMPLOYEES_LIST] });
    },
  });
};