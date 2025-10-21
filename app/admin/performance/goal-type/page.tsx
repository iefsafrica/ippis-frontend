import type { Metadata } from "next"
import ClientWrapper from "./client-wrapper"

export const metadata: Metadata = {
  title: "Goal Type | IPPIS Admin",
  description: "Manage performance goal types in the IPPIS system",
}

export default function GoalTypePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Goal Types</h1>
      </div>
      <div className="border rounded-lg p-6 bg-white">
        <ClientWrapper />
      </div>
    </div>
  )
}
