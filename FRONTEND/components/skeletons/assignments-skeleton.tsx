import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function AssignmentsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-10 w-52 rounded-md" />
      </div>

      {/* Filters */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="flex-1 h-10 rounded-md" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-md" />
            ))}
          </div>
        </div>
      </Card>

      {/* Assignments List */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                <Skeleton className="w-12 h-12 rounded-lg shrink-0 mt-1" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
              <Skeleton className="w-9 h-9 rounded-md shrink-0" />
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-border">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-8 w-32 rounded-md ml-auto" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
