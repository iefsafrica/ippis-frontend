import { del, get, post } from "@/services/axios"
import type {
  DeleteFileResponse,
  GetFilesResponse,
  UploadFileRequest,
  UploadFileResponse,
} from "@/types/file-manager/files"

const FILES_ENDPOINT = "/file-manager/files"

export const getFiles = async (params?: { folder_id?: string | null }): Promise<GetFilesResponse> => {
  return get<GetFilesResponse>(FILES_ENDPOINT, params)
}

export const uploadFile = async (payload: UploadFileRequest): Promise<UploadFileResponse> => {
  const formData = new FormData()
  formData.append("file", payload.file)

  if (payload.folder_id) {
    formData.append("folder_id", payload.folder_id)
  }

  if (payload.company_id) {
    formData.append("company_id", String(payload.company_id))
  }

  if (payload.department_id) {
    formData.append("department_id", String(payload.department_id))
  }

  return post<UploadFileResponse>(FILES_ENDPOINT, formData)
}

export const deleteFile = async (fileId: string): Promise<DeleteFileResponse> => {
  return del<DeleteFileResponse>(FILES_ENDPOINT, {
    file_id: fileId,
  })
}
