import {
  CreateIndicatorPayload,
  CreateIndicatorResponse,
  DeleteIndicatorResponse,
  GetIndicatorResponse,
  GetIndicatorsResponse,
  UpdateIndicatorPayload,
  UpdateIndicatorResponse,
} from "@/types/performance/indicator";

const INDICATOR_BASE_URL = "/api/admin/performance/indicator";

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

export const getIndicators = async (): Promise<GetIndicatorsResponse> => {
  const response = await request<GetIndicatorsResponse>(INDICATOR_BASE_URL);
  return response;
};

export const getIndicatorById = async (id: string | number): Promise<GetIndicatorResponse> => {
  const response = await request<GetIndicatorResponse>(`${INDICATOR_BASE_URL}?id=${id}`);
  return response;
};

export const createIndicator = async (
  payload: CreateIndicatorPayload
): Promise<CreateIndicatorResponse> => {
  const response = await request<CreateIndicatorResponse>(INDICATOR_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return response;
};

export const updateIndicator = async (
  payload: UpdateIndicatorPayload
): Promise<UpdateIndicatorResponse> => {
  const response = await request<UpdateIndicatorResponse>(INDICATOR_BASE_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return response;
};

export const deleteIndicator = async (id: string | number): Promise<DeleteIndicatorResponse> => {
  const response = await request<DeleteIndicatorResponse>(INDICATOR_BASE_URL, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  return response;
};
