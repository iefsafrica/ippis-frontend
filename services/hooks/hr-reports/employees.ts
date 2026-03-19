import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getEmployeesList,
  addEmployee,
  importEmployees,
  registerEmployee,
} from "@/services/endpoints/hr-reports/employees"
import { HR_REPORTS_EMPLOYEES_QUERY_KEYS } from "@/services/constants/hr-reports/employees"
import type {
  HrReportEmployeesData,
} from "@/types/hr-reports/employees"
import type {
  AddEmployeePayload,
  AddEmployeeResponse,
  ImportEmployeesPayload,
  ImportEmployeesResponse,
  EmployeeRegistrationPayload,
  EmployeeRegistrationResponse,
} from "@/types/employees/employee-management"

export const useHrEmployeesList = (page: number = 1) => {
  return useQuery<HrReportEmployeesData, Error>({
    queryKey: [HR_REPORTS_EMPLOYEES_QUERY_KEYS.LIST, page],
    queryFn: () => getEmployeesList(page),
  })
}

export const useHrAddEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation<AddEmployeeResponse, Error, AddEmployeePayload>({
    mutationFn: addEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HR_REPORTS_EMPLOYEES_QUERY_KEYS.LIST] })
    },
  })
}

export const useHrImportEmployees = () => {
  const queryClient = useQueryClient()

  return useMutation<ImportEmployeesResponse, Error, ImportEmployeesPayload>({
    mutationFn: importEmployees,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HR_REPORTS_EMPLOYEES_QUERY_KEYS.LIST] })
    },
  })
}

export const useHrRegisterEmployee = () => {
  return useMutation<EmployeeRegistrationResponse, Error, EmployeeRegistrationPayload>({
    mutationFn: registerEmployee,
  })
}
