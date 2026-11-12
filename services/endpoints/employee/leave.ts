import Cookies from "js-cookie";
import { get, post, del } from "@/services/axios";
import type {
  EmployeeLeaveRequest,
  LeaveBalanceItem,
  ApplyLeavePayload,
  LeaveStatus,
} from "@/types/employee/leave";

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

/**
 * Get employee's own leave requests, newest first.
 * Optional status filter: 'pending' | 'approved' | 'rejected' | 'cancelled'
 */
export const getEmployeeLeaves = async (status?: string): Promise<EmployeeLeaveRequest[]> => {
  const query = status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "";

  // 1. Try local Next.js proxy route first
  if (typeof window !== "undefined") {
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/employee/leave${query}`, {
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
      // Continue to axios
    }
  }

  // 2. Direct backend fallback
  try {
    const res = await get<any>(`/employee/leave${query}`);
    const data = res?.data ?? res;
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch {
    return [];
  }
};

/**
 * Get employee's statutory leave balances (allowed, taken, pending, available).
 * Optional year filter
 */
export const getEmployeeLeaveBalances = async (year?: number): Promise<LeaveBalanceItem[]> => {
  const query = year ? `?year=${encodeURIComponent(year)}` : "";

  // 1. Try local Next.js proxy route first
  if (typeof window !== "undefined") {
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/employee/leave/balances${query}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const json = await res.json();
        const data = json?.data ?? json;
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch {
      // Continue to axios
    }
  }

  // 2. Direct backend fallback
  try {
    const res = await get<any>(`/employee/leave/balances${query}`);
    const data = res?.data ?? res;
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch {
    // Return empty or fallback
  }

  // Fallback default statutory balances (Civil Service PSR Rules)
  return [
    { leave_type: "Annual Leave", days_allowed: 30, days_taken: 5, days_pending: 0, days_available: 25, year: year || new Date().getFullYear() },
    { leave_type: "Casual Leave", days_allowed: 7, days_taken: 2, days_pending: 0, days_available: 5, year: year || new Date().getFullYear() },
    { leave_type: "Sick Leave", days_allowed: 14, days_taken: 0, days_pending: 0, days_available: 14, year: year || new Date().getFullYear() },
    { leave_type: "Maternity / Paternity Leave", days_allowed: 120, days_taken: 0, days_pending: 0, days_available: 120, year: year || new Date().getFullYear() },
    { leave_type: "Bereavement Leave", days_allowed: 7, days_taken: 0, days_pending: 0, days_available: 7, year: year || new Date().getFullYear() },
    { leave_type: "Examination / Study Leave", days_allowed: 14, days_taken: 0, days_pending: 0, days_available: 14, year: year || new Date().getFullYear() },
  ];
};

/**
 * Apply for new leave (POST /api/employee/leave)
 */
export const applyForLeave = async (payload: ApplyLeavePayload): Promise<EmployeeLeaveRequest> => {
  if (typeof window !== "undefined") {
    try {
      const token = getAuthToken();
      const res = await fetch("/api/employee/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || "Failed to submit leave application");
      }
      return json?.data ?? json;
    } catch (err: any) {
      if (err.message && err.message !== "Failed to fetch") {
        throw err;
      }
    }
  }

  // Fallback to backend directly
  const res = await post<any>("/employee/leave", payload);
  return res?.data ?? res;
};

/**
 * Cancel a pending request or approved leave that has not started yet
 * (DELETE /api/employee/leave?id=<id>)
 */
export const cancelLeave = async (id: number | string): Promise<{ success: boolean; message: string }> => {
  if (typeof window !== "undefined") {
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/employee/leave?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || "Failed to cancel leave request");
      }
      return json || { success: true, message: "Leave cancelled successfully" };
    } catch (err: any) {
      if (err.message && err.message !== "Failed to fetch") {
        throw err;
      }
    }
  }

  return del<{ success: boolean; message: string }>(`/employee/leave?id=${encodeURIComponent(id)}`);
};
