export const RECRUITMENT_INTERVIEW_STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

export const RECRUITMENT_INTERVIEW_TYPE_OPTIONS = [
  { value: "technical", label: "Technical" },
  { value: "hr", label: "HR" },
  { value: "behavioral", label: "Behavioral" },
]

export const RECRUITMENT_INTERVIEW_STATUSES = RECRUITMENT_INTERVIEW_STATUS_OPTIONS.map((option) => option.value)
export const RECRUITMENT_INTERVIEW_TYPES = RECRUITMENT_INTERVIEW_TYPE_OPTIONS.map((option) => option.value)
