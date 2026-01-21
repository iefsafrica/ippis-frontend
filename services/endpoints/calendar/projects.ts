import { 
  get, 
  post, 
  put, 
  del 
} from "@/services/axios";
import { 
  GetProjectsResponse,
  GetProjectResponse,
  CreateProjectRequest, 
  CreateProjectResponse,
  UpdateProjectRequest,
  UpdateProjectResponse,
  DeleteProjectResponse,
  ProjectQueryParams
} from "@/types/calendar/projects";

export const getProjects = async (params?: ProjectQueryParams): Promise<GetProjectsResponse> => {
  const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  const response = await get<GetProjectsResponse>(`/admin/hr/projects${queryString}`);
  return response;
};

export const getProject = async (params: ProjectQueryParams): Promise<GetProjectResponse> => {
  const queryString = `?${new URLSearchParams(params as Record<string, string>).toString()}`;
  const response = await get<GetProjectResponse>(`/admin/hr/projects${queryString}`);
  return response;
};

export const createProject = async (payload: CreateProjectRequest): Promise<CreateProjectResponse> => {
  const response = await post<CreateProjectResponse>("/admin/hr/projects", payload);
  return response;
};

export const updateProject = async (payload: UpdateProjectRequest): Promise<UpdateProjectResponse> => {
  const response = await put<UpdateProjectResponse>("/admin/hr/projects", payload);
  return response;
};

export const deleteProject = async (id: number): Promise<DeleteProjectResponse> => {
  const response = await del<DeleteProjectResponse>(`/admin/hr/projects?id=${id}`);
  return response;
};
