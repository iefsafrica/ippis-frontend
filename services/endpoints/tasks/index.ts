import { get, post, put, del } from "@/services/axios"
import {
  TaskCreateRequest,
  TaskListResponse,
  TaskResponse,
  TaskUpdateRequest,
} from "@/types/tasks"
import { TASK_ENDPOINTS } from "@/services/constants/tasks"

export const getTasks = async (): Promise<TaskListResponse> => {
  const response = await get<TaskListResponse>(TASK_ENDPOINTS.BASE)
  return response
}

export const getTaskById = async (taskId: number): Promise<TaskResponse> => {
  const response = await get<TaskResponse>(`${TASK_ENDPOINTS.BASE}?id=${taskId}`)
  return response
}

export const createTask = async (payload: TaskCreateRequest): Promise<TaskResponse> => {
  const response = await post<TaskResponse>(TASK_ENDPOINTS.CREATE, payload)
  return response
}

export const updateTask = async (payload: TaskUpdateRequest): Promise<TaskResponse> => {
  const response = await put<TaskResponse>(`${TASK_ENDPOINTS.UPDATE}?id=${payload.id}`, payload)
  return response
}

export const deleteTask = async (taskId: number): Promise<{ success: boolean }> => {
  const response = await del<{ success: boolean }>(`${TASK_ENDPOINTS.DELETE}?id=${taskId}`)
  return response
}
