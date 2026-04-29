import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CREATE_PERMISSION,
  DELETE_PERMISSION,
  GET_PERMISSION,
  GET_PERMISSIONS,
  UPDATE_PERMISSION,
} from "@/services/constants/permissions"
import {
  createPermission,
  deletePermission,
  getPermission,
  getPermissions,
  updatePermission,
} from "@/services/endpoints/permissions/permissions"
import type {
  CreatePermissionRequest,
  CreatePermissionResponse,
  DeletePermissionResponse,
  GetPermissionResponse,
  GetPermissionsResponse,
  UpdatePermissionRequest,
  UpdatePermissionResponse,
} from "@/types/permissions"

export const useGetPermissions = () => {
  return useQuery<GetPermissionsResponse, Error>({
    queryKey: [GET_PERMISSIONS],
    queryFn: getPermissions,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export const useGetPermission = (id?: string | number) => {
  return useQuery<GetPermissionResponse, Error>({
    queryKey: [GET_PERMISSION, id],
    queryFn: () => {
      if (id === undefined || id === null || `${id}`.trim() === "") {
        throw new Error("Permission id is required")
      }
      return getPermission(id)
    },
    enabled: id !== undefined && id !== null && `${id}`.trim().length > 0,
  })
}

export const useCreatePermission = () => {
  const queryClient = useQueryClient()

  return useMutation<CreatePermissionResponse, Error, CreatePermissionRequest>({
    mutationKey: [CREATE_PERMISSION],
    mutationFn: createPermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_PERMISSIONS] })
    },
  })
}

export const useUpdatePermission = () => {
  const queryClient = useQueryClient()

  return useMutation<UpdatePermissionResponse, Error, UpdatePermissionRequest>({
    mutationKey: [UPDATE_PERMISSION],
    mutationFn: updatePermission,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_PERMISSIONS] })
      queryClient.invalidateQueries({ queryKey: [GET_PERMISSION, variables.id] })
    },
  })
}

export const useDeletePermission = () => {
  const queryClient = useQueryClient()

  return useMutation<DeletePermissionResponse, Error, string | number>({
    mutationKey: [DELETE_PERMISSION],
    mutationFn: deletePermission,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [GET_PERMISSIONS] })
      queryClient.invalidateQueries({ queryKey: [GET_PERMISSION, id] })
    },
  })
}
