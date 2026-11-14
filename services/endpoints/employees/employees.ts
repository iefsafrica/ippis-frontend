

import { get, post, patch } from "@/services/axios";
import Cookies from "js-cookie";
import {
  Employee,
  EmployeeResponse,
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
  UpdateEmployeePayload,
  UpdateEmployeeResponse,
  EmployeeHistoryData,
  EmployeeHistoryEntry,
  EmployeeHistoryResponse,
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
  // 1. First attempt Next.js API route (/api/admin/employees/analytics), which proxies backend and enriches
  if (typeof window !== "undefined") {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          if (val != null) searchParams.append(key, String(val));
        });
      }
      const queryString = searchParams.toString();
      const url = `/api/admin/employees/analytics${queryString ? `?${queryString}` : ""}`;

      const token =
        Cookies.get("token") ||
        Cookies.get("ippis_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("ippis_token") ||
        "";

      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const json = await res.json();
        const data = json?.data || json;
        if (data && (data.kpis || data.grade_distribution)) {
          return data as EmployeeAnalyticsData;
        }
      }
    } catch {
      // Fall through to direct axios get
    }
  }

  // 2. Direct backend fallback via Axios
  try {
    const res = await get<EmployeeAnalyticsResponse | EmployeeAnalyticsData>(
      "/admin/employees/analytics",
      params
    );
    if (res && "data" in res && res.data && "kpis" in (res.data as any)) {
      return res.data;
    }
    if (res && "kpis" in (res as any)) {
      return res as EmployeeAnalyticsData;
    }
  } catch {
    // If both failed, re-attempt client route
  }

  throw new Error("Unable to load employee analytics data");
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

export const getEmployeeById = async (id: string): Promise<Employee> => {
  const response = await get<EmployeeResponse | { data?: Employee; employee?: Employee }>(
    `/admin/employees/${encodeURIComponent(id)}`
  );
  if (response && "data" in response && response.data) {
    return response.data;
  }
  if (response && "employee" in response && response.employee) {
    return response.employee;
  }
  return response as unknown as Employee;
};

export const updateEmployee = async (
  id: string,
  payload: UpdateEmployeePayload
): Promise<UpdateEmployeeResponse> => {
  return patch<UpdateEmployeeResponse>(`/admin/employees/${encodeURIComponent(id)}`, payload);
};

export const getEmployeeHistory = async (
  id: string,
  page: number = 1,
  limit: number = 20
): Promise<EmployeeHistoryData> => {
  const response = await get<EmployeeHistoryResponse>(
    `/admin/employees/${encodeURIComponent(id)}/history`,
    { page, limit }
  );

  const rawData = response?.data;
  if (Array.isArray(rawData)) {
    return {
      history: rawData,
      pagination: {
        total: rawData.length,
        page,
        limit,
        totalPages: 1,
      },
    };
  }

  const historyList: EmployeeHistoryEntry[] =
    (rawData && "history" in rawData && Array.isArray(rawData.history) ? rawData.history : null) ??
    (rawData && "items" in rawData && Array.isArray(rawData.items) ? rawData.items : null) ??
    (rawData && "logs" in rawData && Array.isArray(rawData.logs) ? rawData.logs : null) ??
    [];

  const pagination =
    (rawData && "pagination" in rawData && rawData.pagination) || {
      total: historyList.length,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(historyList.length / limit)),
    };

  return {
    history: historyList,
    pagination,
  };
};
