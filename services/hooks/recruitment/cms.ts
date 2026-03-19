import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { RecruitmentCmsPayload } from '@/types/recruitment/cms'
import {
  createRecruitmentCmsContent,
  deleteRecruitmentCmsContent,
  fetchRecruitmentCmsContents,
  updateRecruitmentCmsContent,
} from '@/services/endpoints/recruitment/cms'

const CMS_QUERY_KEY = ['recruitment', 'cms']

export const useRecruitmentCms = () => {
  return useQuery({
    queryKey: CMS_QUERY_KEY,
    queryFn: () => fetchRecruitmentCmsContents(),
  })
}

export const useCreateRecruitmentCms = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RecruitmentCmsPayload) => createRecruitmentCmsContent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEY })
    },
  })
}

export const useUpdateRecruitmentCms = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RecruitmentCmsPayload }) =>
      updateRecruitmentCmsContent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEY })
    },
  })
}

export const useDeleteRecruitmentCms = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteRecruitmentCmsContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEY })
    },
  })
}
