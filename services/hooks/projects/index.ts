import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  approveProjects,
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject,
} from "@/services/endpoints/projects"
import { PROJECT_QUERY_KEYS } from "@/services/constants/projects"
import {
  ProjectCreateRequest,
  ProjectResponse,
  ProjectUpdateRequest,
} from "@/types/projects"
import { ApprovalPayload, ApprovalResponse } from "@/types/approval"

export const useGetProjects = () => {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.list(),
    queryFn: getProjects,
    staleTime: 1000 * 60 * 5,
  })
}

export const useGetProject = (projectId?: number) => {
  return useQuery({
    queryKey: projectId ? PROJECT_QUERY_KEYS.detail(projectId) : PROJECT_QUERY_KEYS.detail("draft"),
    queryFn: () => getProjectById(projectId ?? 0),
    enabled: !!projectId,
  })
}

export const useCreateProject = () => {
  const queryClient = useQueryClient()
  return useMutation<ProjectResponse, Error, ProjectCreateRequest>({
    mutationKey: PROJECT_QUERY_KEYS.create(),
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.list() })
    },
  })
}

export const useUpdateProject = () => {
  const queryClient = useQueryClient()
  return useMutation<ProjectResponse, Error, ProjectUpdateRequest>({
    mutationKey: PROJECT_QUERY_KEYS.update(),
    mutationFn: updateProject,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.list() })
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.detail(variables.id) })
    },
  })
}

export const useDeleteProject = () => {
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean }, Error, number>({
    mutationKey: PROJECT_QUERY_KEYS.remove(),
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.list() })
    },
  })
}

export const useApproveProjects = () => {
  return useMutation<ApprovalResponse, Error, ApprovalPayload<string | number>>({
    mutationKey: [...PROJECT_QUERY_KEYS.base, "approve"],
    mutationFn: approveProjects,
  })
}
