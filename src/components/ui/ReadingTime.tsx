"use client";

import { useMemo } from "react";
import { useLocale } from "@/lib/i18n";

interface ReadingTimeProps {
  text: string;
  locale?: string;
}

const WORDS_PER_MINUTE = 200;

export default function ReadingTime({ text, locale }: ReadingTimeProps) {
  const { locale: ctxLocale, t } = useLocale();
  const lang = locale || ctxLocale;

  const minutes = useMemo(() => {
    const wordCount = text
      .replace(/<[^>]*>/g, "")
      .split(/\s+/)
      .filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
  }, [text]);

  const label = `${minutes} ${t("reading_time_min")}`;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
      {label}
    </span>
  );
}
