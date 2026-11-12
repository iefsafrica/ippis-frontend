import Cookies from "js-cookie";
import { get } from "@/services/axios";
import { RecentActivitiesResponse } from "@/types/overview/recent";

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

export const getRecentActivities = async (
  type: string = "recent"
): Promise<RecentActivitiesResponse> => {
  if (typeof window !== "undefined") {
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/admin/dashboard/recent?type=${encodeURIComponent(type)}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const json = await res.json();
        return json;
      }
    } catch {
      // Fall through to axios
    }
  }

  const { data } = await get<RecentActivitiesResponse>(
    `/admin/dashboard/recent?type=${type}`
  );
  // @ts-expect-error axios response mismatch
  return data;
};
