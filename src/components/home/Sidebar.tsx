"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/lib/i18n";
import type { Article, Tag } from "@/lib/types";

interface SidebarProps {
  popularArticles: Article[];
  tags: { id: string; slug: string; name: Record<"fr" | "ar", string> }[];
  locale: string;
}

export default function Sidebar({
  popularArticles,
  tags,
  locale,
}: SidebarProps) {
  const { dir, t } = useLocale();
  const rtl = dir === "rtl";
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="space-y-8" dir={dir}>
      {/* Search */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("search_placeholder")}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
          />
          <button
            type="submit"
            className="rounded-lg bg-green-700 px-4 py-2.5 text-white transition-colors hover:bg-green-800"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </form>
      </div>

      {/* Popular Articles */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-gray-500 dark:text-slate-400">
          {t("most_read")}
        </h3>
        {popularArticles.length === 0 ? (
          <p className="text-sm text-gray-400">{t("no_articles")}</p>
        ) : (
          <div className="space-y-3">
            {popularArticles.slice(0, 5).map((article, idx) => {
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
                  className="flex gap-3 group"
                >
                  <span className="shrink-0 text-2xl font-extrabold text-green-200 dark:text-green-800">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h4
                      className="line-clamp-2 text-sm font-semibold leading-snug text-gray-800 transition-colors group-hover:text-green-700 dark:text-slate-200 dark:group-hover:text-green-400"
                      style={{ textAlign: rtl ? "right" : "left" }}
                    >
                      {title}
                    </h4>
                    {date && (
                      <span className="mt-0.5 block text-xs text-gray-400 dark:text-slate-500">
                        {date}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Tags Cloud */}
      {tags.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-gray-500 dark:text-slate-400">
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const name = tag.name[locale as "fr" | "ar"] || tag.name.fr;
              return (
                <Link
                  key={tag.id}
                  href={`/${locale}/tag/${tag.slug}`}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-green-100 hover:text-green-700 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-green-900 dark:hover:text-green-300"
                >
                  {name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Newsletter */}
      <div className="rounded-xl bg-gradient-to-br from-green-700 to-green-900 p-5 text-white shadow-sm">
        <h3 className="mb-1 text-sm font-extrabold uppercase tracking-wider text-green-200">
          {t("newsletter_title")}
        </h3>
        <p className="mb-4 text-xs text-green-100">
          {locale === "ar"
            ? "توصل بأحدث الأخبار والتحليلات"
            : "Recevez nos derniers articles et analyses"}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.querySelector("input") as HTMLInputElement;
            if (input?.value) {
              window.location.href = `/${locale}/newsletter?email=${encodeURIComponent(input.value)}`;
            }
          }}
          className="flex flex-col gap-2"
        >
          <input
            type="email"
            placeholder={t("newsletter_placeholder")}
            className="w-full rounded-lg border border-green-600 bg-white/15 px-3 py-2.5 text-sm text-white placeholder-green-200 focus:border-white focus:outline-none focus:ring-1 focus:ring-white/30"
            required
          />
          <button
            type="submit"
            className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-green-900 transition-colors hover:bg-green-50"
          >
            {t("newsletter_subscribe")}
          </button>
        </form>
      </div>
    </div>
  );
}
