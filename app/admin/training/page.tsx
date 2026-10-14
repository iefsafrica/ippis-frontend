import type { Metadata } from "next"
import { TrainingAnalytics } from "@/app/admin/components/module-analytics/training-analytics"

export const metadata: Metadata = {
  title: "Training & Capacity Development Analytics | IPPIS Admin",
  description: "Executive analytics for civil service training programs, certifications, and institutional capacity development",
}

export default function TrainingPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <TrainingAnalytics />
    </div>
  )
}
