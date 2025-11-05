import { useQuery } from "@tanstack/react-query";
import { getEmployeesList } from "@/services/endpoints/employees/employees";
import { QUERY_KEYS } from "@/services/constants/employees";
import { EmployeesData } from "@/types/employees/employee-management";

export const useEmployeesList = (page: number = 1) => {
  return useQuery<EmployeesData, Error>({
    queryKey: [QUERY_KEYS.EMPLOYEES_LIST, page],
    queryFn: () => getEmployeesList(page),
  });
};