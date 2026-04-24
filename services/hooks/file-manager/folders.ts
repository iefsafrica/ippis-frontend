import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  CREATE_FOLDER,
  DELETE_FOLDER,
  GET_FILE_MANAGER_DASHBOARD,
  GET_FOLDER,
  GET_FOLDERS,
  UPDATE_FOLDER,
} from "@/services/constants/file-manager"
import {
  createFolder,
  deleteFolder,
  getFolder,
  getFolders,
  updateFolder,
} from "@/services/endpoints/file-manager/folders"
import type {
  CreateFolderRequest,
  CreateFolderResponse,
  DeleteFolderResponse,
  GetFolderResponse,
  GetFoldersResponse,
  UpdateFolderRequest,
  UpdateFolderResponse,
} from "@/types/file-manager/folders"

export const useGetFolders = (params?: { folder_id?: string; parent_id?: string | null }) => {
  return useQuery<GetFoldersResponse>({
    queryKey: [GET_FOLDERS, params ?? {}],
    queryFn: () => getFolders(params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export const useGetFolder = (folderId?: string, enabled = true) => {
  return useQuery<GetFolderResponse>({
    queryKey: [GET_FOLDER, folderId],
    queryFn: () => getFolder(folderId || ""),
    enabled: Boolean(folderId) && enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export const useCreateFolder = () => {
  const queryClient = useQueryClient()
  return useMutation<CreateFolderResponse, Error, CreateFolderRequest>({
    mutationKey: [CREATE_FOLDER],
    mutationFn: createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_FOLDERS] })
      queryClient.invalidateQueries({ queryKey: [GET_FILE_MANAGER_DASHBOARD] })
    },
  })
}

export const useUpdateFolder = () => {
  const queryClient = useQueryClient()
  return useMutation<UpdateFolderResponse, Error, UpdateFolderRequest>({
    mutationKey: [UPDATE_FOLDER],
    mutationFn: updateFolder,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_FOLDERS] })
      queryClient.invalidateQueries({ queryKey: [GET_FOLDER, variables.folder_id] })
      queryClient.invalidateQueries({ queryKey: [GET_FILE_MANAGER_DASHBOARD] })
    },
  })
}

export const useDeleteFolder = () => {
  const queryClient = useQueryClient()
  return useMutation<DeleteFolderResponse, Error, string>({
    mutationKey: [DELETE_FOLDER],
    mutationFn: deleteFolder,
    onSuccess: (_, folderId) => {
      queryClient.invalidateQueries({ queryKey: [GET_FOLDERS] })
      queryClient.invalidateQueries({ queryKey: [GET_FOLDER, folderId] })
      queryClient.invalidateQueries({ queryKey: [GET_FILE_MANAGER_DASHBOARD] })
    },
  })
}
