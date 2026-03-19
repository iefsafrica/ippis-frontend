import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createRecruitmentJob,
  deleteRecruitmentJob,
  fetchRecruitmentJobById,
  fetchRecruitmentJobs,
  RecruitmentJobFilters,
  RecruitmentJobPayload,
  updateRecruitmentJob,
} from "@/services/endpoints/recruitment/jobs"

const JOB_LIST_QUERY_KEY = ["recruitment", "jobs"]

export const useRecruitmentJobs = () => {
  return useQuery({
    queryKey: JOB_LIST_QUERY_KEY,
    queryFn: () => fetchRecruitmentJobs(),
  })
}

export const useRecruitmentJob = (id?: string) => {
  const enabled = Boolean(id)
  return useQuery({
    queryKey: [...JOB_LIST_QUERY_KEY, id],
    queryFn: () => fetchRecruitmentJobById(id!),
    enabled,
  })
}

export const useCreateRecruitmentJob = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RecruitmentJobPayload) => createRecruitmentJob(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOB_LIST_QUERY_KEY })
    },
  })
}

export const useUpdateRecruitmentJob = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RecruitmentJobPayload }) =>
      updateRecruitmentJob(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOB_LIST_QUERY_KEY })
    },
  })
}

export const useDeleteRecruitmentJob = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteRecruitmentJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOB_LIST_QUERY_KEY })
    },
  })
}
