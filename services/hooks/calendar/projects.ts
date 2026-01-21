import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getProjects, 
  getProject, 
  createProject, 
  updateProject, 
  deleteProject 
} from "@/services/endpoints/calendar/projects";
import { 
  CREATE_PROJECT, 
  GET_PROJECTS, 
  GET_PROJECT, 
  UPDATE_PROJECT, 
  DELETE_PROJECT 
} from "@/services/constants/calendar/projects";
import { 
  CreateProjectRequest, 
  CreateProjectResponse,
  UpdateProjectRequest,
  UpdateProjectResponse,
  DeleteProjectResponse,
  ProjectQueryParams
} from "@/types/calendar/projects";

export const useGetProjects = (params?: ProjectQueryParams) => {
  return useQuery({
    queryKey: [GET_PROJECTS, params],
    queryFn: () => getProjects(params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

export const useGetProject = (params: ProjectQueryParams) => {
  return useQuery({
    queryKey: [GET_PROJECT, params],
    queryFn: () => getProject(params),
    enabled: !!(params.id || params.manager_id || params.team_member_id),
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation<CreateProjectResponse, Error, CreateProjectRequest>({
    mutationKey: [CREATE_PROJECT],
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_PROJECTS] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation<UpdateProjectResponse, Error, UpdateProjectRequest>({
    mutationKey: [UPDATE_PROJECT],
    mutationFn: updateProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_PROJECTS] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation<DeleteProjectResponse, Error, number>({
    mutationKey: [DELETE_PROJECT],
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_PROJECTS] });
    },
  });
};
