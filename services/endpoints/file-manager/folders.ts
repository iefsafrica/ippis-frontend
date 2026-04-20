import { del, get, patch, post } from "@/services/axios"
import type {
  CreateFolderRequest,
  CreateFolderResponse,
  DeleteFolderResponse,
  GetFolderResponse,
  GetFoldersResponse,
  UpdateFolderRequest,
  UpdateFolderResponse,
} from "@/types/file-manager/folders"

const FOLDERS_ENDPOINT = "/file-manager/folders"

export const getFolders = async (params?: { folder_id?: string; parent_id?: string | null }): Promise<GetFoldersResponse> => {
  return get<GetFoldersResponse>(FOLDERS_ENDPOINT, params)
}

export const getFolder = async (folderId: string): Promise<GetFolderResponse> => {
  return get<GetFolderResponse>(FOLDERS_ENDPOINT, { folder_id: folderId })
}

export const createFolder = async (payload: CreateFolderRequest): Promise<CreateFolderResponse> => {
  return post<CreateFolderResponse>(FOLDERS_ENDPOINT, payload)
}

export const updateFolder = async (payload: UpdateFolderRequest): Promise<UpdateFolderResponse> => {
  return patch<UpdateFolderResponse>(FOLDERS_ENDPOINT, payload)
}

export const deleteFolder = async (folderId: string): Promise<DeleteFolderResponse> => {
  return del<DeleteFolderResponse>(FOLDERS_ENDPOINT, {
    folder_id: folderId,
  })
}
