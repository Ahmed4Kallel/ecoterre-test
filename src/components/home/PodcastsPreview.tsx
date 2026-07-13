"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from "@/lib/i18n";
import type { Article } from "@/lib/types";

interface PodcastsPreviewProps {
  podcasts: Article[];
  locale: string;
}

export default function PodcastsPreview({
  podcasts,
  locale,
}: PodcastsPreviewProps) {
  const { dir } = useLocale();
  const rtl = dir === "rtl";

  if (podcasts.length === 0) return null;

  return (
    <section dir={dir}>
      <div className="mb-6 flex items-center justify-between border-l-4 border-green-700 pl-4">
        <h2
          className="text-xl font-extrabold text-gray-900 sm:text-2xl dark:text-slate-100"
          style={{ textAlign: rtl ? "right" : "left" }}
        >
          {locale === "ar" ? "آخر البودكاست" : "Derniers podcasts"}
        </h2>
        <Link
          href={`/${locale}/category/podcast`}
          className="text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
        >
          {locale === "ar" ? "جميع البودكاست" : "Tous les podcasts"} →
        </Link>
      </div>

      <motion.div
        className="flex gap-4 overflow-x-auto pb-4"
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {podcasts.slice(0, 4).map((podcast) => {
          const title = podcast.title[locale as "fr" | "ar"];
          const excerpt = podcast.excerpt[locale as "fr" | "ar"];
          const date = podcast.publishedAt
            ? new Date(podcast.publishedAt).toLocaleDateString(
                locale === "fr" ? "fr-TN" : "ar-TN",
                { year: "numeric", month: "long", day: "numeric" }
              )
            : null;

          return (
            <Link
              key={podcast.id}
              href={`/${locale}/article/${podcast.slug}`}
              className="group w-64 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-green-700 to-emerald-800">
                {podcast.coverImage ? (
                  <img
                    src={podcast.coverImage}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <svg
                      className="h-12 w-12 text-white/30"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 1a9 9 0 00-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                )}
                {podcast.audioUrl && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600/90 text-white shadow-lg backdrop-blur-sm">
                      <svg
                        className="ml-0.5 h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-800 transition-colors group-hover:text-green-700 dark:text-slate-200 dark:group-hover:text-green-400">
                  {title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-slate-400">
                  {excerpt}
                </p>
                {date && (
                  <span className="mt-2 block text-xs text-gray-400 dark:text-slate-500">
                    {date}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </motion.div>
    </section>
  );
}
