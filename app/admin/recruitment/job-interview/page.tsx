import ClientWrapper from "./client-wrapper"

export const metadata = {
  title: "Job Interviews | IPPIS Admin",
  description: "Schedule and manage candidate interviews",
}

export default function JobInterviewPage() {
  return (
    <div className="container mx-auto py-6">
      <ClientWrapper />
    </div>
  )
}
