

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEmployeesList,
  addEmployee,
  importEmployees,
  getRecentEmployees,
  registerEmployee,
  getEmployeeAnalytics,
} from "@/services/endpoints/employees/employees";
import { QUERY_KEYS } from "@/services/constants/employees";
import {
  EmployeesData,
  AddEmployeePayload,
  AddEmployeeResponse,
  ImportEmployeesPayload,
  ImportEmployeesResponse,
  RecentEmployeesData,
  EmployeeRegistrationPayload,
  EmployeeRegistrationResponse,
} from "@/types/employees/employee-management";
import {
  EmployeeAnalyticsData,
  EmployeeAnalyticsParams,
} from "@/types/employees/analytics";

export const useEmployeesList = (page: number = 1) => {
  return useQuery<EmployeesData, Error>({
    queryKey: [QUERY_KEYS.EMPLOYEES_LIST, page],
    queryFn: () => getEmployeesList(page),
  });
};

export const useEmployeeAnalytics = (params?: EmployeeAnalyticsParams) => {
  return useQuery<EmployeeAnalyticsData, Error>({
    queryKey: [QUERY_KEYS.EMPLOYEE_ANALYTICS, params],
    queryFn: () => getEmployeeAnalytics(params),
  });
};

export const useRecentEmployees = () => {
  return useQuery<RecentEmployeesData, Error>({
    queryKey: [QUERY_KEYS.RECENT_EMPLOYEES],
    queryFn: () => getRecentEmployees(),
  });
};

export const useAddEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation<AddEmployeeResponse, Error, AddEmployeePayload>({
    mutationFn: addEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EMPLOYEES_LIST] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECENT_EMPLOYEES] });
    },
  });
};

export const useImportEmployees = () => {
  const queryClient = useQueryClient();

  return useMutation<ImportEmployeesResponse, Error, ImportEmployeesPayload>({
    mutationFn: importEmployees,
    onSuccess: () => {
      // Invalidate and refetch employees list to update the UI after import
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EMPLOYEES_LIST] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECENT_EMPLOYEES] });
    },
  });
};

export const useRegisterEmployee = () => {
  return useMutation<EmployeeRegistrationResponse, Error, EmployeeRegistrationPayload>({
    mutationFn: registerEmployee,
  });
};
