export interface RecruitmentInterview {
  id: string
  candidate_id: string
  job_id: string
  interview_datetime: string
  interview_type: string
  interviewers: string
  location?: string
  meeting_link?: string
  status: string
  round?: number
  notes?: string
  feedback?: string
  created_at?: string
  updated_at?: string
}

export interface RecruitmentInterviewsResponse {
  success: boolean
  message?: string
  data: RecruitmentInterview[]
}

export interface RecruitmentInterviewResponse {
  success: boolean
  message?: string
  data: RecruitmentInterview
}

export type RecruitmentInterviewPayload = Omit<
  RecruitmentInterview,
  'id' | 'created_at' | 'updated_at'
>
