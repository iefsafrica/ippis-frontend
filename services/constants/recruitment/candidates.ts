export const RECRUITMENT_CANDIDATE_STATUS_OPTIONS = [
  { value: "applied", label: "Applied" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview", label: "Interview" },
  { value: "offered", label: "Offered" },
  { value: "conducted", label: "Assessment Completed" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
]

export const RECRUITMENT_CANDIDATE_STATUSES = RECRUITMENT_CANDIDATE_STATUS_OPTIONS.map(
  (option) => option.value,
)
