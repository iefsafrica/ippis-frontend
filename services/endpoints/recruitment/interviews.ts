import { del, get, post, put } from '@/services/axios'
import type {
  RecruitmentInterview,
  RecruitmentInterviewsResponse,
  RecruitmentInterviewResponse,
  RecruitmentInterviewPayload,
} from '@/types/recruitment/interviews'

export const fetchRecruitmentInterviews = () => {
  return get<RecruitmentInterviewsResponse>('/recruitment/interviews')
}

export const createRecruitmentInterview = (payload: RecruitmentInterviewPayload) => {
  return post<RecruitmentInterviewResponse>('/recruitment/interviews', payload)
}

export const updateRecruitmentInterview = (id: string, payload: RecruitmentInterviewPayload) => {
  return put<RecruitmentInterviewResponse>('/recruitment/interviews', payload, {
    params: { id },
  })
}

export const deleteRecruitmentInterview = (id: string) => {
  return del<{ success: boolean; message: string }>('/recruitment/interviews', { id })
}
