import { useQuery } from "@tanstack/react-query";
import { getRecentActivities } from "@/services/endpoints/recent";
import { DASHBOARD_RECENT } from "@/services/constants/overview";
import { RecentActivitiesResponse } from "@/types/overview/recent";

export const useRecentActivities = (type: string = "recent") => {
  return useQuery<RecentActivitiesResponse, Error>({
    queryKey: [DASHBOARD_RECENT, type],
    queryFn: () => getRecentActivities(type),
  });
};
