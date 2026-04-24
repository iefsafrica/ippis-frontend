export interface FileManagerDashboardHighlight {
  total_files: number
  total_folders: number
  total_storage_used: number
}

export interface FileManagerRecentActivityItem {
  id: number
  file_id: string
  name: string
  folder_id: string | null
  file_url: string
  file_type: string
  file_size: string | number
  created_at: string
  updated_at: string
}

export interface FileManagerDashboardData {
  highlights: FileManagerDashboardHighlight
  recent_activity: FileManagerRecentActivityItem[]
}

export interface GetFileManagerDashboardResponse {
  success: boolean
  data: FileManagerDashboardData
  message?: string
}
