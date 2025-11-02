import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ReportsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-40 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-40 rounded-md" />
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
        </div>
      </Card>

      {/* Overview Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-3 w-28 mt-2" />
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-[300px] w-full rounded-md" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-[300px] w-full rounded-md" />
        </Card>
      </div>

      {/* Detailed Report */}
      <Card className="p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
