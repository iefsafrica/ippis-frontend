import ClientWrapper from "./client-wrapper"

export const metadata = {
  title: "Recruitment CMS | IPPIS Admin",
  description: "Manage recruitment content for your career site",
}

export default function RecruitmentCMSPage() {
  return (
    <div className="container mx-auto py-6">
      <ClientWrapper />
    </div>
  )
}
