import type React from "react"
import type { Metadata } from "next"
import ReportsNavigation from "./components/reports-navigation"

export const metadata: Metadata = {
  title: "HR Reports",
  description: "View and generate various HR reports",
}

export default function HRReportsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">HR Reports</h2>
        <p className="text-muted-foreground">View and generate various HR reports for your organization</p>
      </div>

      <ReportsNavigation />

      <div className="bg-white shadow rounded-lg p-6">{children}</div>
    </div>
  )
}
