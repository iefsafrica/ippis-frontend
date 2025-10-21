import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 space-y-4">
          <Skeleton className="h-6 w-48" />

          <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0">
            <div className="flex items-center w-full md:w-auto space-x-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>

          <div className="rounded-md border">
            <div className="h-10 border-b px-4 flex items-center">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex-1">
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="h-16 border-b px-4 flex items-center">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((cell) => (
                  <div key={cell} className="flex-1">
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <Skeleton className="h-4 w-48" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
