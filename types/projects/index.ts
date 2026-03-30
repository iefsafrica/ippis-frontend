export interface Project {
  id: number
  project_code: string
  name: string
  client: string
  start_date: string
  end_date: string
  status: string
  progress: number
  priority: string
  budget: string
  manager_id: string
  created_at: string
  updated_at: string
}

export interface ProjectListResponse {
  success: boolean
  data: {
    projects: Project[]
  }
}

export interface ProjectResponse {
  success: boolean
  data: {
    projects: Project[]
  }
}

export interface ProjectCreateRequest {
  name: string
  client: string
  start_date: string
  end_date: string
  manager_id: string
  project_code?: string
  budget?: string
  priority?: string
  status?: string
  progress?: number
}

export interface ProjectUpdateRequest extends Partial<ProjectCreateRequest> {
  id: number
}
