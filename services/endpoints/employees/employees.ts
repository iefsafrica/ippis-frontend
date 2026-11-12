

import { get, post } from "@/services/axios";
import {
  EmployeesResponse,
  EmployeesData,
  AddEmployeePayload,
  AddEmployeeResponse,
  ImportEmployeesPayload,
  ImportEmployeesResponse,
  RecentEmployeesResponse,
  RecentEmployeesData,
  EmployeeRegistrationPayload,
  EmployeeRegistrationResponse,
} from "@/types/employees/employee-management";
import {
  EmployeeAnalyticsData,
  EmployeeAnalyticsParams,
  EmployeeAnalyticsResponse,
} from "@/types/employees/analytics";

export const getEmployeesList = async (page: number = 1): Promise<EmployeesData> => {
  const { data } = await get<EmployeesResponse>(`/admin/employees?page=${page}&limit=100`);
  return data;
};

export const getEmployeeAnalytics = async (
  params?: EmployeeAnalyticsParams
): Promise<EmployeeAnalyticsData> => {
  const res = await get<EmployeeAnalyticsResponse | EmployeeAnalyticsData>(
    "/admin/employees/analytics",
    params
  );
  // Handle both { success: true, data: { ... } } and direct { ... } responses
  if (res && "data" in res && res.data && "kpis" in (res.data as any)) {
    return res.data;
  }
  return res as EmployeeAnalyticsData;
};

export const getRecentEmployees = async (): Promise<RecentEmployeesData> => {
  const { data } = await get<RecentEmployeesResponse>("/admin/employees/recent");
  return data;
};

export const registerEmployee = async (
  payload: EmployeeRegistrationPayload,
): Promise<EmployeeRegistrationResponse> => {
  const headers: Record<string, string> = {};
  const regId = payload.registration_id || payload.registrationId;
  if (regId) {
    headers["x-registration-id"] = String(regId);
  }
  const token =
    (payload as any).registration_token ||
    (payload as any).token ||
    (typeof window !== "undefined" ? localStorage.getItem("registration_token") : null);
  if (token) {
    headers["x-registration-token"] = token;
  }
  return post<EmployeeRegistrationResponse>("/admin/employees/register", payload, { headers });
};

export const addEmployee = async (payload: AddEmployeePayload): Promise<AddEmployeeResponse> => {
  return post<AddEmployeeResponse>("/admin/employees/add", payload);
};

export const importEmployees = async (payload: ImportEmployeesPayload): Promise<ImportEmployeesResponse> => {
  const formData = new FormData();
  formData.append("file", payload.file);

  return post<ImportEmployeesResponse>("/admin/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
