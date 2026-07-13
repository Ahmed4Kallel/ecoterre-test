"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from "@/lib/i18n";
import type { Article } from "@/lib/types";
import OptimizedImage from "@/components/ui/OptimizedImage";

interface HeroSectionProps {
  article: Article;
  locale: string;
}

export default function HeroSection({ article, locale }: HeroSectionProps) {
  const { dir, t } = useLocale();
  const rtl = dir === "rtl";
  const title = article.title[locale as "fr" | "ar"];
  const excerpt = article.excerpt[locale as "fr" | "ar"];
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString(
        locale === "fr" ? "fr-TN" : "ar-TN",
        { year: "numeric", month: "long", day: "numeric" }
      )
    : null;

  return (
    <section className="relative min-h-[420px] overflow-hidden bg-gray-900 sm:min-h-[500px]" dir={dir}>
      {article.coverImage && (
        <>
          <OptimizedImage
            src={article.coverImage}
            alt={title}
            fill
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-green-900/95 via-green-900/60 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </>
      )}

      {!article.coverImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-green-800 via-green-900 to-blue-900" />
      )}

      <div className="relative mx-auto flex h-full max-w-5xl flex-col items-start justify-end px-4 pb-10 pt-32 sm:pb-16 sm:pt-44 lg:pb-20 lg:pt-56">
        <Link
          href={`/${locale}/article/${article.slug}`}
          className="group block max-w-3xl text-white"
          style={{ textAlign: rtl ? "right" : "left" }}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-3"
          >
            <span className="inline-block rounded-full bg-green-600/90 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              {article.authorName || "Ecoterre"}
            </span>
          </motion.div>

          <motion.h1
            className="mb-3 text-2xl font-extrabold leading-tight drop-shadow-lg sm:text-3xl lg:text-5xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          >
            {title}
          </motion.h1>

          <motion.p
            className="mb-5 text-sm leading-relaxed text-gray-200 drop-shadow sm:text-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          >
            {excerpt}
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-md bg-green-700 px-5 py-3 text-sm font-semibold transition-colors hover:bg-green-600">
              {t("read_more")}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={rtl ? "rotate-180" : ""}
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </span>
            {date && (
              <span className="text-sm text-green-200">
                {date}
                {article.readingTime ? (
                  <> · {article.readingTime} {t("min_read")}</>
                ) : null}
              </span>
            )}
          </motion.div>
        </Link>
      </div>
    </section>
  );
}
