import { Skeleton } from "@/components/ui/skeleton"

export default function MaintenanceTypesLoading() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-[500px] w-full" />
    </div>
  )
}
