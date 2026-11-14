

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEmployeesList,
  getEmployeeById,
  updateEmployee,
  getEmployeeHistory,
  addEmployee,
  importEmployees,
  getRecentEmployees,
  registerEmployee,
  getEmployeeAnalytics,
} from "@/services/endpoints/employees/employees";
import { QUERY_KEYS } from "@/services/constants/employees";
import {
  Employee,
  EmployeesData,
  AddEmployeePayload,
  AddEmployeeResponse,
  ImportEmployeesPayload,
  ImportEmployeesResponse,
  RecentEmployeesData,
  EmployeeRegistrationPayload,
  EmployeeRegistrationResponse,
  UpdateEmployeePayload,
  UpdateEmployeeResponse,
  EmployeeHistoryData,
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

export const useEmployeeById = (id?: string | null, enabled: boolean = true) => {
  return useQuery<Employee, Error>({
    queryKey: [QUERY_KEYS.EMPLOYEE_DETAIL, id],
    queryFn: () => getEmployeeById(String(id)),
    enabled: Boolean(id) && enabled,
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateEmployeeResponse,
    Error,
    { id: string; payload: UpdateEmployeePayload }
  >({
    mutationFn: ({ id, payload }) => updateEmployee(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EMPLOYEES_LIST] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECENT_EMPLOYEES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EMPLOYEE_DETAIL, variables.id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EMPLOYEE_HISTORY, variables.id] });
    },
  });
};

export const useEmployeeHistory = (
  id?: string | null,
  page: number = 1,
  limit: number = 20,
  enabled: boolean = true
) => {
  return useQuery<EmployeeHistoryData, Error>({
    queryKey: [QUERY_KEYS.EMPLOYEE_HISTORY, id, page, limit],
    queryFn: () => getEmployeeHistory(String(id), page, limit),
    enabled: Boolean(id) && enabled,
  });
};
