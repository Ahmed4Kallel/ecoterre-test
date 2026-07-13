"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from "@/lib/i18n";
import type { Category, Article } from "@/lib/types";
import OptimizedImage from "@/components/ui/OptimizedImage";

interface CategorySectionProps {
  category: Category;
  articles: Article[];
  locale: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
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

export default function CategorySection({
  category,
  articles,
  locale,
}: CategorySectionProps) {
  const { dir, t } = useLocale();
  const rtl = dir === "rtl";
  const displayName = category.name[locale as "fr" | "ar"];

  if (articles.length === 0) return null;

  const heroArticle = articles[0];
  const gridArticles = articles.slice(1, 4);

  return (
    <section dir={dir}>
      <div className="mb-6 flex items-center justify-between border-l-4 border-green-700 pl-4">
        <motion.h2
          className="text-xl font-extrabold text-gray-900 sm:text-2xl dark:text-slate-100"
          style={{ textAlign: rtl ? "right" : "left" }}
          initial={{ opacity: 0, x: rtl ? 20 : -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {displayName}
        </motion.h2>
        <Link
          href={`/${locale}/category/${category.slug}`}
          className="text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
        >
          {t("see_all")} →
        </Link>
      </div>

      {/* Hero + Side Grid */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {/* Hero article - spans 2 cols */}
        <motion.div className="sm:col-span-2 sm:row-span-2" variants={cardVariants}>
          <Link
            href={`/${locale}/article/${heroArticle.slug}`}
            className="group relative flex h-full min-h-[280px] flex-col justify-end overflow-hidden rounded-xl"
          >
            {heroArticle.coverImage ? (
              <OptimizedImage
                src={heroArticle.coverImage}
                alt={heroArticle.title[locale as "fr" | "ar"]}
                fill
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-green-800 to-blue-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="relative z-10 p-5">
              <span className="mb-2 inline-block rounded-full bg-green-600/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                {displayName}
              </span>
              <h3 className="mb-2 text-lg font-extrabold leading-tight text-white sm:text-xl">
                {heroArticle.title[locale as "fr" | "ar"]}
              </h3>
              <p className="line-clamp-2 text-sm text-gray-200">
                {heroArticle.excerpt[locale as "fr" | "ar"]}
              </p>
            </div>
          </Link>
        </motion.div>

        {/* Grid articles - spans 1 col each */}
        {gridArticles.map((article) => (
          <motion.div key={article.id} variants={cardVariants}>
            <Link
              href={`/${locale}/article/${article.slug}`}
              className="group relative flex h-full min-h-[130px] flex-col justify-end overflow-hidden rounded-xl"
            >
              {article.coverImage ? (
                <OptimizedImage
                  src={article.coverImage}
                  alt={article.title[locale as "fr" | "ar"]}
                  fill
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-green-800 to-blue-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="relative z-10 p-4">
                <span className="mb-1 inline-block rounded-full bg-green-600/80 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                  {displayName}
                </span>
                <h3 className="text-sm font-bold leading-snug text-white">
                  {article.title[locale as "fr" | "ar"]}
                </h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
