import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  DELETE_FILE,
  GET_FILES,
  GET_FILE_MANAGER_DASHBOARD,
  UPLOAD_FILE,
} from "@/services/constants/file-manager"
import { deleteFile, getFiles, uploadFile } from "@/services/endpoints/file-manager/files"
import type {
  DeleteFileResponse,
  GetFilesResponse,
  UploadFileRequest,
  UploadFileResponse,
} from "@/types/file-manager/files"

export const useGetFiles = (folderId?: string | null) => {
  return useQuery<GetFilesResponse>({
    queryKey: [GET_FILES, folderId ?? null],
    queryFn: () => getFiles(folderId ? { folder_id: folderId } : undefined),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export const useUploadFile = () => {
  const queryClient = useQueryClient()
  return useMutation<UploadFileResponse, Error, UploadFileRequest>({
    mutationKey: [UPLOAD_FILE],
    mutationFn: uploadFile,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_FILES, variables.folder_id ?? null] })
      queryClient.invalidateQueries({ queryKey: [GET_FILES] })
      queryClient.invalidateQueries({ queryKey: [GET_FILE_MANAGER_DASHBOARD] })
    },
  })
}

export const useDeleteFile = () => {
  const queryClient = useQueryClient()
  return useMutation<DeleteFileResponse, Error, string>({
    mutationKey: [DELETE_FILE],
    mutationFn: deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_FILES] })
      queryClient.invalidateQueries({ queryKey: [GET_FILE_MANAGER_DASHBOARD] })
    },
  })
}
