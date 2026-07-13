"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import type { Article } from "@/lib/types";
import OptimizedImage from "@/components/ui/OptimizedImage";

interface ArticleListProps {
  articles: Article[];
  locale: string;
}

export default function ArticleList({ articles, locale }: ArticleListProps) {
  const { dir, t } = useLocale();
  const rtl = dir === "rtl";

  if (articles.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        {t("no_articles")}
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-slate-700">
      {articles.map((article) => {
        const title = article.title[locale as "fr" | "ar"];
        const date = article.publishedAt
          ? new Date(article.publishedAt).toLocaleDateString(
              locale === "fr" ? "fr-TN" : "ar-TN",
              { month: "short", day: "numeric" }
            )
          : null;

        return (
          <Link
            key={article.id}
            href={`/${locale}/article/${article.slug}`}
            className="group flex gap-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
            dir={dir}
          >
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded bg-gradient-to-br from-green-700 via-green-800 to-blue-900">
              {article.coverImage ? (
                <OptimizedImage
                  src={article.coverImage}
                  alt={title}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-xs font-bold text-white/30">Eco</span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4
                className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 transition-colors group-hover:text-green-700 dark:text-slate-100 dark:group-hover:text-green-400"
                style={{ textAlign: rtl ? "right" : "left" }}
              >
                {title}
              </h4>
              {date && (
                <span
                  className="mt-1 block text-xs text-gray-400 dark:text-slate-500"
                  style={{ textAlign: rtl ? "right" : "left" }}
                >
                  {date}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
