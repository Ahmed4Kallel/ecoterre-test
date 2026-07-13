"use client";

import { useLocale } from "@/lib/i18n";

interface LoadingSpinnerProps {
  label?: string;
}

export default function LoadingSpinner({ label }: LoadingSpinnerProps) {
  const { t } = useLocale();

  return (
    <div className="flex items-center justify-center py-16" role="status" aria-label={label || t("loading")}>
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-800 dark:border-green-900 dark:border-t-green-400"
      >
        <span className="sr-only">{label || t("loading")}</span>
      </div>
    </div>
  );
}
