import type {
  Employee,
  EmployeesData,
} from "@/types/employees/employee-management"

export type HrReportEmployee = Employee

export type HrReportEmployeesData = EmployeesData

export interface HrReportEmployeesResponse {
  success: boolean
  data: {
    employees: HrReportEmployee[]
    pagination: EmployeesData["pagination"]
  }
}
