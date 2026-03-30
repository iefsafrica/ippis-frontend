export interface Task {
  id: number
  task_code: string
  name: string
  project_id: number
  assigned_to: string
  due_date: string
  status: string
  progress: number
  priority: string
  created_at: string
  updated_at: string
  project_name?: string
}

export interface TaskListResponse {
  success: boolean
  data: {
    tasks: Task[]
  }
}

export interface TaskResponse {
  success: boolean
  data: {
    tasks: Task[]
  }
}

export interface TaskCreateRequest {
  name: string
  project_id: number
  assigned_to: string
  due_date: string
  status?: string
  progress?: number
  priority?: string
}

export interface TaskUpdateRequest extends Partial<TaskCreateRequest> {
  id: number
}
