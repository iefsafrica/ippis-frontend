import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CREATE_ROLE, GET_ROLE, GET_ROLES, ROLE_ACTION, UPDATE_ROLE } from "@/services/constants/roles"
import {
  createRole,
  getRole,
  getRoles,
  performRoleAction,
  updateRole,
} from "@/services/endpoints/roles/roles"
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

export const useGetRoles = () => {
  return useQuery<GetRolesResponse, Error>({
    queryKey: [GET_ROLES],
    queryFn: getRoles,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export const useGetRole = (id?: string | number) => {
  return useQuery<GetRoleResponse, Error>({
    queryKey: [GET_ROLE, id],
    queryFn: () => {
      if (id === undefined || id === null || `${id}`.trim() === "") {
        throw new Error("Role id is required")
      }
      return getRole(id)
    },
    enabled: id !== undefined && id !== null && `${id}`.trim().length > 0,
  })
}

export const useCreateRole = () => {
  const queryClient = useQueryClient()

  return useMutation<CreateRoleResponse, Error, CreateRoleRequest>({
    mutationKey: [CREATE_ROLE],
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_ROLES] })
    },
  })
}

export const useUpdateRole = () => {
  const queryClient = useQueryClient()

  return useMutation<UpdateRoleResponse, Error, UpdateRoleRequest>({
    mutationKey: [UPDATE_ROLE],
    mutationFn: updateRole,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_ROLES] })
      queryClient.invalidateQueries({ queryKey: [GET_ROLE, variables.id] })
    },
  })
}

export const useRoleAction = () => {
  const queryClient = useQueryClient()

  return useMutation<RoleActionResponse, Error, RoleActionRequest>({
    mutationKey: [ROLE_ACTION],
    mutationFn: performRoleAction,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_ROLES] })
      queryClient.invalidateQueries({ queryKey: [GET_ROLE, variables.role_id] })
    },
  })
}
