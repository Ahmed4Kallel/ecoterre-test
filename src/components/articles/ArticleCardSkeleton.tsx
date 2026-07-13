"use client";

export default function ArticleCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-slate-800">
          <div className="relative aspect-[16/10] animate-pulse bg-gray-200 dark:bg-slate-700" />
          <div className="p-4 space-y-3">
            <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
            <div className="space-y-2">
              <div className="h-3.5 w-full animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
              <div className="h-3.5 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
            </div>
            <div className="flex justify-between pt-1">
              <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
              <div className="h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
