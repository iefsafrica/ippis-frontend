export interface Project {
  id: number;
  project_title: string;
  start_date: string;
  end_date: string;
  project_manager_id: string;
  team_member_ids: string[];
  project_description: string;
  project_status: string;
  priority: string;
  budget: string;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface GetProjectsResponse {
  success: boolean;
  data: Project[];
}

export interface GetProjectResponse {
  success: boolean;
  data: Project[];
}

export interface CreateProjectRequest {
  project_title: string;
  start_date: string;
  end_date: string;
  project_manager_id: string;
  team_member_ids: string[];
  project_description: string;
  project_status: string;
  priority: string;
  budget: number;
  completion_percentage: number;
}

export interface CreateProjectResponse {
  success: boolean;
  message: string;
  data: Project;
}

export interface UpdateProjectRequest {
  id: number;
  project_title?: string;
  start_date?: string;
  end_date?: string;
  project_manager_id?: string;
  team_member_ids?: string[];
  project_description?: string;
  project_status?: string;
  priority?: string;
  budget?: number;
  completion_percentage?: number;
}

export interface UpdateProjectResponse {
  success: boolean;
  message: string;
}

export interface DeleteProjectResponse {
  success: boolean;
  message: string;
}

export interface ProjectQueryParams {
  id?: number;
  manager_id?: string;
  team_member_id?: string;
}
