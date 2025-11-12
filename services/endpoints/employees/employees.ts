// import { get, post } from "@/services/axios";
// import { 
//   EmployeesResponse, 
//   EmployeesData,
//   AddEmployeePayload,
//   AddEmployeeResponse
// } from "@/types/employees/employee-management";

// export const getEmployeesList = async (page: number = 1): Promise<EmployeesData> => {
//   const { data } = await get<EmployeesResponse>(`/admin/employees?page=${page}&limit=100`);
//   return data;
// };

// export const addEmployee = async (payload: AddEmployeePayload): Promise<AddEmployeeResponse> => {
//   const { data } = await post<AddEmployeeResponse>("/admin/employees/add", payload);
//   //@ts-ignore
//   return data;
// };



import { get, post } from "@/services/axios";
import { 
  EmployeesResponse, 
  EmployeesData,
  AddEmployeePayload,
  AddEmployeeResponse,
  ImportEmployeesPayload,
  ImportEmployeesResponse
} from "@/types/employees/employee-management";

export const getEmployeesList = async (page: number = 1): Promise<EmployeesData> => {
  const { data } = await get<EmployeesResponse>(`/admin/employees?page=${page}&limit=100`);
  return data;
};

export const addEmployee = async (payload: AddEmployeePayload): Promise<AddEmployeeResponse> => {
  const { data } = await post<AddEmployeeResponse>("/admin/employees/add", payload);
  //@ts-ignore
  return data;
};

export const importEmployees = async (payload: ImportEmployeesPayload): Promise<ImportEmployeesResponse> => {
  const formData = new FormData();
  formData.append('file', payload.file);

  const { data } = await post<ImportEmployeesResponse>("/admin/import", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
    //@ts-ignore
  return data;
};