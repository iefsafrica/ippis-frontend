import { get, patch, post } from "@/services/axios"
import type {
  CreateRoleRequest,
  CreateRoleResponse,
  GetRoleResponse,
  GetRolesResponse,
  RoleActionRequest,
  RoleActionResponse,
  UpdateRoleRequest,
  UpdateRoleResponse,
} from "@/types/roles"

const ROLES_ENDPOINT = "/roles"

export const getRoles = async (): Promise<GetRolesResponse> => {
  return get<GetRolesResponse>(ROLES_ENDPOINT)
}

export const getRole = async (id: string | number): Promise<GetRoleResponse> => {
  return get<GetRoleResponse>(ROLES_ENDPOINT, { id })
}

export const createRole = async (payload: CreateRoleRequest): Promise<CreateRoleResponse> => {
  return post<CreateRoleResponse>(ROLES_ENDPOINT, payload)
}

export const updateRole = async (payload: UpdateRoleRequest): Promise<UpdateRoleResponse> => {
  const { id, ...body } = payload
  return patch<UpdateRoleResponse>(ROLES_ENDPOINT, { id, ...body })
}

export const performRoleAction = async (payload: RoleActionRequest): Promise<RoleActionResponse> => {
  return post<RoleActionResponse>(ROLES_ENDPOINT, payload)
}
