"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from "@/lib/i18n";
import type { Article, Category } from "@/lib/types";
import OptimizedImage from "@/components/ui/OptimizedImage";

interface FeaturedGridProps {
  articles: Article[];
  locale: string;
  categories?: Category[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function FeaturedGrid({
  articles,
  locale,
  categories,
}: FeaturedGridProps) {
  const { dir, t } = useLocale();
  const rtl = dir === "rtl";

  if (articles.length === 0) return null;

  const main = articles[0];
  const rest = articles.slice(1, 4);

  const getTitle = (a: Article) => a.title[locale as "fr" | "ar"];
  const getExcerpt = (a: Article) => a.excerpt[locale as "fr" | "ar"];
  const getCategoryName = (article: Article): string => {
    const cat = (categories ?? []).find((c) => article.categoryIds?.includes(c.id));
    return cat ? cat.name[locale as "fr" | "ar"] : (locale === "fr" ? "Écologie" : "البيئة");
  };

  return (
    <section dir={dir}>
      <div className="mb-6 flex items-center border-b-2 border-green-800 pb-2">
        <h2
          className="text-xl font-extrabold text-green-800 sm:text-2xl"
          style={{ textAlign: rtl ? "right" : "left" }}
        >
          {locale === "ar" ? "الأكثر تميزاً" : "À la une"}
        </h2>
      </div>

      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {/* Main featured - spans 2 cols */}
        <motion.div
          className="sm:col-span-2 sm:row-span-2"
          variants={itemVariants}
        >
          <Link
            href={`/${locale}/article/${main.slug}`}
            className="group relative flex h-full min-h-[320px] flex-col justify-end overflow-hidden rounded-xl"
          >
            {main.coverImage ? (
              <OptimizedImage
                src={main.coverImage}
                alt={getTitle(main)}
                fill
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-green-800 to-blue-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="relative z-10 p-6">
              <span className="mb-2 inline-block rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                {getCategoryName(main) || "Ecoterre"}
              </span>
              <h3 className="mb-2 text-xl font-extrabold leading-tight text-white sm:text-2xl">
                {getTitle(main)}
              </h3>
              <p className="line-clamp-2 text-sm text-gray-200">
                {getExcerpt(main)}
              </p>
            </div>
          </Link>
        </motion.div>

        {/* Remaining featured items */}
        {rest.map((article) => (
          <motion.div key={article.id} variants={itemVariants}>
            <Link
              href={`/${locale}/article/${article.slug}`}
              className="group relative flex h-full min-h-[150px] flex-col justify-end overflow-hidden rounded-xl"
            >
              {article.coverImage ? (
                <OptimizedImage
                  src={article.coverImage}
                  alt={getTitle(article)}
                  fill
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-green-800 to-blue-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="relative z-10 p-4">
                <span className="mb-1 inline-block rounded-full bg-green-600/80 px-2 py-0.5 text-[10px] font-semibold text-white">
                  {getCategoryName(article) || "Ecoterre"}
                </span>
                <h3 className="text-sm font-bold leading-snug text-white">
                  {getTitle(article)}
                </h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
