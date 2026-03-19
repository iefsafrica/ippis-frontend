import { del, get, post, put } from "@/services/axios"
import {
  RecruitmentCandidateFilters,
  RecruitmentCandidatePayload,
  RecruitmentCandidatesResponse,
  RecruitmentCandidateResponse,
} from "@/types/recruitment/candidates"

export const fetchRecruitmentCandidates = (params?: RecruitmentCandidateFilters) => {
  return get<RecruitmentCandidatesResponse>("/recruitment/candidates", params)
}

export const fetchRecruitmentCandidateById = (id: string) => {
  return get<RecruitmentCandidateResponse>("/recruitment/candidates", { id })
}

export const createRecruitmentCandidate = (payload: RecruitmentCandidatePayload) => {
  return post<RecruitmentCandidateResponse>("/recruitment/candidates", payload)
}

export const updateRecruitmentCandidate = (id: string, payload: RecruitmentCandidatePayload) => {
  return put<RecruitmentCandidateResponse>("/recruitment/candidates", payload, {
    params: { id },
  })
}

export const deleteRecruitmentCandidate = (id: string) => {
  return del<{ success: boolean; message: string }>("/recruitment/candidates", { id })
}
