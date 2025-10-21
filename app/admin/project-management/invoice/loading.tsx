import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-72" />
      </div>

      <div className="bg-white rounded-lg shadow">
        <Skeleton className="h-12 w-full rounded-t-lg" />
        {Array(5)
          .fill(null)
          .map((_, i) => (
            <div key={i} className="flex items-center p-4 border-b">
              <Skeleton className="h-6 w-12 mr-4" />
              <Skeleton className="h-6 w-40 mr-4" />
              <Skeleton className="h-6 w-32 mr-4" />
              <Skeleton className="h-6 w-24 mr-4" />
              <Skeleton className="h-6 w-24 mr-4" />
              <Skeleton className="h-6 w-24 mr-4" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        <div className="p-4 flex justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
    </div>
  )
}
