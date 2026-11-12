import Cookies from "js-cookie";
import { get, post, put, del } from "@/services/axios";
import {
  LeavesData,
  LeavesListResponse,
  LeaveSingleResponse,
  CreateLeavePayload,
  CreateLeaveResponse,
  UpdateLeavePayload,
  UpdateLeaveResponse,
  DeleteLeaveResponse,
} from "@/types/timesheets/leaves";

const getAuthToken = () => {
  if (typeof window === "undefined") return "";
  return (
    Cookies.get("token") ||
    Cookies.get("ippis_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("ippis_token") ||
    ""
  );
};

export const getLeaves = async (): Promise<LeavesData> => {
  if (typeof window !== "undefined") {
    try {
      const token = getAuthToken();
      const res = await fetch("/api/timesheets/attendance/leaves", {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const json = await res.json();
        const data = json?.data ?? json;
        if (Array.isArray(data)) {
          return data;
        }
      }
    } catch {
      // Fall through to axios
    }
  }

  try {
    const response = await get<LeavesListResponse>("/timesheets/attendance/leaves");
    return response.data || [];
  } catch {
    return [];
  }
};

export const getLeaveById = async (id: number): Promise<LeaveSingleResponse["data"]> => {
  const response = await get<LeaveSingleResponse>("/timesheets/attendance/leaves", { id });
  return response.data;
};

export const createLeave = async (payload: CreateLeavePayload): Promise<CreateLeaveResponse> => {
  if (typeof window !== "undefined") {
    try {
      const token = getAuthToken();
      const res = await fetch("/api/timesheets/attendance/leaves", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fall through
    }
  }
  return post<CreateLeaveResponse>("/timesheets/attendance/leaves", payload);
};

export const updateLeave = async (payload: UpdateLeavePayload): Promise<UpdateLeaveResponse> => {
  if (typeof window !== "undefined") {
    try {
      const token = getAuthToken();
      const res = await fetch("/api/timesheets/attendance/leaves", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fall through
    }
  }
  return put<UpdateLeaveResponse>("/timesheets/attendance/leaves", payload);
};

export const reviewLeaveStatus = async (
  id: number | string,
  status: "approved" | "rejected",
  remarks?: string
): Promise<UpdateLeaveResponse> => {
  const payload = {
    id: Number(id),
    status,
    ...(remarks ? { remarks } : {}),
  };
  return updateLeave(payload);
};

export const deleteLeave = async (id: number): Promise<DeleteLeaveResponse> => {
  if (typeof window !== "undefined") {
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/timesheets/attendance/leaves?id=${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fall through
    }
  }
  return del<DeleteLeaveResponse>("/timesheets/attendance/leaves", { id });
};
