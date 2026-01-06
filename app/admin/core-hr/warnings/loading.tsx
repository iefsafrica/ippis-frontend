import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-50 to-red-100 border border-red-200 animate-pulse" />
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Employee Warnings
            </h1>
            <div className="h-3 w-48 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 bg-white rounded-xl shadow border border-gray-200 animate-pulse" />
        ))}
      </div>
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
        <div className="flex flex-col space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4" />
          <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}