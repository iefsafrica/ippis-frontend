import { Loader2 } from "lucide-react"

export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="flex items-center justify-center bg-primary/5 rounded-full w-16 h-16 mb-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">Loading Dashboard</h3>
      <p className="text-sm text-gray-500">Please wait while we load your data...</p>
    </div>
  )
}
