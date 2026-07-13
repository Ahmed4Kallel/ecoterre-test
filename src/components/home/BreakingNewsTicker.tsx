"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import type { Article } from "@/lib/types";

interface BreakingNewsTickerProps {
  articles: Article[];
  locale: string;
}

export default function BreakingNewsTicker({
  articles,
  locale,
}: BreakingNewsTickerProps) {
  const { dir } = useLocale();
  const rtl = dir === "rtl";

  if (articles.length === 0) return null;

  return (
    <div className="relative overflow-hidden bg-red-700 text-white" dir={dir}>
      <div className="flex items-center">
        <div className="z-10 flex shrink-0 items-center gap-1.5 bg-amber-500 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-black">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          BREAKING
        </div>
        <div className="relative flex-1 overflow-hidden py-2.5">
          <div className="animate-marquee flex w-max gap-16 px-4" style={{ direction: rtl ? "rtl" : "ltr" }}>
            {[...articles, ...articles].map((article, i) => {
              const title = article.title[locale as "fr" | "ar"];
              return (
                <Link
                  key={`${article.id}-${i}`}
                  href={`/${locale}/article/${article.slug}`}
                  className="shrink-0 text-sm font-medium whitespace-nowrap hover:underline"
                >
                  {title}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
