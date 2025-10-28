import { get } from "@/services/axios";
import { RecentActivitiesResponse } from "@/types/overview/recent";

export const getRecentActivities = async (
  type: string = "recent"
): Promise<RecentActivitiesResponse> => {
  const { data } = await get<RecentActivitiesResponse>(
    `/admin/dashboard/recent?type=${type}`
  );
  // @ts-expect-error axios response mismatch
  return data;
};
