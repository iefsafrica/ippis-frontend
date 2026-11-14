import Cookies from "js-cookie";
import { get } from "@/services/axios";
import type {
  FileManagerAnalyticsData,
  FileManagerAnalyticsParams,
  FileManagerAnalyticsResponse,
} from "@/types/file-manager/analytics";

const PRIMARY_ANALYTICS_ENDPOINT = "/file-manager/analytics";

export const getFileManagerAnalytics = async (
  params?: FileManagerAnalyticsParams
): Promise<FileManagerAnalyticsData> => {
  // 1. First attempt Next.js route handler
  if (typeof window !== "undefined") {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          if (val != null) searchParams.append(key, String(val));
        });
      }
      const queryString = searchParams.toString();
      const url = `/api/file-manager/analytics${queryString ? `?${queryString}` : ""}`;

      const token =
        Cookies.get("token") ||
        Cookies.get("ippis_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("ippis_token") ||
        "";

      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const json = await res.json();
        const data = json?.data || json;
        if (data && (data.kpis || data.storage_by_mda || data.format_breakdown)) {
          return data as FileManagerAnalyticsData;
        }
      }
    } catch {
      // Fall through to axios get
    }
  }

  // 2. Direct backend fallback via Axios
  try {
    const res = await get<FileManagerAnalyticsResponse | FileManagerAnalyticsData>(
      PRIMARY_ANALYTICS_ENDPOINT,
      params
    );
    if (res && "data" in res && res.data && "kpis" in (res.data as any)) {
      return res.data;
    }
    if (res && "kpis" in (res as any)) {
      return res as FileManagerAnalyticsData;
    }
  } catch {
    // If backend direct call fails, rethrow or return empty baseline
  }

  throw new Error("Unable to load file manager analytics data");
};

