import type { Metadata } from "next"
import ClientWrapper from "./client-wrapper"

export const metadata: Metadata = {
  title: "Performance Indicators | IPPIS Admin",
  description: "Manage key performance indicators in the IPPIS system",
}

export default function IndicatorPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Performance Indicators</h1>
      </div>
      <div className="border rounded-lg p-6 bg-white">
        <ClientWrapper />
      </div>
    </div>
  )
}
