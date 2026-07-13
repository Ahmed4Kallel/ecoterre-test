"use client";

import { useLocale } from "@/lib/i18n";

export default function SkipToContent() {
  const { t } = useLocale();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-md focus:bg-green-800 focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
    >
      {t("skip_to_content")}
    </a>
  );
}
