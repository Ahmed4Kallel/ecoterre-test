"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from "@/lib/i18n";
import type { Article } from "@/lib/types";
import OptimizedImage from "@/components/ui/OptimizedImage";

interface ArticleCardProps {
  article: Article;
  locale: string;
}

export default function ArticleCard({ article, locale }: ArticleCardProps) {
  const { dir } = useLocale();
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
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <Link
        href={`/${locale}/article/${article.slug}`}
        className="group block overflow-hidden rounded-lg bg-white shadow-md transition-shadow"
        dir={dir}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-green-700 via-green-800 to-blue-900">
          {article.coverImage ? (
            <OptimizedImage
              src={article.coverImage}
              alt={title}
              fill
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-4xl font-extrabold text-white/20">
                E<span className="text-green-300/30">co</span>terre
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          {article.status === "draft" && (
            <span className="mb-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
              Brouillon
            </span>
          )}

          <h3
            className="mb-2 line-clamp-2 text-base font-bold leading-snug text-gray-900 transition-colors group-hover:text-green-700"
            style={{ textAlign: rtl ? "right" : "left" }}
          >
            {title}
          </h3>

          <p
            className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-500"
            style={{ textAlign: rtl ? "right" : "left" }}
          >
            {excerpt}
          </p>

          <div
            className="flex items-center justify-between text-xs text-gray-400"
            style={{ direction: rtl ? "rtl" : "ltr" }}
          >
            <span>{article.authorName || "Ecoterre"}</span>
            {date && <span>{date}</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
