import { del, get, post, put } from "@/services/axios"

export interface RecruitmentJob {
  id: string
  job_title: string
  department: string
  number_of_positions: number
  posted_date: string
  closing_date: string
  status: string
  location: string
  job_type: string
  experience: string
  salary_range: string
  job_description: string
  requirements: string
  responsibilities: string
  created_at: string
  updated_at: string
  applications?: number
  author?: string
}

export interface RecruitmentJobsResponse {
  success: boolean
  message?: string
  data: RecruitmentJob[]
}

export interface RecruitmentJobResponse {
  success: boolean
  message?: string
  data: RecruitmentJob
}

export interface RecruitmentJobFilters {
  search?: string
  status?: string
}

export type RecruitmentJobPayload = Omit<
  RecruitmentJob,
  "id" | "created_at" | "updated_at"
>

export const fetchRecruitmentJobs = (params?: RecruitmentJobFilters) => {
  return get<RecruitmentJobsResponse>("/recruitment/jobs", params)
}

export const fetchRecruitmentJobById = (id: string) => {
  return get<RecruitmentJobResponse>("/recruitment/jobs", { id })
}

export const createRecruitmentJob = (payload: RecruitmentJobPayload) => {
  return post<RecruitmentJobResponse>("/recruitment/jobs", payload)
}

export const updateRecruitmentJob = (id: string, payload: RecruitmentJobPayload) => {
  return put<RecruitmentJobResponse>("/recruitment/jobs", payload, {
    params: { id },
  })
}

export const deleteRecruitmentJob = (id: string) => {
  return del<{ success: boolean; message: string }>("/recruitment/jobs", { id })
}
