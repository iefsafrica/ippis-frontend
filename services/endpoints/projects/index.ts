import { get, post, put, del } from "@/services/axios"
import {
  ProjectCreateRequest,
  ProjectListResponse,
  ProjectResponse,
  ProjectUpdateRequest,
} from "@/types/projects"
import { PROJECT_ENDPOINTS } from "@/services/constants/projects"
import { ApprovalPayload, ApprovalResponse } from "@/types/approval"

export const getProjects = async (): Promise<ProjectListResponse> => {
  const response = await get<ProjectListResponse>(PROJECT_ENDPOINTS.BASE)
  return response
}

export const getProjectById = async (projectId: number): Promise<ProjectResponse> => {
  const response = await get<ProjectResponse>(`${PROJECT_ENDPOINTS.BASE}?id=${projectId}`)
  return response
}

export const createProject = async (
  payload: ProjectCreateRequest,
): Promise<ProjectResponse> => {
  const response = await post<ProjectResponse>(PROJECT_ENDPOINTS.CREATE, payload)
  return response
}

export const updateProject = async (
  payload: ProjectUpdateRequest,
): Promise<ProjectResponse> => {
  const response = await put<ProjectResponse>(`${PROJECT_ENDPOINTS.UPDATE}?id=${payload.id}`, payload)
  return response
}

export const deleteProject = async (projectId: number): Promise<{ success: boolean }> => {
  const response = await del<{ success: boolean }>(`${PROJECT_ENDPOINTS.DELETE}?id=${projectId}`)
  return response
}

export const approveProjects = async (
  payload: ApprovalPayload<string | number>,
): Promise<ApprovalResponse> => {
  return post<ApprovalResponse>(PROJECT_ENDPOINTS.APPROVE, payload)
}
