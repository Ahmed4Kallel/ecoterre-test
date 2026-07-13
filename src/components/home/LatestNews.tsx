"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from "@/lib/i18n";
import type { Article } from "@/lib/types";

interface LatestNewsProps {
  articles: Article[];
  locale: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function LatestNews({ articles, locale }: LatestNewsProps) {
  const { dir, t } = useLocale();
  const rtl = dir === "rtl";

  if (articles.length === 0) {
    return (
      <section className="py-10">
        <p className="py-12 text-center text-gray-500">{t("no_articles")}</p>
      </section>
    );
  }

  return (
    <section dir={dir}>
      <div className="mb-6 flex items-center justify-between border-l-4 border-green-700 pl-4">
        <h2
          className="text-xl font-extrabold text-gray-900 sm:text-2xl dark:text-slate-100"
          style={{ textAlign: rtl ? "right" : "left" }}
        >
          {t("latest_news")}
        </h2>
        <Link
          href={`/${locale}/search`}
          className="text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
        >
          {t("see_all")} →
        </Link>
      </div>

      <motion.div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {articles.map((article) => {
          const title = article.title[locale as "fr" | "ar"];
          const excerpt = article.excerpt[locale as "fr" | "ar"];
          const date = article.publishedAt
            ? new Date(article.publishedAt).toLocaleDateString(
                locale === "fr" ? "fr-TN" : "ar-TN",
                { year: "numeric", month: "long", day: "numeric" }
              )
            : null;

          return (
            <motion.div key={article.id} variants={cardVariants}>
              <Link
                href={`/${locale}/article/${article.slug}`}
                className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-green-700 via-green-800 to-blue-900">
                  {article.coverImage ? (
                    <img
                      src={article.coverImage}
                      alt={title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-3xl font-extrabold text-white/20">
                        Ecoterre
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-green-600/90 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                      {article.authorName || "Ecoterre"}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3
                    className="mb-2 line-clamp-2 text-base font-bold leading-snug text-gray-900 transition-colors group-hover:text-green-700 dark:text-slate-100 dark:group-hover:text-green-400"
                    style={{ textAlign: rtl ? "right" : "left" }}
                  >
                    {title}
                  </h3>
                  <p
                    className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-slate-400"
                    style={{ textAlign: rtl ? "right" : "left" }}
                  >
                    {excerpt}
                  </p>
                  <div
                    className="flex items-center justify-between text-xs text-gray-400 dark:text-slate-500"
                    style={{ direction: rtl ? "rtl" : "ltr" }}
                  >
                    <span>{article.authorName || "Ecoterre"}</span>
                    <div className="flex items-center gap-3">
                      {article.readingTime ? (
                        <span>{article.readingTime} {t("min_read")}</span>
                      ) : null}
                      {date && <span>{date}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
