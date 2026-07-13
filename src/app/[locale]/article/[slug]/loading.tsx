export default function ArticleLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 h-4 w-24 animate-pulse rounded bg-gray-200" />

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
        <div className="h-6 w-28 animate-pulse rounded-full bg-gray-200" />
      </div>

      <div className="mb-4 space-y-2">
        <div className="h-8 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="mb-8 h-4 w-64 animate-pulse rounded bg-gray-200" />

      <div className="mb-8 h-64 w-full animate-pulse rounded-lg bg-gray-200" />

      <div className="space-y-4">
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-4/6 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="mt-12">
        <div className="mb-6 h-6 w-48 animate-pulse rounded bg-gray-200" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((card) => (
            <div
              key={card}
              className="overflow-hidden rounded-lg border border-gray-200 p-4"
            >
              <div className="mb-3 h-40 w-full animate-pulse rounded-md bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
