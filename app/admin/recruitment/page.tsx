import { ComingSoon } from "@/app/admin/components/coming-soon"

export default function RecruitmentPage() {
  return (
    <ComingSoon
      title="Recruitment Management"
      description="The Recruitment module will streamline the hiring process with tools for job posting, applicant tracking, interview scheduling, and onboarding."
      features={[
        "Job posting management",
        "Candidate tracking and management",
        "Interview scheduling and feedback",
        "Recruitment analytics and reporting",
        "Onboarding process management",
      ]}
    />
  )
}
