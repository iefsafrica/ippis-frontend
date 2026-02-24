import {
  CreateDesignationPayload,
  CreateDesignationResponse,
  DeleteDesignationResponse,
  GetDesignationByIdResponse,
  GetDesignationsResponse,
  UpdateDesignationPayload,
  UpdateDesignationResponse,
} from "@/types/organizations/designation/designation-management";

const DESIGNATION_BASE_URL = "/api/admin/organization/designation";

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

export const getDesignations = async (): Promise<GetDesignationsResponse> => {
  return request<GetDesignationsResponse>(DESIGNATION_BASE_URL);
};

export const getDesignationById = async (
  id: string | number
): Promise<GetDesignationByIdResponse> => {
  return request<GetDesignationByIdResponse>(`${DESIGNATION_BASE_URL}?id=${id}`);
};

export const createDesignation = async (
  payload: CreateDesignationPayload
): Promise<CreateDesignationResponse> => {
  return request<CreateDesignationResponse>(DESIGNATION_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

export const updateDesignation = async (
  payload: UpdateDesignationPayload
): Promise<UpdateDesignationResponse> => {
  return request<UpdateDesignationResponse>(DESIGNATION_BASE_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: String(payload.id),
      title: payload.title ?? payload.designation_name,
      designation_name: payload.designation_name ?? payload.title,
      description: payload.description,
      status: payload.status,
    }),
  });
};

export const deleteDesignation = async (
  id: string | number
): Promise<DeleteDesignationResponse> => {
  return request<DeleteDesignationResponse>(`${DESIGNATION_BASE_URL}?id=${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: String(id) }),
  });
};
