import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function CoursesSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-40 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>

      {/* Search */}
      <Card className="p-4">
        <Skeleton className="h-10 w-full rounded-md" />
      </Card>

      {/* Courses Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-64" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
              <Skeleton className="w-9 h-9 rounded-md" />
            </div>

            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />

              <div className="pt-3 border-t border-border space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>

              <Skeleton className="h-10 w-full rounded-md mt-4" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
