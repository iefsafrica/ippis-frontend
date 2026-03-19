import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { RecruitmentInterviewPayload } from '@/types/recruitment/interviews'
import {
  createRecruitmentInterview,
  deleteRecruitmentInterview,
  fetchRecruitmentInterviews,
  updateRecruitmentInterview,
} from '@/services/endpoints/recruitment/interviews'

const INTERVIEW_QUERY_KEY = ['recruitment', 'interviews']

export const useRecruitmentInterviews = () => {
  return useQuery({
    queryKey: INTERVIEW_QUERY_KEY,
    queryFn: () => fetchRecruitmentInterviews(),
  })
}

export const useCreateRecruitmentInterview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RecruitmentInterviewPayload) => createRecruitmentInterview(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEY })
    },
  })
}

export const useUpdateRecruitmentInterview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RecruitmentInterviewPayload }) =>
      updateRecruitmentInterview(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEY })
    },
  })
}

export const useDeleteRecruitmentInterview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteRecruitmentInterview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEY })
    },
  })
}
