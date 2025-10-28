import { get } from "@/services/axios";
import { DashboardStatsResponse, DashboardStats } from "@/types/overview/overview";

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await get<DashboardStatsResponse>("/admin/dashboard/stats");
  return data; 
};
