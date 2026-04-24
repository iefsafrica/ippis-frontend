import { get } from "@/services/axios"
import type { GetFileManagerDashboardResponse } from "@/types/file-manager/dashboard"

const FILE_MANAGER_DASHBOARD_ENDPOINT = "/file-manager/dashboard"

export const getFileManagerDashboard = async (): Promise<GetFileManagerDashboardResponse> => {
  return get<GetFileManagerDashboardResponse>(FILE_MANAGER_DASHBOARD_ENDPOINT)
}
