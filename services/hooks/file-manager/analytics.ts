import { useQuery } from "@tanstack/react-query";
import { GET_FILE_MANAGER_ANALYTICS } from "@/services/constants/file-manager";
import { getFileManagerAnalytics } from "@/services/endpoints/file-manager/analytics";
import type {
  FileManagerAnalyticsData,
  FileManagerAnalyticsParams,
} from "@/types/file-manager/analytics";

export const useFileManagerAnalytics = (params?: FileManagerAnalyticsParams) => {
  return useQuery<FileManagerAnalyticsData, Error>({
    queryKey: [GET_FILE_MANAGER_ANALYTICS, params],
    queryFn: () => getFileManagerAnalytics(params),
  });
};

