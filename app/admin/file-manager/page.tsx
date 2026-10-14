import type { Metadata } from "next"
import { FileManagerAnalytics } from "@/app/admin/components/module-analytics/file-manager-analytics"

export const metadata: Metadata = {
  title: "File Manager Analytics | IPPIS Admin",
  description: "Executive analytics for electronic records management, cloud document quotas, official circulars, and archives",
}

export default function FileManagerPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <FileManagerAnalytics />
    </div>
  )
}
