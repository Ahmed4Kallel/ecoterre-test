"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from "@/lib/i18n";
import type { Article } from "@/lib/types";

interface ReportsPreviewProps {
  reports: Article[];
  locale: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function ReportsPreview({
  reports,
  locale,
}: ReportsPreviewProps) {
  const { dir } = useLocale();
  const rtl = dir === "rtl";

  if (reports.length === 0) return null;

  return (
    <section dir={dir}>
      <div className="mb-6 flex items-center justify-between border-l-4 border-blue-700 pl-4">
        <h2
          className="text-xl font-extrabold text-gray-900 sm:text-2xl dark:text-slate-100"
          style={{ textAlign: rtl ? "right" : "left" }}
        >
          {locale === "ar" ? "آخر التقارير" : "Derniers rapports"}
        </h2>
        <Link
          href={`/${locale}/category/rapports`}
          className="text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors"
        >
          {locale === "ar" ? "جميع التقارير" : "Voir tous les rapports"} →
        </Link>
      </div>

      <motion.div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {reports.slice(0, 3).map((report) => {
          const title = report.title[locale as "fr" | "ar"];
          const excerpt = report.excerpt[locale as "fr" | "ar"];
          const date = report.publishedAt
            ? new Date(report.publishedAt).toLocaleDateString(
                locale === "fr" ? "fr-TN" : "ar-TN",
                { year: "numeric", month: "long", day: "numeric" }
              )
            : null;

          return (
            <motion.div key={report.id} variants={itemVariants}>
              <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                <Link href={`/${locale}/article/${report.slug}`}>
                  <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-blue-700 to-indigo-800">
                    {report.coverImage ? (
                      <img
                        src={report.coverImage}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <svg
                          className="h-14 w-14 text-white/30"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 13h8v2H8v-2zm0 4h8v2H8v-2zm0-8h5v2H8V9z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-blue-700 shadow backdrop-blur-sm">
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      PDF
                    </div>
                  </div>
                </Link>
                <div className="p-4">
                  <Link href={`/${locale}/article/${report.slug}`}>
                    <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-800 transition-colors group-hover:text-blue-700 dark:text-slate-200 dark:group-hover:text-blue-400">
                      {title}
                    </h3>
                  </Link>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-slate-400">
                    {excerpt}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-400 dark:text-slate-500">
                    <span>{report.authorName || "Ecoterre"}</span>
                    {date && <span>{date}</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
