export interface FileItem {
  id: number
  file_id: string
  name: string
  folder_id: string | null
  file_url: string
  file_type: string
  file_size: string | number
  uploaded_by: string | null
  created_at: string
  updated_at: string
  company_id?: number | string | null
  department_id?: number | string | null
}

export interface GetFilesResponse {
  success: boolean
  data: FileItem[]
}

export interface UploadFileRequest {
  file: File
  folder_id?: string | null
  company_id?: string | number | null
  department_id?: string | number | null
}

export interface UploadFileResponse {
  success: boolean
  message?: string
  data: FileItem
}

export interface DeleteFileResponse {
  success: boolean
  message: string
}
