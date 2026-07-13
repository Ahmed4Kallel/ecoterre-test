"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useLocale } from "@/lib/i18n";
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
    const start = performance.now();
    const animate = (time: number) => {
      const elapsed = (time - start) / 1000;
      const progress = Math.min(elapsed / 0.8, 1);
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
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{t("dashboard_title")}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{t("dashboard_subtitle")}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-green-700 hover:to-emerald-800 hover:shadow-md"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t("new_article")}
          </Link>
          <Link
            href="/admin/categories/new"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t("new_category")}
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("total_articles")}
          value={stats.totalArticles}
          icon="articles"
          gradient="from-blue-500 to-blue-600"
          badge={t("total")}
        />
        <StatCard
          label={t("published_articles")}
          value={stats.publishedArticles}
          icon="published"
          gradient="from-green-500 to-emerald-600"
          badge={stats.totalArticles > 0 ? `${Math.round((stats.publishedArticles / stats.totalArticles) * 100)}%` : "0%"}
        />
        <StatCard
          label={t("draft_articles")}
          value={stats.draftArticles}
          icon="draft"
          gradient="from-amber-500 to-orange-600"
          badge={t("pending")}
        />
        <StatCard
          label={t("total_categories")}
          value={stats.totalCategories}
          icon="categories"
          gradient="from-purple-500 to-violet-600"
          badge={t("active")}
        />
        {stats.totalUsers !== undefined && (
          <StatCard
            label={t("total_users")}
            value={stats.totalUsers}
            icon="users"
            gradient="from-indigo-500 to-indigo-600"
            badge={t("registered")}
          />
        )}
        {stats.totalViews !== undefined && (
          <StatCard
            label={t("total_views")}
            value={stats.totalViews}
            icon="views"
            gradient="from-cyan-500 to-teal-600"
            badge={t("all_time")}
          />
        )}
        {stats.commentsPending !== undefined && (
          <StatCard
            label={t("comments_pending")}
            value={stats.commentsPending}
            icon="comments"
            gradient="from-orange-500 to-red-600"
            badge={t("awaiting")}
          />
        )}
        {stats.subscribersCount !== undefined && (
          <StatCard
            label={t("subscribers")}
            value={stats.subscribersCount}
            icon="newsletter"
            gradient="from-pink-500 to-rose-600"
            badge={t("active")}
          />
        )}
      </div>

      {/* Articles by category */}
      {stats.articlesByCategory && stats.articlesByCategory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              {t("articles_by_category")}
            </h2>
            <span className="text-xs text-gray-400 dark:text-slate-500">
              {stats.articlesByCategory.length} {t("categories").toLowerCase()}
            </span>
          </div>
          <div className="space-y-3">
            {stats.articlesByCategory.map((item, idx) => {
              const pct = maxCategoryCount > 0 ? Math.round((item.count / maxCategoryCount) * 100) : 0;
              const colors = [
                "from-green-500 to-emerald-500",
                "from-blue-500 to-cyan-500",
                "from-purple-500 to-violet-500",
                "from-amber-500 to-orange-500",
                "from-rose-500 to-pink-500",
                "from-teal-500 to-green-500",
                "from-indigo-500 to-blue-500",
                "from-red-500 to-rose-500",
              ];
              const barColor = colors[idx % colors.length];
              return (
                <div key={item.categoryName} className="group flex items-center gap-4">
                  <span className="w-32 truncate text-sm font-medium text-gray-700 dark:text-slate-300">
                    {item.categoryName}
                  </span>
                  <div className="flex-1">
                    <div className="h-2.5 rounded-full bg-gray-100 dark:bg-slate-700">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.1 * idx, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                  <span className="w-8 text-right text-sm font-semibold text-gray-800 dark:text-slate-200">
                    {item.count}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Recent articles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            {t("recent_articles")}
          </h2>
          <Link
            href="/admin/articles"
            className="text-sm font-medium text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
          >
            {t("see_all")} &rarr;
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 dark:border-slate-700 dark:bg-slate-800/50">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    {t("title")}
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    {t("status")}
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    {t("author")}
                  </th>
                  <th className="hidden px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 md:table-cell">
                    {t("date")}
                  </th>
                  <th className="px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {recentArticles.map((article, idx) => (
                  <motion.tr
                    key={article.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * idx }}
                    className="group hover:bg-gray-50/80 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {article.coverImage && (
                          <img
                            src={article.coverImage}
                            alt=""
                            className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900 dark:text-slate-100 max-w-[240px]">
                            {article.title.fr}
                          </p>
                          {article.categoryNames && article.categoryNames.length > 0 && (
                            <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-500">
                              {article.categoryNames.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={article.status} />
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-400">
                      {article.authorName}
                    </td>
                    <td className="hidden px-5 py-4 text-sm text-gray-500 dark:text-slate-400 md:table-cell">
                      {formatDate(article.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-green-700 opacity-0 transition-all hover:bg-green-50 group-hover:opacity-100 dark:text-green-400 dark:hover:bg-green-900/30"
                      >
                        {t("edit")}
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </td>
                  </motion.tr>
                ))}
                {recentArticles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-gray-500 dark:text-slate-400">
                      <svg className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                      {t("no_articles")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const statIcons: Record<string, React.ReactNode> = {
  articles: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  published: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  draft: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  categories: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  users: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  views: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  comments: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  newsletter: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
};

function StatCard({
  label,
  value,
  icon,
  gradient,
  badge,
}: {
  label: string;
  value: number;
  icon: string;
  gradient: string;
  badge?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">
            {label}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-slate-100">
            <AnimatedNumber value={value} />
          </p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}>
          {statIcons[icon] || statIcons.articles}
        </div>
      </div>
      {badge && (
        <div className="mt-3">
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-slate-700 dark:text-slate-300">
            {badge}
          </span>
        </div>
      )}
      <div className={`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r ${gradient} scale-x-0 transition-transform group-hover:scale-x-100`} />
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useLocale();
  const isPublished = status === "published";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        isPublished
          ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
          : "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isPublished ? "bg-green-500" : "bg-gray-400 dark:bg-slate-500"
        }`}
      />
      {isPublished ? t("published") : t("draft")}
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
