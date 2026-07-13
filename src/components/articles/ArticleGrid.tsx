"use client";

import { motion } from "framer-motion";
import ArticleCard from "./ArticleCard";
import { useLocale } from "@/lib/i18n";
import type { Article } from "@/lib/types";

interface ArticleGridProps {
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
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function ArticleGrid({ articles, locale }: ArticleGridProps) {
  const { t } = useLocale();

  if (articles.length === 0) {
    return (
      <p className="py-12 text-center text-gray-500">{t("no_articles")}</p>
    );
  }

  return (
    <motion.div
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      {articles.map((article) => (
        <motion.div key={article.id} variants={cardVariants}>
          <ArticleCard article={article} locale={locale} />
        </motion.div>
      ))}
    </motion.div>
  );
}
