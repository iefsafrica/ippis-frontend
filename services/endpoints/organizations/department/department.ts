import {
  CreateDepartmentPayload,
  CreateDepartmentResponse,
  DeleteDepartmentResponse,
  GetDepartmentByIdResponse,
  GetDepartmentsResponse,
  UpdateDepartmentPayload,
  UpdateDepartmentResponse,
} from "@/types/organizations/department/department-management";

const DEPARTMENT_BASE_URL = "/api/admin/organization/department";

const getAuthHeaders = () => {
  const headers: Record<string, string> = {};
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const headers = new Headers(init?.headers);
  const authHeaders = getAuthHeaders();

  if (authHeaders.Authorization) {
    headers.set("Authorization", authHeaders.Authorization);
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Request failed");
  }

  return data as T;
};

export const getDepartments = async (): Promise<GetDepartmentsResponse> => {
  return request<GetDepartmentsResponse>(DEPARTMENT_BASE_URL);
};

export const getDepartmentById = async (
  id: string | number
): Promise<GetDepartmentByIdResponse> => {
  return request<GetDepartmentByIdResponse>(`${DEPARTMENT_BASE_URL}?id=${id}`);
};

export const createDepartment = async (
  payload: CreateDepartmentPayload
): Promise<CreateDepartmentResponse> => {
  return request<CreateDepartmentResponse>(DEPARTMENT_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

export const updateDepartment = async (
  payload: UpdateDepartmentPayload
): Promise<UpdateDepartmentResponse> => {
  return request<UpdateDepartmentResponse>(DEPARTMENT_BASE_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: String(payload.id),
      name: payload.name,
      status: payload.status,
    }),
  });
};

export const deleteDepartment = async (
  id: string | number
): Promise<DeleteDepartmentResponse> => {
  return request<DeleteDepartmentResponse>(`${DEPARTMENT_BASE_URL}?id=${id}`, {
    method: "DELETE",
  });
};

