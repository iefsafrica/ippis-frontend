import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createRecruitmentCandidate,
  deleteRecruitmentCandidate,
  fetchRecruitmentCandidateById,
  fetchRecruitmentCandidates,
  updateRecruitmentCandidate,
} from "@/services/endpoints/recruitment/candidates"
import { RecruitmentCandidateFilters, RecruitmentCandidatePayload } from "@/types/recruitment/candidates"

const CANDIDATE_LIST_QUERY_KEY = ["recruitment", "candidates"]

export const useRecruitmentCandidates = (filters?: RecruitmentCandidateFilters) => {
  const queryKey = filters ? [...CANDIDATE_LIST_QUERY_KEY, filters] : CANDIDATE_LIST_QUERY_KEY
  return useQuery({
    queryKey,
    queryFn: () => fetchRecruitmentCandidates(filters),
  })
}

export const useRecruitmentCandidate = (id?: string) => {
  const enabled = Boolean(id)
  return useQuery({
    queryKey: [...CANDIDATE_LIST_QUERY_KEY, "detail", id],
    queryFn: () => fetchRecruitmentCandidateById(id!),
    enabled,
  })
}

export const useCreateRecruitmentCandidate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RecruitmentCandidatePayload) => createRecruitmentCandidate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CANDIDATE_LIST_QUERY_KEY })
    },
  })
}

export const useUpdateRecruitmentCandidate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RecruitmentCandidatePayload }) =>
      updateRecruitmentCandidate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CANDIDATE_LIST_QUERY_KEY })
    },
  })
}

export const useDeleteRecruitmentCandidate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteRecruitmentCandidate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CANDIDATE_LIST_QUERY_KEY })
    },
  })
}
