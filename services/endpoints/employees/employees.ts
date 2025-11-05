import { get } from "@/services/axios";
import { EmployeesResponse, EmployeesData } from "@/types/employees/employee-management";

export const getEmployeesList = async (page: number = 1): Promise<EmployeesData> => {
  const { data } = await get<EmployeesResponse>(`/admin/employees?page=${page}&limit=100`);
  return data;
};