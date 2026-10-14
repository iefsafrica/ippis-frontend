import type { Metadata } from "next"
import { ProjectManagementAnalytics } from "@/app/admin/components/module-analytics/project-management-analytics"

export const metadata: Metadata = {
  title: "Project Management Analytics | IPPIS Admin",
  description: "Executive analytics for strategic civil service capital projects, task velocity, client accounts, and milestones",
}

export default function ProjectManagementPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <ProjectManagementAnalytics />
    </div>
  )
}
