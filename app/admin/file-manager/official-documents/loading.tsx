import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-[300px]" />
      <div className="flex gap-4 items-center">
        <Skeleton className="h-10 w-[150px]" />
        <Skeleton className="h-10 w-[150px]" />
      </div>
      <div className="flex gap-4 items-center">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
      </div>
      <div className="border rounded-lg">
        <Skeleton className="h-10 rounded-t-lg" />
        <div className="p-4 space-y-4">
          {Array(5)
            .fill(null)
            .map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-[100px] ml-auto" />
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
