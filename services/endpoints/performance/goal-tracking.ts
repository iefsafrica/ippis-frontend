import {
  CreateGoalTrackingPayload,
  CreateGoalTrackingResponse,
  DeleteGoalTrackingResponse,
  GetGoalTrackingResponse,
  GetGoalTrackingsResponse,
  UpdateGoalTrackingPayload,
  UpdateGoalTrackingResponse,
} from "@/types/performance/goal-tracking";

const GOAL_TRACKING_BASE_URL = "/api/admin/performance/goal-tracking";

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

export const getGoalTrackings = async (): Promise<GetGoalTrackingsResponse> => {
  const response = await request<GetGoalTrackingsResponse>(GOAL_TRACKING_BASE_URL);
  return response;
};

export const getGoalTrackingById = async (
  id: string | number
): Promise<GetGoalTrackingResponse> => {
  const response = await request<GetGoalTrackingResponse>(`${GOAL_TRACKING_BASE_URL}?id=${id}`);
  return response;
};

export const createGoalTracking = async (
  payload: CreateGoalTrackingPayload
): Promise<CreateGoalTrackingResponse> => {
  const response = await request<CreateGoalTrackingResponse>(GOAL_TRACKING_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return response;
};

export const updateGoalTracking = async (
  payload: UpdateGoalTrackingPayload
): Promise<UpdateGoalTrackingResponse> => {
  const response = await request<UpdateGoalTrackingResponse>(GOAL_TRACKING_BASE_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return response;
};

export const deleteGoalTracking = async (
  id: string | number
): Promise<DeleteGoalTrackingResponse> => {
  const response = await request<DeleteGoalTrackingResponse>(GOAL_TRACKING_BASE_URL, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  return response;
};
