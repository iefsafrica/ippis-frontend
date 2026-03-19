import { del, get, post, put } from '@/services/axios'
import type {
  RecruitmentCmsContent,
  RecruitmentCmsContentResponse,
  RecruitmentCmsContentsResponse,
  RecruitmentCmsPayload,
} from '@/types/recruitment/cms'

export const fetchRecruitmentCmsContents = () => {
  return get<RecruitmentCmsContentsResponse>('/recruitment/cms')
}

export const fetchRecruitmentCmsContentById = (id: string) => {
  return get<RecruitmentCmsContentResponse>('/recruitment/cms', { id })
}

export const createRecruitmentCmsContent = (payload: RecruitmentCmsPayload) => {
  return post<RecruitmentCmsContentResponse>('/recruitment/cms', payload)
}

export const updateRecruitmentCmsContent = (id: string, payload: RecruitmentCmsPayload) => {
  return put<RecruitmentCmsContentResponse>('/recruitment/cms', payload, {
    params: { id },
  })
}

export const deleteRecruitmentCmsContent = (id: string) => {
  return del<{ success: boolean; message: string }>('/recruitment/cms', { id })
}
