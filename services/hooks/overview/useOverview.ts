import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/services/endpoints/overview/overview";
import { DASHBOARD_STATS } from "@/services/constants/overview";
import { DashboardStats } from "@/types/overview/overview";

export const useDashboardStats = () => {
  return useQuery<DashboardStats, Error>({
    queryKey: [DASHBOARD_STATS],
    queryFn: getDashboardStats,
  });
};
