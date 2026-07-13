"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Article } from "@/lib/types";
import OptimizedImage from "@/components/ui/OptimizedImage";

interface ReportCardProps {
  report: Article;
  locale: string;
}

export default function ReportCard({ report, locale }: ReportCardProps) {
  const title = report.title[locale as "fr" | "ar"];
  const excerpt = report.excerpt[locale as "fr" | "ar"];
  const date = report.publishedAt
    ? new Date(report.publishedAt).toLocaleDateString(
        locale === "fr" ? "fr-TN" : "ar-TN",
        { year: "numeric", month: "long", day: "numeric" }
      )
    : null;

  const downloadCount = report.downloadCount || 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="group rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
    >
      <Link href={`/${locale}/article/${report.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-blue-700 to-indigo-800">
          {report.coverImage ? (
            <OptimizedImage
              src={report.coverImage}
              alt={title}
              fill
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg className="h-16 w-16 text-white/30" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 13h8v2H8v-2zm0 4h8v2H8v-2zm0-8h5v2H8V9z" />
              </svg>
            </div>
          )}

          <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-blue-700 backdrop-blur-sm shadow">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            PDF
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/${locale}/article/${report.slug}`}>
          <h3 className="mb-2 line-clamp-2 text-base font-bold leading-snug text-gray-900 transition-colors group-hover:text-blue-700 dark:text-slate-100 dark:group-hover:text-blue-400">
            {title}
          </h3>
        </Link>
        <p className="mb-3 line-clamp-2 text-sm text-gray-500 dark:text-slate-400">{excerpt}</p>
        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-slate-500">
          <span>{report.authorName || "Ecoterre"}</span>
          <div className="flex items-center gap-3">
            {date && <span>{date}</span>}
            <span className="flex items-center gap-1">
              <motion.svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </motion.svg>
              {downloadCount}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
