import ClientWrapper from "./client-wrapper"

export const metadata = {
  title: "Job Candidates | IPPIS Admin",
  description: "Manage and track job applicants",
}

export default function JobCandidatesPage() {
  return (
    <div className="container mx-auto py-6">
      <ClientWrapper />
    </div>
  )
}
