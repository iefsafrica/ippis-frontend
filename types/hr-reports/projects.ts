export interface HrReportProject {
  id: number
  project_title: string
  start_date: string
  end_date: string
  project_manager_id: string
  team_member_ids: string[]
  project_description: string
  project_status: string
  priority: string
  budget: string
  completion_percentage: number
  created_at: string
  updated_at: string
}

export interface HrReportProjectsResponse {
  success: boolean
  data: HrReportProject[]
}
