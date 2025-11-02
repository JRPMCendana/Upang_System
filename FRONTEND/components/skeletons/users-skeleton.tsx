import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function UsersSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-32 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Filters */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch">
          <Skeleton className="flex-1 h-10 rounded-md" />
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-md" />
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-md" />
            ))}
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="min-w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-tertiary">
              <tr>
                <th className="text-left px-6 py-3">
                  <Skeleton className="h-4 w-20" />
                </th>
                <th className="text-left px-6 py-3">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="text-left px-6 py-3">
                  <Skeleton className="h-4 w-12" />
                </th>
                <th className="text-left px-6 py-3">
                  <Skeleton className="h-4 w-12" />
                </th>
                <th className="text-left px-6 py-3">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-6 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-6 py-3">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-6 py-3">
                    <Skeleton className="h-4 w-48" />
                  </td>
                  <td className="px-6 py-3">
                    <Skeleton className="h-5 w-16 rounded" />
                  </td>
                  <td className="px-6 py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Skeleton className="h-8 w-16 rounded-md" />
                      <Skeleton className="h-8 w-24 rounded-md" />
                      <Skeleton className="h-8 w-9 rounded-md" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-64" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-8 w-9 rounded-md" />
            ))}
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
    </div>
  )
}
