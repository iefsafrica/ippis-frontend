export interface RecruitmentCmsContent {
  id: string
  title: string
  type: string
  content: string
  status: string
  author: string
  views?: number
  slug?: string
  featured_image?: string
  seo_title?: string
  seo_description?: string
  tags?: string[]
  created_at?: string
  updated_at?: string
}

export interface RecruitmentCmsContentResponse {
  success: boolean
  message?: string
  data: RecruitmentCmsContent
}

export interface RecruitmentCmsContentsResponse {
  success: boolean
  message?: string
  data: RecruitmentCmsContent[]
}

export type RecruitmentCmsPayload = Omit<
  RecruitmentCmsContent,
  'id' | 'created_at' | 'updated_at'
>
