import type { Metadata } from "next"
import { RecruitmentAnalytics } from "@/app/admin/components/module-analytics/recruitment-analytics"

export const metadata: Metadata = {
  title: "Recruitment Analytics | IPPIS Admin",
  description: "Executive recruitment analytics, talent pipelines, and vacancy tracking for Federal MDAs",
}

export default function RecruitmentPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <RecruitmentAnalytics />
    </div>
  )
}
