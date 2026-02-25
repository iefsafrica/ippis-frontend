import {
  CreateAnnouncementPayload,
  CreateAnnouncementResponse,
  DeleteAnnouncementResponse,
  GetAnnouncementResponse,
  GetAnnouncementsResponse,
  PublishAnnouncementPayload,
  PublishAnnouncementResponse,
  UpdateAnnouncementPayload,
  UpdateAnnouncementResponse,
} from "@/types/organizations/announcement/announcement-management";

const ANNOUNCEMENT_BASE_URL = "/api/admin/organization/announcement";

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

export const getAnnouncements = async (): Promise<GetAnnouncementsResponse> => {
  const response = await request<GetAnnouncementsResponse>(ANNOUNCEMENT_BASE_URL);
  return response;
};

export const getAnnouncementById = async (
  id: string | number
): Promise<GetAnnouncementResponse> => {
  const response = await request<GetAnnouncementResponse>(
    `${ANNOUNCEMENT_BASE_URL}?id=${id}`
  );
  return response;
};

export const createAnnouncement = async (
  payload: CreateAnnouncementPayload
): Promise<CreateAnnouncementResponse> => {
  const response = await request<CreateAnnouncementResponse>(ANNOUNCEMENT_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return response;
};

export const updateAnnouncement = async (
  payload: UpdateAnnouncementPayload
): Promise<UpdateAnnouncementResponse> => {
  const response = await request<UpdateAnnouncementResponse>(ANNOUNCEMENT_BASE_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return response;
};

export const publishAnnouncement = async (
  payload: PublishAnnouncementPayload
): Promise<PublishAnnouncementResponse> => {
  const response = await request<PublishAnnouncementResponse>(ANNOUNCEMENT_BASE_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return response;
};

export const deleteAnnouncement = async (
  id: string | number
): Promise<DeleteAnnouncementResponse> => {
  const response = await request<DeleteAnnouncementResponse>(
    `${ANNOUNCEMENT_BASE_URL}?id=${id}`,
    {
      method: "DELETE",
    }
  );
  return response;
};
