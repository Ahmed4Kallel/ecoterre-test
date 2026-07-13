"use client";

import { useLocale } from "@/lib/i18n";

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  const { t } = useLocale();

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 px-6 py-12 text-center dark:border-red-800 dark:bg-red-900/20">
      <svg
        className="mb-4 h-12 w-12 text-red-400 dark:text-red-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h2 className="mb-2 text-lg font-semibold text-red-800 dark:text-red-400">
        {t("error_occurred")}
      </h2>
      <p className="mb-6 max-w-md text-sm text-red-600 dark:text-red-300">
        {message || t("error_occurred")}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 cursor-pointer"
        >
          {t("retry")}
        </button>
      )}
    </div>
  );
}
