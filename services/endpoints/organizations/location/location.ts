import {
  CreateLocationPayload,
  CreateLocationResponse,
  DeleteLocationResponse,
  GetLocationByIdResponse,
  GetLocationsResponse,
  UpdateLocationPayload,
  UpdateLocationResponse,
} from "@/types/organizations/location/location-management";

const LOCATION_BASE_URL = "/api/admin/organization/location";

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

export const getLocations = async (): Promise<GetLocationsResponse> => {
  return request<GetLocationsResponse>(LOCATION_BASE_URL);
};

export const getLocationById = async (
  id: string | number
): Promise<GetLocationByIdResponse> => {
  return request<GetLocationByIdResponse>(`${LOCATION_BASE_URL}?id=${id}`);
};

export const createLocation = async (
  payload: CreateLocationPayload
): Promise<CreateLocationResponse> => {
  return request<CreateLocationResponse>(LOCATION_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

export const updateLocation = async (
  payload: UpdateLocationPayload
): Promise<UpdateLocationResponse> => {
  return request<UpdateLocationResponse>(LOCATION_BASE_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: String(payload.id),
      name: payload.name,
      company_code: payload.company_code,
      address: payload.address,
      city: payload.city,
      state: payload.state,
      country: payload.country,
      status: payload.status,
    }),
  });
};

export const deleteLocation = async (
  id: string | number
): Promise<DeleteLocationResponse> => {
  return request<DeleteLocationResponse>(`${LOCATION_BASE_URL}?id=${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: String(id) }),
  });
};
