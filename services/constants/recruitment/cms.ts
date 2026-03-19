export const RECRUITMENT_CMS_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "review", label: "Under Review" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
]

export const RECRUITMENT_CMS_TYPE_OPTIONS = [
  { value: "career_path", label: "Career Path" },
  { value: "guide", label: "Guide" },
  { value: "benefits", label: "Benefits" },
  { value: "process", label: "Process" },
  { value: "policy", label: "Policy" },
  { value: "faq", label: "FAQ" },
  { value: "job_description", label: "Job Description" },
]

export const RECRUITMENT_CMS_STATUSES = RECRUITMENT_CMS_STATUS_OPTIONS.map((option) => option.value)
export const RECRUITMENT_CMS_TYPES = RECRUITMENT_CMS_TYPE_OPTIONS.map((option) => option.value)
