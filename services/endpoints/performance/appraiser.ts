import {
  CreateAppraiserPayload,
  CreateAppraiserResponse,
  DeleteAppraiserResponse,
  GetAppraiserResponse,
  GetAppraisersResponse,
  UpdateAppraiserPayload,
  UpdateAppraiserResponse,
} from "@/types/performance/appraiser";

const APPRAISER_BASE_URL = "/api/admin/performance/appraiser";

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

export const getAppraisers = async (): Promise<GetAppraisersResponse> => {
  const response = await request<GetAppraisersResponse>(APPRAISER_BASE_URL);
  return response;
};

export const getAppraiserById = async (
  id: string | number
): Promise<GetAppraiserResponse> => {
  const response = await request<GetAppraiserResponse>(`${APPRAISER_BASE_URL}?id=${id}`);
  return response;
};

export const createAppraiser = async (
  payload: CreateAppraiserPayload
): Promise<CreateAppraiserResponse> => {
  const response = await request<CreateAppraiserResponse>(APPRAISER_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return response;
};

export const updateAppraiser = async (
  payload: UpdateAppraiserPayload
): Promise<UpdateAppraiserResponse> => {
  const response = await request<UpdateAppraiserResponse>(APPRAISER_BASE_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return response;
};

export const deleteAppraiser = async (
  id: string | number
): Promise<DeleteAppraiserResponse> => {
  const response = await request<DeleteAppraiserResponse>(`${APPRAISER_BASE_URL}?id=${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  return response;
};
