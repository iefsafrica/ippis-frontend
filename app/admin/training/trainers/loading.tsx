import { Skeleton } from "@/components/ui/skeleton"

export default function TrainersLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-4 w-2/4" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-[200px]" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-[100px]" />
            <Skeleton className="h-10 w-[100px]" />
          </div>
        </div>
      </div>
      <Skeleton className="h-[500px] w-full" />
    </div>
  )
}
