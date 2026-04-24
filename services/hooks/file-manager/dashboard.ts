import { useQuery } from "@tanstack/react-query"

import { GET_FILE_MANAGER_DASHBOARD } from "@/services/constants/file-manager"
import { getFileManagerDashboard } from "@/services/endpoints/file-manager/dashboard"
import type { GetFileManagerDashboardResponse } from "@/types/file-manager/dashboard"

export const useGetFileManagerDashboard = () => {
  return useQuery<GetFileManagerDashboardResponse>({
    queryKey: [GET_FILE_MANAGER_DASHBOARD],
    queryFn: getFileManagerDashboard,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}
