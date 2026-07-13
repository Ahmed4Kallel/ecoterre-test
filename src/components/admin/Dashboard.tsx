"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useLocale } from "@/lib/i18n";
import Button from "@/components/ui/Button";
import type { Article, Category } from "@/lib/types";

interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalCategories: number;
  totalUsers?: number;
  totalViews?: number;
  commentsPending?: number;
  subscribersCount?: number;
  contactMessagesUnread?: number;
  topArticles?: Article[];
  articlesByCategory?: { categoryName: string; count: number }[];
}

interface DashboardProps {
  stats: DashboardStats;
  recentArticles: (Article & { categoryNames?: string[] })[];
  categories: Category[];
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
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const chartBarVariants = {
  hidden: { height: 0 },
  visible: (pct: number) => ({
    height: `${pct}%`,
    transition: { duration: 0.6, delay: 0.2, ease: "easeOut" as const },
  }),
};

function AnimatedNumber({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => setDisplayValue(v as number));
    motionValue.set(value);
    const timer = setTimeout(() => unsubscribe, 100);
    return () => clearTimeout(timer);
  }, [value, motionValue, rounded]);

  useEffect(() => {
    motionValue.set(0);
    const controls = { to: value, duration: 0.8 };
    const start = performance.now();
    const animate = (time: number) => {
      const elapsed = (time - start) / 1000;
      const progress = Math.min(elapsed / controls.duration, 1);
      motionValue.set(Math.round(progress * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, motionValue]);

  return <span>{displayValue}</span>;
}

export default function Dashboard({ stats, recentArticles }: DashboardProps) {
  const { t } = useLocale();

  const maxCategoryCount =
    stats.articlesByCategory && stats.articlesByCategory.length > 0
      ? Math.max(...stats.articlesByCategory.map((c) => c.count))
      : 1;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{t("dashboard_title")}</h1>
        <div className="flex gap-3">
          <Button href="/admin/articles/new" size="sm">
            + {t("new_article")}
          </Button>
          <Button href="/admin/categories/new" variant="outline" size="sm">
            + {t("new_category")}
          </Button>
        </div>
      </div>

      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={cardVariants}>
          <StatCard
            label={t("total_articles")}
            value={stats.totalArticles}
            color="bg-blue-50 text-blue-800"
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <StatCard
            label={t("published_articles")}
            value={stats.publishedArticles}
            color="bg-green-50 text-green-800"
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <StatCard
            label={t("draft_articles")}
            value={stats.draftArticles}
            color="bg-amber-50 text-amber-800"
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <StatCard
            label={t("total_categories")}
            value={stats.totalCategories}
            color="bg-purple-50 text-purple-800"
          />
        </motion.div>
        {stats.totalUsers !== undefined && (
          <motion.div variants={cardVariants}>
            <StatCard
              label={t("total_users")}
              value={stats.totalUsers}
              color="bg-indigo-50 text-indigo-800"
            />
          </motion.div>
        )}
        {stats.totalViews !== undefined && (
          <motion.div variants={cardVariants}>
            <StatCard
              label={t("total_views")}
              value={stats.totalViews}
              color="bg-cyan-50 text-cyan-800"
            />
          </motion.div>
        )}
        {stats.commentsPending !== undefined && (
          <motion.div variants={cardVariants}>
            <StatCard
              label={t("comments_pending")}
              value={stats.commentsPending}
              color="bg-orange-50 text-orange-800"
            />
          </motion.div>
        )}
        {stats.subscribersCount !== undefined && (
          <motion.div variants={cardVariants}>
            <StatCard
              label={t("subscribers")}
              value={stats.subscribersCount}
              color="bg-pink-50 text-pink-800"
            />
          </motion.div>
        )}
      </motion.div>

      {stats.articlesByCategory && stats.articlesByCategory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
            {t("articles_by_category")}
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-3 dark:border-slate-700 dark:bg-slate-900">
            {stats.articlesByCategory.map((item) => {
              const pct =
                maxCategoryCount > 0
                  ? Math.round((item.count / maxCategoryCount) * 100)
                  : 0;
              return (
                <div key={item.categoryName} className="flex items-center gap-3">
                  <span className="w-28 text-sm text-gray-600 truncate dark:text-slate-400">
                    {item.categoryName}
                  </span>
                  <div className="flex-1 h-5 rounded-full bg-gray-100 overflow-hidden dark:bg-slate-700">
                    <motion.div
                      className="h-full rounded-full bg-green-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-medium text-gray-700 dark:text-slate-300">
                    {item.count}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
      >
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
          {t("recent_articles")}
        </h2>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">{t("title")}</th>
                <th className="px-4 py-3 font-medium">{t("status")}</th>
                <th className="px-4 py-3 font-medium">{t("author")}</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">
                  {t("date")}
                </th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {recentArticles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate dark:text-slate-100">
                    {article.title.fr}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={article.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-slate-400">
                    {article.authorName}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell dark:text-slate-400">
                    {formatDate(article.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      className="text-sm text-green-700 hover:text-green-800 hover:underline dark:text-green-400 dark:hover:text-green-300"
                    >
                      {t("edit")}
                    </Link>
                  </td>
                </tr>
              ))}
              {recentArticles.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500 dark:text-slate-400"
                  >
                    {t("no_articles")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
        {recentArticles.length > 0 && (
          <div className="mt-3 text-right">
            <Link
              href="/admin/articles"
              className="text-sm text-green-700 hover:underline dark:text-green-400"
            >
              {t("see_all")} &rarr;
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`rounded-lg p-5 ${color}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="mt-1 text-3xl font-bold">
        <AnimatedNumber value={value} />
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useLocale();
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        status === "published"
          ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
          : "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300"
      }`}
    >
      {status === "published" ? t("published") : t("draft")}
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
