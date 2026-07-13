export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 h-64 animate-pulse rounded-lg bg-gray-200 sm:h-80 lg:h-96" />

      <div className="space-y-12">
        {[1, 2, 3].map((section) => (
          <div key={section}>
            <div className="mb-4 h-6 w-40 animate-pulse rounded bg-gray-200" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((card) => (
                <div
                  key={card}
                  className="overflow-hidden rounded-lg border border-gray-200"
                >
                  <div className="h-48 animate-pulse bg-gray-200" />
                  <div className="space-y-3 p-4">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
