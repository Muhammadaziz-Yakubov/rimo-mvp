import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function StatsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24 bg-zinc-150 dark:bg-zinc-800" />
            <Skeleton className="h-4 w-4 rounded-full bg-zinc-150 dark:bg-zinc-800" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2 bg-zinc-150 dark:bg-zinc-800" />
            <Skeleton className="h-3 w-32 bg-zinc-150 dark:bg-zinc-800" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-64 bg-zinc-150 dark:bg-zinc-800" />
        <Skeleton className="h-9 w-32 bg-zinc-150 dark:bg-zinc-800" />
      </div>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20 bg-zinc-150 dark:bg-zinc-800" />
          ))}
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 flex justify-between">
              <Skeleton className="h-4 w-24 bg-zinc-150 dark:bg-zinc-800" />
              <Skeleton className="h-4 w-32 bg-zinc-150 dark:bg-zinc-800" />
              <Skeleton className="h-4 w-16 bg-zinc-150 dark:bg-zinc-800" />
              <Skeleton className="h-4 w-28 bg-zinc-150 dark:bg-zinc-800" />
              <Skeleton className="h-4 w-12 bg-zinc-150 dark:bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 rounded-xl">
      <CardHeader>
        <Skeleton className="h-5 w-36 mb-1 bg-zinc-150 dark:bg-zinc-800" />
        <Skeleton className="h-3.5 w-64 bg-zinc-150 dark:bg-zinc-800" />
      </CardHeader>
      <CardContent className="h-64 flex items-end justify-between gap-2 pt-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="w-full bg-zinc-100 dark:bg-zinc-850 rounded"
            style={{ height: `${Math.floor(Math.random() * 60) + 20}%` }}
          />
        ))}
      </CardContent>
    </Card>
  );
}
