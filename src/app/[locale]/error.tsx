"use client";

import ErrorMessage from "@/components/ui/ErrorMessage";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <ErrorMessage
        message={
          error.message && error.message !== "undefined"
            ? error.message
            : undefined
        }
        onRetry={reset}
      />
    </div>
  );
}
