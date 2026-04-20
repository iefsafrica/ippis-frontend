export interface Folder {
  id: number
  folder_id: string
  name: string
  parent_id: string | null
  created_at: string
  updated_at: string
}

export interface GetFoldersResponse {
  success: boolean
  data: Folder[]
}

export interface GetFolderResponse {
  success: boolean
  data: Folder
}

export interface CreateFolderRequest {
  name: string
  parent_id: string | null
}

export interface CreateFolderResponse {
  success: boolean
  message?: string
  data: Folder
}

export interface UpdateFolderRequest {
  folder_id: string
  name: string
}

export interface UpdateFolderResponse {
  success: boolean
  message?: string
  data: Folder
}

export interface DeleteFolderResponse {
  success: boolean
  message: string
}
