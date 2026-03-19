export interface RecruitmentCandidate {
  id: string
  job_id: string
  candidate_name: string
  email: string
  phone_number: string
  application_date: string
  status: string
  experience?: string
  education?: string
  skills?: string
  created_at: string
  updated_at: string
}

export interface RecruitmentCandidatesResponse {
  success: boolean
  message?: string
  data: RecruitmentCandidate[]
}

export interface RecruitmentCandidateResponse {
  success: boolean
  message?: string
  data: RecruitmentCandidate
}

export interface RecruitmentCandidateFilters {
  search?: string
  status?: string
  job_id?: string
}

export type RecruitmentCandidatePayload = Omit<
  RecruitmentCandidate,
  "id" | "created_at" | "updated_at"
>
