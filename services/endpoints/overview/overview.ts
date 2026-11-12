import Cookies from "js-cookie";
import { get } from "@/services/axios";
import { DashboardStatsResponse, DashboardStats } from "@/types/overview/overview";

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

export const getDashboardStats = async (): Promise<DashboardStats> => {
  // 1. Try local Next.js API route first (which aggregates live metrics)
  if (typeof window !== "undefined") {
    try {
      const token = getAuthToken();
      const res = await fetch("/api/admin/dashboard/stats", {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const json = await res.json();
        const data = json?.data || json;
        if (data && (data.totalEmployees !== undefined || data.activeEmployees !== undefined)) {
          return data;
        }
      }
    } catch {
      // Fall through to axios
    }
  }

  // 2. Direct backend fallback
  const response = await get<DashboardStatsResponse | DashboardStats>("/admin/dashboard/stats");
  if (response && "data" in response && response.data) {
    return response.data as DashboardStats;
  }
  return response as DashboardStats;
};
